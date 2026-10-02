// Enforces appointment, patient, therapist, serial, and package business rules.
// Every create attempt runs through one Prisma 8 transaction.
import "server-only";
import { randomUUID } from "node:crypto";
import { getDhakaToday } from "@/lib/dhaka-time";
import { prisma } from "@/lib/prisma";
import type { AppointmentCreateInput } from "./schema";
import {
  countPatientVisits,
  createPatientRecord,
  createServiceRecord,
  findActiveTherapist,
  findLatestPackageAppointment,
  findPatientByMobile,
  findPatientForCreate,
  findServiceForCreate,
  getAppointmentFormOptions,
  getMaxSerialForDate,
  insertAppointmentRecord,
  listPatientSessions,
  updatePatientRecord,
} from "./repository";
import {
  AppointmentRuleError,
  calculateTherapistShare,
  getNextPackageCount,
} from "./rules";

const RETRYABLE_CONSTRAINTS = new Set([
  "Appointment_serialDate_serial_key",
  "Patient_mobile_key",
  "patient_mobile_key",
  "Service_name_key",
]);
const MAX_CREATE_ATTEMPTS = 5;

function isRetryableUniqueConflict(error: unknown) {
  const seen = new Set<object>();
  let current: unknown = error;

  while (
    typeof current === "object" &&
    current !== null &&
    !seen.has(current)
  ) {
    seen.add(current);
    const record = current as {
      sqlState?: unknown;
      constraint?: unknown;
      cause?: unknown;
      details?: unknown;
    };
    if (
      record.sqlState === "23505" &&
      typeof record.constraint === "string" &&
      RETRYABLE_CONSTRAINTS.has(record.constraint)
    ) {
      return true;
    }
    current = record.cause ?? record.details;
  }
  return false;
}

export async function getAppointmentOptions() {
  return getAppointmentFormOptions();
}

export async function getPatientVisitInfo(mobile: string) {
  const patient = await findPatientByMobile(mobile);
  if (!patient) return null;

  const [visits, sessionRows] = await Promise.all([
    countPatientVisits(patient.id),
    listPatientSessions(patient.id),
  ]);
  const seenGroups = new Set<string>();
  const openPackages = sessionRows.flatMap((session) => {
    const groupId = session.sessionGroupId;
    const total = session.sessionCount;
    const current = session.currentCount;
    if (
      !groupId ||
      seenGroups.has(groupId) ||
      total === null ||
      current === null ||
      current >= total
    ) {
      return [];
    }
    seenGroups.add(groupId);
    return [
      {
        sessionGroupId: groupId,
        sessionCount: total,
        currentCount: current,
        label: `Started ${session.createdAt.toString().slice(0, 10)} · ${current} of ${total}`,
      },
    ];
  });

  return { patient, previousVisits: visits.count, openPackages };
}

export async function createAppointment(
  input: AppointmentCreateInput,
  createdById: string,
) {
  for (let attempt = 0; attempt < MAX_CREATE_ATTEMPTS; attempt += 1) {
    try {
      return await prisma.transaction(async (tx) => {
        const therapist = await findActiveTherapist(input.therapistId, tx);
        if (!therapist) {
          throw new AppointmentRuleError("THERAPIST_UNAVAILABLE");
        }

        const existingPatient = await findPatientForCreate(
          input.patient.mobile,
          tx,
        );
        let patientId = existingPatient?.id;
        if (existingPatient) {
          await updatePatientRecord(
            existingPatient.id,
            {
              name: input.patient.name,
              age: input.patient.age,
              gender: input.patient.gender,
            },
            tx,
          );
        } else {
          const patient = await createPatientRecord(input.patient, tx);
          patientId = patient.id;
        }

        for (const serviceName of new Set(input.services)) {
          if (!(await findServiceForCreate(serviceName, tx))) {
            await createServiceRecord(serviceName, tx);
          }
        }

        let sessionGroupId: string | null = null;
        let sessionCount: number | null = null;
        let currentCount: number | null = null;
        if (input.isSession && input.sessionMode === "new") {
          sessionGroupId = randomUUID();
          sessionCount = input.sessionCount;
          currentCount = 1;
        } else if (input.isSession && input.sessionMode === "continue") {
          const latest = await findLatestPackageAppointment(
            patientId!,
            input.sessionGroupId!,
            tx,
          );
          if (!latest) throw new AppointmentRuleError("PACKAGE_UNAVAILABLE");
          currentCount = getNextPackageCount(latest);
          sessionGroupId = input.sessionGroupId;
          sessionCount = latest.sessionCount;
        }

        const serialDate = getDhakaToday();
        const { serial: maxSerial } = await getMaxSerialForDate(serialDate, tx);
        const appointment = await insertAppointmentRecord(
          {
            id: randomUUID(),
            patientId: patientId!,
            therapistId: therapist.id,
            createdById,
            services: [...new Set(input.services)],
            isSession: input.isSession,
            sessionGroupId,
            sessionCount,
            currentCount,
            serialDate,
            serial: (maxSerial ?? 0) + 1,
            fee: input.fee,
            therapistPercent: input.therapistPercent,
            therapistShare: calculateTherapistShare(
              input.fee,
              input.therapistPercent,
            ),
          },
          tx,
        );

        return { id: appointment.id, invoiceNo: appointment.invoiceNo };
      });
    } catch (error) {
      if (
        !isRetryableUniqueConflict(error) ||
        attempt + 1 === MAX_CREATE_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw new Error("Could not allocate an appointment serial. Please retry.");
}
