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
  monthly: {
    month: string;
    income: number;
    expenses: number;
    payouts: number;
  }[];
  topTherapists: { id: string; name: string; fee: number }[];
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

function monthLabel(month: string) {
  const date = Temporal.PlainDate.from(`${month}-01`);
  return `${date.toLocaleString("en-BD", { month: "short" })} '${month.slice(2, 4)}`;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const today = getDhakaToday();
  const currentMonthStart = today.with({ day: 1 });
  const nextMonthStart = currentMonthStart.add({ months: 1 });
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

  const currentPayoutTotal = payoutTotals.at(-1)?.[1] ?? 0;
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

  const income =
    incomeByMonth.get(currentMonthStart.toString().slice(0, 7)) ?? 0;
  const expenses =
    expensesByMonth.get(currentMonthStart.toString().slice(0, 7)) ?? 0;

  return {
    monthLabel: currentMonthStart.toLocaleString("en-BD", {
      month: "long",
      year: "numeric",
    }),
    patientCount: currentPatients.length,
    income,
    expenses,
    payouts: currentPayoutTotal,
    net: income - expenses - currentPayoutTotal,
    daily,
    monthly,
    topTherapists: topTherapistRows,
  };
}
