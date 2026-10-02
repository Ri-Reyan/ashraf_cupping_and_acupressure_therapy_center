// Staff-authenticated expense mutation actions.
// Every input is validated here and authorization is enforced in the service.
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { ExpenseRuleError } from "./rules";
import { expenseInputSchema } from "./schema";
import { createExpense, deleteExpense, updateExpense } from "./service";

const updateSchema = z.object({ id: z.uuid(), ...expenseInputSchema.shape });
const idSchema = z.object({ id: z.uuid() });

function actionError(error: unknown) {
  if (error instanceof ExpenseRuleError) {
    if (error.code === "NOT_FOUND") return "Expense not found.";
    if (error.code === "TODAY_ONLY") {
      return "Receptionists can edit or delete only expenses dated today.";
    }
    return "Receptionists must keep an edited expense dated today.";
  }
  return "Unable to update the expense. Please try again.";
}

export async function createExpenseAction(input: unknown) {
  const user = await requireUser();
  const parsed = expenseInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Check the expense name, amount, and date.",
    };
  }

  try {
    await createExpense(parsed.data, user.id);
    revalidatePath("/dashboard/expenses");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}

export async function updateExpenseAction(input: unknown) {
  const user = await requireUser();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Check the expense name, amount, and date.",
    };
  }

  try {
    const { id, ...details } = parsed.data;
    await updateExpense(id, details, user.role);
    revalidatePath("/dashboard/expenses");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}

export async function deleteExpenseAction(input: unknown) {
  const user = await requireUser();
  const parsed = idSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false as const, error: "Select a valid expense." };

  try {
    await deleteExpense(parsed.data.id, user.role);
    revalidatePath("/dashboard/expenses");
    return { ok: true as const, data: null };
  } catch (error) {
    return { ok: false as const, error: actionError(error) };
  }
}
