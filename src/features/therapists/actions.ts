// ADMIN-only Server Actions for therapist profiles and payouts.
// Each action authenticates and validates before calling the feature service.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { payoutSchema } from "@/lib/validators/payout";
import { therapistSchema } from "@/lib/validators/therapist";
import { TherapistRuleError } from "./rules";
import { payoutTherapist, saveTherapist, setTherapistDeleted } from "./service";

const updateSchema = z.object({ id: z.uuid(), ...therapistSchema.shape });
const idSchema = z.object({ id: z.uuid() });

function messageFor(error: unknown) {
  if (error instanceof TherapistRuleError) {
    if (error.code === "NOT_FOUND") return "Therapist not found.";
    if (error.code === "BALANCE_TOO_LOW")
      return "Balance must be at least ৳ 500 to make a payout.";
    return "Payout amount must be at least ৳ 500 and no more than the available balance.";
  }
  return "Unable to complete this request. Please try again.";
}

function revalidateTherapist(id?: string) {
  revalidatePath("/dashboard/therapists");
  if (id) revalidatePath(`/dashboard/therapists/${id}`);
}

export async function createTherapistAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = therapistSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Check the therapist details." };

  try {
    const therapist = await saveTherapist(parsed.data);
    if (!therapist) throw new TherapistRuleError("NOT_FOUND");
    revalidateTherapist(therapist.id);
    return { ok: true as const, data: { id: therapist.id } };
  } catch (error) {
    return { ok: false as const, error: messageFor(error) };
  }
}

export async function updateTherapistAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Check the therapist details." };

  try {
    const { id, ...details } = parsed.data;
    await saveTherapist(details, id);
    revalidateTherapist(id);
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: messageFor(error) };
  }
}

export async function softDeleteTherapistAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = idSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Choose a valid therapist." };

  try {
    await setTherapistDeleted(parsed.data.id, true);
    revalidateTherapist(parsed.data.id);
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: messageFor(error) };
  }
}

export async function restoreTherapistAction(input: unknown) {
  await requireRole("ADMIN");
  const parsed = idSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Choose a valid therapist." };

  try {
    await setTherapistDeleted(parsed.data.id, false);
    revalidateTherapist(parsed.data.id);
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: messageFor(error) };
  }
}

export async function createTherapistPayoutAction(input: unknown) {
  const user = await requireRole("ADMIN");
  const parsed = payoutSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Payout amount must be an integer of at least ৳ 500.",
    };
  }

  try {
    const payout = await payoutTherapist(
      parsed.data.therapistId,
      user.id,
      parsed.data.amount,
    );
    revalidateTherapist(parsed.data.therapistId);
    return { ok: true as const, data: payout };
  } catch (error) {
    return { ok: false as const, error: messageFor(error) };
  }
}
