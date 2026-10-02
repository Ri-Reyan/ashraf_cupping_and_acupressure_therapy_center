import { describe, expect, it } from "vitest";
import {
  assertCanManageExpense,
  canManageExpense,
  ExpenseRuleError,
} from "@/features/expenses/rules";

describe("expense date permissions", () => {
  const today = "2026-10-02";

  it("allows admins to manage any expense date", () => {
    expect(canManageExpense("ADMIN", "2026-09-30", today)).toBe(true);
    expect(() =>
      assertCanManageExpense("ADMIN", "2026-09-30", today),
    ).not.toThrow();
  });

  it("allows receptionists to edit/delete only today's expense", () => {
    expect(canManageExpense("RECEPTIONIST", today, today)).toBe(true);
    expect(canManageExpense("RECEPTIONIST", "2026-10-01", today)).toBe(false);
    expect(() =>
      assertCanManageExpense("RECEPTIONIST", "2026-10-01", today),
    ).toThrow(ExpenseRuleError);
  });

  it("keeps receptionist edits dated today", () => {
    expect(() =>
      assertCanManageExpense("RECEPTIONIST", today, today, today),
    ).not.toThrow();
    expect(() =>
      assertCanManageExpense("RECEPTIONIST", today, today, "2026-10-03"),
    ).toThrow(ExpenseRuleError);
  });
});
