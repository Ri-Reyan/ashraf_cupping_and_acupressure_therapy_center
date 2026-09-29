// Expense create/update input validation.
// Amounts are integer BDT and dates are optional for today's default.
import { z } from "zod";
import { positiveMoneySchema } from "@/lib/validators/shared";

export const expenseSchema = z.object({
  name: z.string().trim().min(1).max(160),
  amount: positiveMoneySchema,
  expenseDate: z.iso.datetime({ offset: true }).optional(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
