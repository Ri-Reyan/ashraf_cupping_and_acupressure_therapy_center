// Staff-authenticated Server Actions for appointment lookup and creation.
// Input validation and role checks stay at this boundary.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { bdMobileSchema } from "@/lib/validators/shared";
import { AppointmentRuleError } from "./rules";
import { appointmentCreateSchema } from "./schema";
import { createAppointment, getPatientVisitInfo } from "./service";

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
