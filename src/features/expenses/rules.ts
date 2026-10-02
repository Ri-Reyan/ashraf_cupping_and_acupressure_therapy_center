// Pure expense mutation policy shared by the service and tests.
// Receptionists can edit/delete only rows dated today in Asia/Dhaka.
import type { StaffRole } from "@/lib/auth";

export class ExpenseRuleError extends Error {
  constructor(
    readonly code: "NOT_FOUND" | "TODAY_ONLY" | "DATE_MUST_STAY_TODAY",
  ) {
    super(code);
  }
}

export function canManageExpense(
  role: StaffRole,
  expenseDate: string,
  dhakaToday: string,
) {
  return role === "ADMIN" || expenseDate === dhakaToday;
}

export function assertCanManageExpense(
  role: StaffRole,
  expenseDate: string,
  dhakaToday: string,
  requestedDate?: string,
) {
  if (role === "ADMIN") return;
  if (expenseDate !== dhakaToday) throw new ExpenseRuleError("TODAY_ONLY");
  if (requestedDate && requestedDate !== dhakaToday) {
    throw new ExpenseRuleError("DATE_MUST_STAY_TODAY");
  }
}
