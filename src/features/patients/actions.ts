// ADMIN-only patient profile and delete Server Actions.
// Delete constraints are rechecked inside a Prisma transaction in service.ts.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { patientSchema } from "@/lib/validators/patient";
import { deletePatient, updatePatientDetails } from "./service";
import { PatientRuleError } from "./rules";

const updateSchema = z.object({ id: z.uuid(), ...patientSchema.shape });
const idSchema = z.object({ id: z.uuid() });

function actionError(error: unknown) {
  if (error instanceof PatientRuleError) {
    if (error.code === "HAS_APPOINTMENTS") {
      return "This patient has appointments and cannot be deleted.";
    }
    return "Patient not found.";
  }
  return "Unable to update this patient. Please try again.";
}

export async function updatePatientAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Check the patient details." };
  }

  try {
    const { id, ...details } = parsed.data;
    await updatePatientDetails(id, details);
    revalidatePath("/dashboard/patients");
    revalidatePath(`/dashboard/patients/${id}`);
    revalidatePath("/dashboard/invoices");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}

export async function deletePatientAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Select a valid patient." };
  }

  try {
    await deletePatient(parsed.data.id);
    revalidatePath("/dashboard/patients");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}
