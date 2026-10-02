// Prisma queries for appointment creation and patient form lookups.
// Business decisions are made in service.ts, within its transaction.
import "server-only";
import type { Temporal } from "temporal-polyfill";
import { prisma } from "@/lib/prisma";

type TransactionCallback = Parameters<typeof prisma.transaction>[0];
export type AppointmentTransaction = Parameters<TransactionCallback>[0];

export async function getAppointmentFormOptions() {
  const [services, therapists] = await Promise.all([
    prisma.orm.public.Service.orderBy((service) => service.name.asc())
      .select("id", "name")
      .all(),
    prisma.orm.public.Therapist.where({ status: "ACTIVE" })
      .orderBy((therapist) => therapist.name.asc())
      .select("id", "name")
      .all(),
  ]);
  return { services, therapists };
}

export function findPatientByMobile(mobile: string) {
  return prisma.orm.public.Patient.where({ mobile })
    .select("id", "name", "mobile", "age", "gender")
    .first();
}

export function countPatientVisits(patientId: string) {
  return prisma.orm.public.Appointment.where({ patientId })
    .where((appointment) => appointment.deletedAt.isNull())
    .aggregate((aggregate) => ({ count: aggregate.count() }));
}

export function listPatientSessions(patientId: string) {
  return prisma.orm.public.Appointment.where({ patientId, isSession: true })
    .where((appointment) => appointment.deletedAt.isNull())
    .orderBy((appointment) => appointment.createdAt.desc())
    .select("sessionGroupId", "sessionCount", "currentCount", "createdAt")
    .all();
}

export function findActiveTherapist(id: string, tx: AppointmentTransaction) {
  return tx.orm.public.Therapist.where({ id, status: "ACTIVE" }).first();
}

export function findPatientForCreate(
  mobile: string,
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Patient.where({ mobile }).first();
}

export function createPatientRecord(
  patient: {
    name: string;
    mobile: string;
    age: number;
    gender: "MALE" | "FEMALE" | "OTHER";
  },
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Patient.create(patient);
}

export function updatePatientRecord(
  id: string,
  patient: { name: string; age: number; gender: "MALE" | "FEMALE" | "OTHER" },
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Patient.where({ id }).update(patient);
}

export function findServiceForCreate(name: string, tx: AppointmentTransaction) {
  return tx.orm.public.Service.where({ name }).first();
}

export function createServiceRecord(name: string, tx: AppointmentTransaction) {
  return tx.orm.public.Service.create({ name });
}

export function getMaxSerialForDate(
  serialDate: Temporal.PlainDate,
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Appointment.where({ serialDate }).aggregate(
    (aggregate) => ({
      serial: aggregate.max("serial"),
    }),
  );
}

export function findLatestPackageAppointment(
  patientId: string,
  sessionGroupId: string,
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Appointment.where({
    patientId,
    sessionGroupId,
    isSession: true,
  })
    .where((appointment) => appointment.deletedAt.isNull())
    .orderBy((appointment) => appointment.createdAt.desc())
    .first();
}

export function insertAppointmentRecord(
  appointment: {
    id: string;
    patientId: string;
    therapistId: string;
    createdById: string;
    services: string[];
    isSession: boolean;
    sessionGroupId: string | null;
    sessionCount: number | null;
    currentCount: number | null;
    serialDate: Temporal.PlainDate;
    serial: number;
    fee: number;
    therapistPercent: number;
    therapistShare: number;
  },
  tx: AppointmentTransaction,
) {
  return tx.orm.public.Appointment.create(appointment);
}
