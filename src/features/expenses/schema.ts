// Server-side validation contract for expense create and edit forms.
// Amounts are whole positive BDT; expense dates are ISO calendar dates.
import { z } from "zod";
import { positiveMoneySchema } from "@/lib/validators/shared";

export const expenseInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  amount: positiveMoneySchema,
  expenseDate: z.iso.date(),
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;
