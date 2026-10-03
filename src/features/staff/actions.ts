// ADMIN-only actions for creating and deactivating staff accounts.
// Plaintext passwords are validated, hashed in service.ts, and never returned.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { staffCreateSchema } from "./schema";
import { StaffRuleError, createStaff, setStaffBlocked } from "./service";

const statusSchema = z.object({ id: z.uuid(), blocked: z.boolean() });

function actionError(error: unknown) {
  if (error instanceof StaffRuleError) {
    if (error.code === "SELF_DELETE")
      return "You cannot deactivate your own account.";
    if (error.code === "LAST_ADMIN")
      return "The last active admin cannot be deactivated.";
    return "Staff account not found.";
  }
  return "Unable to complete the staff request. Please try again.";
}

export async function createStaffAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = staffCreateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Check the staff details and initial password.",
    };
  }

  try {
    const staff = await createStaff(parsed.data);
    revalidatePath("/dashboard/staff");
    return { ok: true as const, data: staff };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}

export async function setStaffBlockedAction(input: unknown) {
  const actor = await requireRole("ADMIN");
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Select a valid staff account." };

  try {
    await setStaffBlocked(parsed.data.id, actor.id, parsed.data.blocked);
    revalidatePath("/dashboard/staff");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}
