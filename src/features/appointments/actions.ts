// Staff-authenticated Server Actions for appointment lookup and creation.
// Input validation and role checks stay at this boundary.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { bdMobileSchema } from "@/lib/validators/shared";
import { AppointmentRuleError } from "./rules";
import { appointmentCreateSchema, appointmentUpdateSchema } from "./schema";
import {
  createAppointment,
  deleteAppointment,
  getPatientVisitInfo,
  updateAppointment,
} from "./service";
import { requireRole } from "@/lib/auth";

const lookupSchema = z.object({ mobile: bdMobileSchema });

export async function lookupPatient(input: unknown) {
  await requireUser();
  const parsed = lookupSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Enter a valid mobile number." };

  const patient = await getPatientVisitInfo(parsed.data.mobile);
  return { ok: true as const, data: patient };
}

export async function createAppointmentAction(input: unknown) {
  const user = await requireUser();
  const parsed = appointmentCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error:
        "Check the patient, services, therapist, fee, and session details.",
    };
  }

  try {
    const appointment = await createAppointment(parsed.data, user.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/patients");
    revalidatePath("/dashboard/invoices");
    return { ok: true as const, data: appointment };
  } catch (error) {
    if (error instanceof AppointmentRuleError) {
      const messages = {
        PACKAGE_UNAVAILABLE: "That session package is no longer available.",
        PACKAGE_COMPLETE: "That session package is already complete.",
        THERAPIST_UNAVAILABLE: "Choose an active therapist.",
        NOT_FOUND: "Appointment not found.",
        LEDGER_NEGATIVE:
          "This change would make a therapist's balance negative.",
      };
      return { ok: false as const, error: messages[error.code] };
    }
    console.error("Appointment creation failed.");
    return {
      ok: false as const,
      error: "Could not create the appointment. Please try again.",
    };
  }
}

export async function updateAppointmentAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = appointmentUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Check the appointment details." };
  }

  try {
    await updateAppointment(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/therapists");
    revalidatePath("/dashboard/patients");
    return { ok: true as const, data: null };
  } catch (error) {
    if (error instanceof AppointmentRuleError) {
      const messages = {
        PACKAGE_UNAVAILABLE: "That session package is no longer available.",
        PACKAGE_COMPLETE: "That session package is already complete.",
        THERAPIST_UNAVAILABLE: "Choose an active therapist.",
        NOT_FOUND: "Appointment not found.",
        LEDGER_NEGATIVE:
          "This change would make a therapist's balance negative.",
      };
      return { ok: false as const, error: messages[error.code] };
    }
    console.error("Appointment update failed.");
    return { ok: false as const, error: "Could not update the appointment." };
  }
}

export async function deleteAppointmentAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Select a valid appointment." };
  }

  try {
    await deleteAppointment(parsed.data.id);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidatePath("/dashboard/therapists");
    revalidatePath("/dashboard/patients");
    return { ok: true as const, data: null };
  } catch (error) {
    if (error instanceof AppointmentRuleError) {
      const message =
        error.code === "LEDGER_NEGATIVE"
          ? "Deleting this appointment would make a therapist's balance negative."
          : "Appointment not found.";
      return { ok: false as const, error: message };
    }
    console.error("Appointment deletion failed.");
    return { ok: false as const, error: "Could not delete the appointment." };
  }
}
