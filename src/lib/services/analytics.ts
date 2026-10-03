// Aggregated Dhaka-month analytics for the admin dashboard.
// Prisma groupBy/aggregate queries avoid loading appointment or expense rows.
import "server-only";
import { Temporal } from "temporal-polyfill";
import { prisma } from "@/lib/prisma";
import { DHAKA_TIME_ZONE, getDhakaToday } from "@/lib/dhaka-time";

export type DashboardAnalytics = {
  monthLabel: string;
  patientCount: number;
  income: number;
  expenses: number;
  payouts: number;
  net: number;
  daily: { day: number; income: number; expenses: number }[];
  cumulativeIncome: { day: number; current: number; previous: number }[];
  previousMonthLabel: string;
  comparison: {
    income: { current: number; previous: number; changePercent: number | null };
    expenses: {
      current: number;
      previous: number;
      changePercent: number | null;
    };
    patients: {
      current: number;
      previous: number;
      changePercent: number | null;
    };
    net: { current: number; previous: number; changePercent: number | null };
  };
  monthly: {
    month: string;
    income: number;
    expenses: number;
    payouts: number;
  }[];
  topTherapists: { id: string; name: string; fee: number }[];
};

export type TodayDashboardSummary = {
  date: string;
  appointments: {
    id: string;
    serial: number;
    patient: string;
    therapist: string;
    service: string;
    fee: number;
    createdBy: string;
  }[];
  income: number;
  expenseRows: {
    id: string;
    name: string;
    amount: number;
    createdBy: string;
  }[];
  expenses: number;
  payoutRows: { id: string; therapist: string; amount: number }[];
  payouts: number;
  closing: number;
};

function dhakaMidnight(date: Temporal.PlainDate) {
  return date.toPlainDateTime("00:00");
}

function payoutTimestampBoundary(date: Temporal.PlainDate) {
  return date
    .toZonedDateTime(DHAKA_TIME_ZONE)
    .toInstant()
    .toZonedDateTimeISO("UTC")
    .toPlainDateTime();
}

function addToMap(
  map: Map<string, number>,
  key: string,
  amount: number | null,
) {
  map.set(key, (map.get(key) ?? 0) + (amount ?? 0));
}

function changePercent(current: number, previous: number) {
  return previous === 0
    ? null
    : Math.round(((current - previous) / previous) * 1000) / 10;
}

function monthLabel(month: string) {
  const date = Temporal.PlainDate.from(`${month}-01`);
  return `${date.toLocaleString("en-BD", { month: "short" })} '${month.slice(2, 4)}`;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const today = getDhakaToday();
  const currentMonthStart = today.with({ day: 1 });
  const nextMonthStart = currentMonthStart.add({ months: 1 });
  const previousMonthStart = currentMonthStart.subtract({ months: 1 });
  const historyStart = currentMonthStart.subtract({ months: 5 });
  const monthKeys: string[] = [];

  for (
    let month = historyStart;
    Temporal.PlainDate.compare(month, nextMonthStart) < 0;
    month = month.add({ months: 1 })
  ) {
    monthKeys.push(month.toString().slice(0, 7));
  }

  const appointmentRows = await prisma.orm.public.Appointment.where(
    (appointment) => appointment.serialDate.gte(historyStart),
  )
    .where((appointment) => appointment.serialDate.lt(nextMonthStart))
    .where((appointment) => appointment.deletedAt.isNull())
    .groupBy("serialDate")
    .aggregate((aggregate) => ({ income: aggregate.sum("fee") }));

  const expenseRows = await prisma.orm.public.Expense.where((expense) =>
    expense.expenseDate.gte(dhakaMidnight(historyStart)),
  )
    .where((expense) => expense.expenseDate.lt(dhakaMidnight(nextMonthStart)))
    .groupBy("expenseDate")
    .aggregate((aggregate) => ({ expenses: aggregate.sum("amount") }));

  const currentPatients = await prisma.orm.public.Appointment.where(
    (appointment) => appointment.serialDate.gte(currentMonthStart),
  )
    .where((appointment) => appointment.serialDate.lt(nextMonthStart))
    .where((appointment) => appointment.deletedAt.isNull())
    .groupBy("patientId")
    .aggregate((aggregate) => ({ visits: aggregate.count() }));

  const previousPatients = await prisma.orm.public.Appointment.where(
    (appointment) => appointment.serialDate.gte(previousMonthStart),
  )
    .where((appointment) => appointment.serialDate.lt(currentMonthStart))
    .where((appointment) => appointment.deletedAt.isNull())
    .groupBy("patientId")
    .aggregate((aggregate) => ({ visits: aggregate.count() }));

  const therapistFees = await prisma.orm.public.Appointment.where(
    (appointment) => appointment.serialDate.gte(currentMonthStart),
  )
    .where((appointment) => appointment.serialDate.lt(nextMonthStart))
    .where((appointment) => appointment.deletedAt.isNull())
    .groupBy("therapistId")
    .aggregate((aggregate) => ({ fee: aggregate.sum("fee") }));

  const payoutTotals = await Promise.all(
    monthKeys.map(async (month) => {
      const monthDate = Temporal.PlainDate.from(`${month}-01`);
      const start = payoutTimestampBoundary(monthDate);
      const end = payoutTimestampBoundary(monthDate.add({ months: 1 }));
      const result = await prisma.orm.public.TherapistPayout.where((payout) =>
        payout.createdAt.gte(start),
      )
        .where((payout) => payout.createdAt.lt(end))
        .aggregate((aggregate) => ({ total: aggregate.sum("amount") }));
      return [month, result.total ?? 0] as const;
    }),
  );

  const monthPayoutMap = new Map(payoutTotals);
  const incomeByDay = new Map<string, number>();
  const expensesByDay = new Map<string, number>();
  const incomeByMonth = new Map<string, number>();
  const expensesByMonth = new Map<string, number>();

  for (const row of appointmentRows) {
    const day = row.serialDate.toString();
    addToMap(incomeByDay, day, row.income);
    addToMap(incomeByMonth, day.slice(0, 7), row.income);
  }
  for (const row of expenseRows) {
    const day = row.expenseDate.toPlainDate().toString();
    addToMap(expensesByDay, day, row.expenses);
    addToMap(expensesByMonth, day.slice(0, 7), row.expenses);
  }

  const daily = [];
  for (
    let day = currentMonthStart;
    Temporal.PlainDate.compare(day, nextMonthStart) < 0;
    day = day.add({ days: 1 })
  ) {
    const key = day.toString();
    daily.push({
      day: day.day,
      income: incomeByDay.get(key) ?? 0,
      expenses: expensesByDay.get(key) ?? 0,
    });
  }

  const currentMonthIncome =
    incomeByMonth.get(currentMonthStart.toString().slice(0, 7)) ?? 0;
  const previousMonthIncome =
    incomeByMonth.get(previousMonthStart.toString().slice(0, 7)) ?? 0;
  const currentMonthExpenses =
    expensesByMonth.get(currentMonthStart.toString().slice(0, 7)) ?? 0;
  const previousMonthExpenses =
    expensesByMonth.get(previousMonthStart.toString().slice(0, 7)) ?? 0;
  const currentMonthPayouts =
    monthPayoutMap.get(currentMonthStart.toString().slice(0, 7)) ?? 0;
  const previousMonthPayouts =
    monthPayoutMap.get(previousMonthStart.toString().slice(0, 7)) ?? 0;
  const currentMonthPatients = currentPatients.length;
  const previousMonthPatientCount = previousPatients.length;
  const currentMonthNet =
    currentMonthIncome - currentMonthExpenses - currentMonthPayouts;
  const previousMonthNet =
    previousMonthIncome - previousMonthExpenses - previousMonthPayouts;

  const cumulativeIncome = [];
  let currentCumulative = 0;
  let previousCumulative = 0;
  const comparisonDays = Math.max(
    currentMonthStart.daysInMonth,
    previousMonthStart.daysInMonth,
  );
  for (let day = 1; day <= comparisonDays; day += 1) {
    if (day <= currentMonthStart.daysInMonth) {
      currentCumulative +=
        incomeByDay.get(currentMonthStart.with({ day }).toString()) ?? 0;
    }
    if (day <= previousMonthStart.daysInMonth) {
      previousCumulative +=
        incomeByDay.get(previousMonthStart.with({ day }).toString()) ?? 0;
    }
    cumulativeIncome.push({
      day,
      current: currentCumulative,
      previous: previousCumulative,
    });
  }

  const monthly = monthKeys.map((month) => ({
    month: monthLabel(month),
    income: incomeByMonth.get(month) ?? 0,
    expenses: expensesByMonth.get(month) ?? 0,
    payouts: monthPayoutMap.get(month) ?? 0,
  }));

  const topTherapists = therapistFees
    .map((item) => ({ id: item.therapistId, fee: item.fee ?? 0 }))
    .sort((left, right) => right.fee - left.fee)
    .slice(0, 5);
  const therapistNames = topTherapists.length
    ? await prisma.orm.public.Therapist.where((therapist) =>
        therapist.id.in(topTherapists.map((item) => item.id)),
      )
        .select("id", "name")
        .all()
    : [];
  const nameById = new Map(
    therapistNames.map((therapist) => [therapist.id, therapist.name]),
  );
  const topTherapistRows = topTherapists.map((therapist) => ({
    id: therapist.id,
    name: nameById.get(therapist.id) ?? "Unavailable",
    fee: therapist.fee,
  }));

  return {
    monthLabel: currentMonthStart.toLocaleString("en-BD", {
      month: "long",
      year: "numeric",
    }),
    patientCount: currentMonthPatients,
    income: currentMonthIncome,
    expenses: currentMonthExpenses,
    payouts: currentMonthPayouts,
    net: currentMonthNet,
    daily,
    cumulativeIncome,
    previousMonthLabel: monthLabel(previousMonthStart.toString().slice(0, 7)),
    comparison: {
      income: {
        current: currentMonthIncome,
        previous: previousMonthIncome,
        changePercent: changePercent(currentMonthIncome, previousMonthIncome),
      },
      expenses: {
        current: currentMonthExpenses,
        previous: previousMonthExpenses,
        changePercent: changePercent(
          currentMonthExpenses,
          previousMonthExpenses,
        ),
      },
      patients: {
        current: currentMonthPatients,
        previous: previousMonthPatientCount,
        changePercent: changePercent(
          currentMonthPatients,
          previousMonthPatientCount,
        ),
      },
      net: {
        current: currentMonthNet,
        previous: previousMonthNet,
        changePercent: changePercent(currentMonthNet, previousMonthNet),
      },
    },
    monthly,
    topTherapists: topTherapistRows,
  };
}

export async function getTodayDashboardSummary(): Promise<TodayDashboardSummary> {
  const today = getDhakaToday();
  const tomorrow = today.add({ days: 1 });
  const expenseStart = dhakaMidnight(today);
  const expenseEnd = dhakaMidnight(tomorrow);
  const payoutStart = payoutTimestampBoundary(today);
  const payoutEnd = payoutTimestampBoundary(tomorrow);

  const [
    appointments,
    incomeResult,
    expenses,
    expenseResult,
    payouts,
    payoutResult,
  ] = await Promise.all([
    prisma.orm.public.Appointment.where((appointment) =>
      appointment.serialDate.eq(today),
    )
      .where((appointment) => appointment.deletedAt.isNull())
      .include("patient", (patient) => patient.select("name"))
      .include("therapist", (therapist) => therapist.select("name"))
      .include("createdBy", (user) => user.select("name"))
      .orderBy((appointment) => appointment.serial.asc())
      .all(),
    prisma.orm.public.Appointment.where((appointment) =>
      appointment.serialDate.eq(today),
    )
      .where((appointment) => appointment.deletedAt.isNull())
      .aggregate((aggregate) => ({ total: aggregate.sum("fee") })),
    prisma.orm.public.Expense.where((expense) =>
      expense.expenseDate.gte(expenseStart),
    )
      .where((expense) => expense.expenseDate.lt(expenseEnd))
      .include("createdBy", (user) => user.select("name"))
      .orderBy((expense) => expense.expenseDate.desc())
      .all(),
    prisma.orm.public.Expense.where((expense) =>
      expense.expenseDate.gte(expenseStart),
    )
      .where((expense) => expense.expenseDate.lt(expenseEnd))
      .aggregate((aggregate) => ({ total: aggregate.sum("amount") })),
    prisma.orm.public.TherapistPayout.where((payout) =>
      payout.createdAt.gte(payoutStart),
    )
      .where((payout) => payout.createdAt.lt(payoutEnd))
      .include("therapist", (therapist) => therapist.select("name"))
      .orderBy((payout) => payout.createdAt.desc())
      .all(),
    prisma.orm.public.TherapistPayout.where((payout) =>
      payout.createdAt.gte(payoutStart),
    )
      .where((payout) => payout.createdAt.lt(payoutEnd))
      .aggregate((aggregate) => ({ total: aggregate.sum("amount") })),
  ]);

  const income = incomeResult.total ?? 0;
  const expensesTotal = expenseResult.total ?? 0;
  const payoutsTotal = payoutResult.total ?? 0;

  return {
    date: today.toString(),
    appointments: appointments.map((appointment) => ({
      id: appointment.id,
      serial: appointment.serial,
      patient: appointment.patient?.name ?? "Unavailable",
      therapist: appointment.therapist?.name ?? "Unavailable",
      service: (appointment.services ?? []).join(", "),
      fee: appointment.fee,
      createdBy: appointment.createdBy?.name ?? "Unavailable",
    })),
    income,
    expenseRows: expenses.map((expense) => ({
      id: expense.id,
      name: expense.name,
      amount: expense.amount,
      createdBy: expense.createdBy?.name ?? "Unavailable",
    })),
    expenses: expensesTotal,
    payoutRows: payouts.map((payout) => ({
      id: payout.id,
      therapist: payout.therapist?.name ?? "Unavailable",
      amount: payout.amount,
    })),
    payouts: payoutsTotal,
    closing: income - expensesTotal - payoutsTotal,
  };
}
