// Prisma queries for patient search, profile, and appointment history.
// Business authorization and delete constraints are implemented in service.ts.
import "server-only";
import { or } from "@prisma/orm-postgres/orm-client";
import { prisma } from "@/lib/prisma";

type TransactionCallback = Parameters<typeof prisma.transaction>[0];
export type PatientTransaction = Parameters<TransactionCallback>[0];
export const PATIENT_PAGE_SIZE = 20;

function patientSearchQuery(search: string) {
  const base = prisma.orm.public.Patient;
  if (!search) return base;
  const pattern = `%${search}%`;
  return base.where((patient) =>
    or(patient.name.ilike(pattern), patient.mobile.ilike(pattern)),
  );
}

export async function searchPatientRecords(
  search: string,
  requestedPage: number,
) {
  const base = patientSearchQuery(search);
  const { total } = await base.aggregate((aggregate) => ({
    total: aggregate.count(),
  }));
  const pageCount = Math.max(1, Math.ceil(total / PATIENT_PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const rows = await base
    .select("id", "name", "mobile", "age", "gender")
    .include("appointments", (visits) =>
      visits.combine({
        visitCount: visits.where((visit) => visit.deletedAt.isNull()).count(),
        latestVisit: visits
          .where((visit) => visit.deletedAt.isNull())
          .orderBy((visit) => visit.createdAt.desc())
          .limit(1)
          .select("serialDate"),
      }),
    )
    .orderBy([(patient) => patient.name.asc(), (patient) => patient.id.asc()])
    .limit(PATIENT_PAGE_SIZE)
    .offset((page - 1) * PATIENT_PAGE_SIZE)
    .all();

  return { rows, total, page, pageCount, pageSize: PATIENT_PAGE_SIZE };
}

export function findPatientRecord(id: string) {
  return prisma.orm.public.Patient.where({ id }).first();
}

export function listPatientVisitRecords(patientId: string) {
  return prisma.orm.public.Appointment.where({ patientId })
    .where((visit) => visit.deletedAt.isNull())
    .include("therapist", (therapist) => therapist.select("name"))
    .orderBy([
      (visit) => visit.createdAt.desc(),
      (visit) => visit.invoiceNo.desc(),
    ])
    .all();
}

export function countAllPatientAppointments(
  patientId: string,
  tx: PatientTransaction,
) {
  return tx.orm.public.Appointment.where({ patientId }).aggregate(
    (aggregate) => ({
      count: aggregate.count(),
    }),
  );
}

export function countPatientAppointmentRecords(patientId: string) {
  return prisma.orm.public.Appointment.where({ patientId }).aggregate(
    (aggregate) => ({
      count: aggregate.count(),
    }),
  );
}

export function updatePatientRecord(
  id: string,
  input: {
    name: string;
    mobile: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
  },
) {
  return prisma.orm.public.Patient.where({ id }).update(input);
}

export function deletePatientRecord(id: string, tx: PatientTransaction) {
  return tx.orm.public.Patient.where({ id }).delete();
}
