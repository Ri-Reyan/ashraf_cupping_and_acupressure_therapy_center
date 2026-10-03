// Owns therapist lifecycle, balance projection, and payout business rules.
// BLOCKED is the reversible soft-delete state used by the current schema.
import "server-only";
import { getTherapistBalance } from "@/lib/services/balance";
import { calculateTherapistBalance } from "@/lib/services/balance-calculator";
import type { TherapistInput } from "@/lib/validators/therapist";
import { prisma } from "@/lib/prisma";
import { TherapistRuleError, assertPayoutAllowed } from "./rules";
import {
  createPayoutRecord,
  createTherapistRecord,
  findTherapistRecord,
  getBalanceAggregates,
  listPayoutRecords,
  listTherapistAppointmentRecords,
  listTherapistRecords,
  type TherapistTransaction,
  updateTherapistRecord,
  updateTherapistStatus,
} from "./repository";

export type TherapistDetailAppointment = {
  id: string;
  invoiceNo: number;
  date: string;
  patientName: string;
  services: string[];
  fee: number;
  therapistShare: number;
};

export async function listTherapistsWithBalances(showDeleted: boolean) {
  const therapists = await listTherapistRecords(
    showDeleted ? "BLOCKED" : "ACTIVE",
  );
  return Promise.all(
    therapists.map(async (therapist) => {
      const balance = await getTherapistBalance(therapist.id);
      return { ...therapist, balance: balance.balance };
    }),
  );
}

export async function saveTherapist(input: TherapistInput, id?: string) {
  if (id) {
    if (!(await findTherapistRecord(id)))
      throw new TherapistRuleError("NOT_FOUND");
    return updateTherapistRecord(id, input);
  }
  return createTherapistRecord(input);
}

export async function setTherapistDeleted(id: string, deleted: boolean) {
  if (!(await findTherapistRecord(id)))
    throw new TherapistRuleError("NOT_FOUND");
  return updateTherapistStatus(id, deleted ? "BLOCKED" : "ACTIVE");
}

export async function payoutTherapist(
  therapistId: string,
  paidById: string,
  amount: number,
) {
  return prisma.transaction(async (tx) => {
    const therapist = await tx.orm.public.Therapist.where({
      id: therapistId,
    }).first();
    if (!therapist) throw new TherapistRuleError("NOT_FOUND");

    const totals = await getBalanceAggregates(therapistId, tx);
    const { balance } = calculateTherapistBalance(totals.lifetime, totals.paid);
    assertPayoutAllowed(balance, amount);

    const payout = await createPayoutRecord(
      { therapistId, paidById, amount },
      tx,
    );
    return {
      id: payout.id,
      amount: payout.amount,
      balance: balance - payout.amount,
    };
  });
}

/** Calculates the ledger available to appointment mutations within their transaction. */
export async function getTherapistLedgerForAppointment(
  therapistId: string,
  tx: TherapistTransaction,
) {
  const totals = await getBalanceAggregates(therapistId, tx);
  return calculateTherapistBalance(totals.lifetime, totals.paid);
}

export async function getTherapistDetail(id: string, requestedPage: number) {
  const therapist = await findTherapistRecord(id);
  if (!therapist) return null;

  const pageSize = 20;
  const safePage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const [totals, payouts, appointmentPage] = await Promise.all([
    Promise.all([
      prisma.orm.public.Appointment.where({ therapistId: id })
        .where((appointment) => appointment.deletedAt.isNull())
        .aggregate((aggregate) => ({
          lifetime: aggregate.sum("therapistShare"),
        })),
      prisma.orm.public.TherapistPayout.where({ therapistId: id }).aggregate(
        (aggregate) => ({ paid: aggregate.sum("amount") }),
      ),
    ]),
    listPayoutRecords(id),
    listTherapistAppointmentRecords(id, safePage, pageSize),
  ]);

  const balance = calculateTherapistBalance(totals[0].lifetime, totals[1].paid);
  const pageCount = Math.max(1, Math.ceil(appointmentPage.total / pageSize));
  const page = Math.min(safePage, pageCount);
  const appointments =
    page === safePage
      ? appointmentPage.rows
      : (await listTherapistAppointmentRecords(id, page, pageSize)).rows;

  return {
    therapist,
    ...balance,
    payouts: payouts.map((payout) => ({
      id: payout.id,
      amount: payout.amount,
      date: payout.createdAt.toString(),
    })),
    appointments: appointments.flatMap((appointment) => {
      if (!appointment.patient) return [];
      return [
        {
          id: appointment.id,
          invoiceNo: appointment.invoiceNo,
          date: appointment.serialDate.toString(),
          patientName: appointment.patient.name,
          services: [...(appointment.services ?? [])],
          fee: appointment.fee,
          therapistShare: appointment.therapistShare,
        },
      ];
    }),
    page,
    pageCount,
    pageSize,
    totalAppointments: appointmentPage.total,
  };
}
