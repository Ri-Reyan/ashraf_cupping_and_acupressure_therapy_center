// Prisma queries for therapist profiles, balances, payout history, and visits.
// Business rules and status transitions live in service.ts.
import "server-only";
import type { TherapistInput } from "@/lib/validators/therapist";
import { prisma } from "@/lib/prisma";

type TransactionCallback = Parameters<typeof prisma.transaction>[0];
export type TherapistTransaction = Parameters<TransactionCallback>[0];

export function listTherapistRecords(status: "ACTIVE" | "BLOCKED") {
  return prisma.orm.public.Therapist.where({ status })
    .orderBy((therapist) => therapist.name.asc())
    .all();
}

export function findTherapistRecord(id: string) {
  return prisma.orm.public.Therapist.where({ id }).first();
}

export function createTherapistRecord(input: TherapistInput) {
  return prisma.orm.public.Therapist.create({
    ...input,
    location: input.location ?? null,
    education: input.education ?? null,
    status: "ACTIVE",
  });
}

export function updateTherapistRecord(id: string, input: TherapistInput) {
  return prisma.orm.public.Therapist.where({ id }).update({
    name: input.name,
    mobile: input.mobile,
    location: input.location ?? null,
    education: input.education ?? null,
    age: input.age,
    gender: input.gender,
  });
}

export function updateTherapistStatus(
  id: string,
  status: "ACTIVE" | "BLOCKED",
) {
  return prisma.orm.public.Therapist.where({ id }).update({ status });
}

export function getBalanceAggregates(
  therapistId: string,
  tx: TherapistTransaction,
) {
  return tx.orm.public.Appointment.where({ therapistId })
    .where((appointment) => appointment.deletedAt.isNull())
    .aggregate((aggregate) => ({ lifetime: aggregate.sum("therapistShare") }))
    .then(async (earnings) => {
      const payouts = await tx.orm.public.TherapistPayout.where({
        therapistId,
      }).aggregate((aggregate) => ({ paid: aggregate.sum("amount") }));
      return { lifetime: earnings.lifetime, paid: payouts.paid };
    });
}

export function createPayoutRecord(
  input: { therapistId: string; paidById: string; amount: number },
  tx: TherapistTransaction,
) {
  return tx.orm.public.TherapistPayout.create(input);
}

export function listPayoutRecords(therapistId: string) {
  return prisma.orm.public.TherapistPayout.where({ therapistId })
    .orderBy((payout) => payout.createdAt.desc())
    .select("id", "amount", "createdAt")
    .all();
}

export async function listTherapistAppointmentRecords(
  therapistId: string,
  page: number,
  pageSize: number,
) {
  const base = prisma.orm.public.Appointment.where({ therapistId }).where(
    (appointment) => appointment.deletedAt.isNull(),
  );
  const [count, rows] = await Promise.all([
    base.aggregate((aggregate) => ({ total: aggregate.count() })),
    base
      .select(
        "id",
        "invoiceNo",
        "serialDate",
        "services",
        "fee",
        "therapistShare",
        "createdAt",
      )
      .include("patient", (patient) => patient.select("name"))
      .orderBy([
        (appointment) => appointment.createdAt.desc(),
        (appointment) => appointment.invoiceNo.desc(),
      ])
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .all(),
  ]);

  return { total: count.total, rows };
}
