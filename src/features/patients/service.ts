// Patient directory, visit summaries, and profile business rules.
// Patient deletion is allowed only when no appointment rows reference them.
import "server-only";
import type { PatientInput } from "@/lib/validators/patient";
import { prisma } from "@/lib/prisma";
import {
  assertPatientCanBeDeleted,
  getActiveSessionPackages,
  PatientRuleError,
} from "./rules";
import {
  countAllPatientAppointments,
  countPatientAppointmentRecords,
  deletePatientRecord,
  findPatientRecord,
  listPatientVisitRecords,
  searchPatientRecords,
  updatePatientRecord,
} from "./repository";

export type PatientDetailVisit = {
  id: string;
  invoiceNo: number;
  date: string;
  services: string[];
  fee: number;
  therapistName: string;
};

export type PatientSessionPackage = {
  sessionGroupId: string;
  currentCount: number;
  sessionCount: number;
};

export async function searchPatients(search: string, requestedPage: number) {
  const normalizedSearch = search.trim().slice(0, 120);
  const safePage =
    Number.isSafeInteger(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
  const result = await searchPatientRecords(normalizedSearch, safePage);

  return {
    search: normalizedSearch,
    total: result.total,
    page: result.page,
    pageCount: result.pageCount,
    pageSize: result.pageSize,
    patients: result.rows.map((patient) => ({
      id: patient.id,
      name: patient.name,
      mobile: patient.mobile,
      age: patient.age,
      gender: patient.gender,
      visitCount: patient.appointments.visitCount,
      lastVisit:
        patient.appointments.latestVisit[0]?.serialDate.toString() ?? null,
    })),
  };
}

export async function getPatientDetail(id: string) {
  const patient = await findPatientRecord(id);
  if (!patient) return null;

  const [visits, allAppointments] = await Promise.all([
    listPatientVisitRecords(id),
    countPatientAppointmentRecords(id),
  ]);
  const activePackages = getActiveSessionPackages(visits);

  return {
    patient,
    totalPaid: visits.reduce((sum, visit) => sum + visit.fee, 0),
    hasAppointments: allAppointments.count > 0,
    activePackages,
    visits: visits.map((visit) => ({
      id: visit.id,
      invoiceNo: visit.invoiceNo,
      date: visit.serialDate.toString(),
      services: [...(visit.services ?? [])],
      fee: visit.fee,
      therapistName: visit.therapist?.name ?? "Unavailable",
    })),
  };
}

export async function updatePatientDetails(id: string, input: PatientInput) {
  if (!(await findPatientRecord(id))) throw new PatientRuleError("NOT_FOUND");
  return updatePatientRecord(id, input);
}

export async function deletePatient(id: string) {
  return prisma.transaction(async (tx) => {
    const patient = await tx.orm.public.Patient.where({ id }).first();
    if (!patient) throw new PatientRuleError("NOT_FOUND");

    const appointments = await countAllPatientAppointments(id, tx);
    assertPatientCanBeDeleted(appointments.count);

    await deletePatientRecord(id, tx);
  });
}
