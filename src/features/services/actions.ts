// Authenticated Server Actions for service-catalog mutations.
// They validate inputs and delegate catalog rules to service.ts.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { serviceSchema } from "@/lib/validators/service";
import {
  ServiceRuleError,
  createService,
  deleteService,
  renameService,
} from "./service";

const renameSchema = z.object({ id: z.uuid(), name: serviceSchema.shape.name });
const idSchema = z.object({ id: z.uuid() });

function ruleError(error: unknown) {
  if (error instanceof ServiceRuleError) {
    return error.code === "NAME_TAKEN"
      ? "A service with that name already exists."
      : "That service no longer exists.";
  }
  return "Unable to update the service list. Please try again.";
}

export async function addService(input: unknown) {
  await requireRole("ADMIN");
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Enter a service name up to 120 characters.",
    };
  }

  try {
    const service = await createService(parsed.data.name);
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/appointments/new");
    return { ok: true as const, data: { id: service.id, name: service.name } };
  } catch (error) {
    return { ok: false as const, error: ruleError(error) };
  }
}

export async function updateService(input: unknown) {
  await requireRole("ADMIN");
  const parsed = renameSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid service name." };
  }

  try {
    await renameService(parsed.data.id, parsed.data.name);
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/appointments/new");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: ruleError(error) };
  }
}

export async function removeService(input: unknown) {
  await requireRole("ADMIN");
  const parsed = idSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Select a valid service." };
  }

  try {
    await deleteService(parsed.data.id);
    revalidatePath("/dashboard/services");
    revalidatePath("/dashboard/appointments/new");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: ruleError(error) };
  }
}
