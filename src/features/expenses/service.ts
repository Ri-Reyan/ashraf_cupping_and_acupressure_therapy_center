// Expense month reporting and business rules.
// Date-only entries are stored at midnight on their Dhaka calendar date.
import "server-only";
import { Temporal } from "temporal-polyfill";
import { getDhakaToday } from "@/lib/dhaka-time";
import type { StaffRole } from "@/lib/auth";
import type { ExpenseInput } from "./schema";
import {
  ExpenseRuleError,
  assertCanManageExpense,
  canManageExpense,
} from "./rules";
import { prisma } from "@/lib/prisma";
import {
  createExpenseRecord,
  deleteExpenseRecord,
  findExpenseRecordForMutation,
  listExpenseRecords,
  sumExpenseRecords,
  updateExpenseRecord,
} from "./repository";

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function getMonthBounds(month: string) {
  const firstDay = Temporal.PlainDate.from(`${month}-01`);
  return {
    start: firstDay.toPlainDateTime("00:00"),
    end: firstDay.add({ months: 1 }).toPlainDateTime("00:00"),
  };
}

function toExpenseDate(date: string) {
  return Temporal.PlainDate.from(date).toPlainDateTime("00:00");
}

export async function getExpenseMonth(monthInput: string, role: StaffRole) {
  const today = getDhakaToday().toString();
  const currentMonth = today.slice(0, 7);
  const month = MONTH_PATTERN.test(monthInput) ? monthInput : currentMonth;
  const bounds = getMonthBounds(month);
  const [rows, sum] = await Promise.all([
    listExpenseRecords(bounds.start, bounds.end),
    sumExpenseRecords(bounds.start, bounds.end),
  ]);

  return {
    month,
    today,
    total: sum.total ?? 0,
    expenses: rows.map((expense) => {
      const expenseDate = expense.expenseDate.toString().slice(0, 10);
      return {
        id: expense.id,
        name: expense.name,
        amount: expense.amount,
        expenseDate,
        createdBy: expense.createdBy?.name ?? "Unknown staff",
        canManage: canManageExpense(role, expenseDate, today),
      };
    }),
  };
}

export async function createExpense(input: ExpenseInput, createdById: string) {
  return createExpenseRecord({
    name: input.name,
    amount: input.amount,
    expenseDate: toExpenseDate(input.expenseDate),
    createdById,
  });
}

export async function updateExpense(
  id: string,
  input: ExpenseInput,
  role: StaffRole,
) {
  return prisma.transaction(async (tx) => {
    const existing = await findExpenseRecordForMutation(id, tx);
    if (!existing) throw new ExpenseRuleError("NOT_FOUND");

    const today = getDhakaToday().toString();
    const currentDate = existing.expenseDate.toString().slice(0, 10);
    assertCanManageExpense(role, currentDate, today, input.expenseDate);

    return updateExpenseRecord(
      id,
      {
        name: input.name,
        amount: input.amount,
        expenseDate: toExpenseDate(input.expenseDate),
      },
      tx,
    );
  });
}

export async function deleteExpense(id: string, role: StaffRole) {
  return prisma.transaction(async (tx) => {
    const existing = await findExpenseRecordForMutation(id, tx);
    if (!existing) throw new ExpenseRuleError("NOT_FOUND");

    const today = getDhakaToday().toString();
    const currentDate = existing.expenseDate.toString().slice(0, 10);
    assertCanManageExpense(role, currentDate, today);
    await deleteExpenseRecord(id, tx);
  });
}
