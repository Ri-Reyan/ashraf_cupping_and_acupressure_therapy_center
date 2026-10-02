// Prisma queries for expense rows and selected-month totals.
// Dates are Dhaka-local calendar timestamps represented as PlainDateTime.
import "server-only";
import type { Temporal } from "temporal-polyfill";
import { prisma } from "@/lib/prisma";

type TransactionCallback = Parameters<typeof prisma.transaction>[0];
export type ExpenseTransaction = Parameters<TransactionCallback>[0];

export function listExpenseRecords(
  monthStart: Temporal.PlainDateTime,
  nextMonthStart: Temporal.PlainDateTime,
) {
  return prisma.orm.public.Expense.where((expense) =>
    expense.expenseDate.gte(monthStart),
  )
    .where((expense) => expense.expenseDate.lt(nextMonthStart))
    .include("createdBy", (user) => user.select("name"))
    .orderBy([
      (expense) => expense.expenseDate.desc(),
      (expense) => expense.createdAt.desc(),
    ])
    .all();
}

export function sumExpenseRecords(
  monthStart: Temporal.PlainDateTime,
  nextMonthStart: Temporal.PlainDateTime,
) {
  return prisma.orm.public.Expense.where((expense) =>
    expense.expenseDate.gte(monthStart),
  )
    .where((expense) => expense.expenseDate.lt(nextMonthStart))
    .aggregate((aggregate) => ({ total: aggregate.sum("amount") }));
}

export function findExpenseRecord(id: string) {
  return prisma.orm.public.Expense.where({ id }).first();
}

export function findExpenseRecordForMutation(
  id: string,
  tx: ExpenseTransaction,
) {
  return tx.orm.public.Expense.where({ id }).first();
}

export function createExpenseRecord(input: {
  name: string;
  amount: number;
  expenseDate: Temporal.PlainDateTime;
  createdById: string;
}) {
  return prisma.orm.public.Expense.create(input);
}

export function updateExpenseRecord(
  id: string,
  input: { name: string; amount: number; expenseDate: Temporal.PlainDateTime },
  tx: ExpenseTransaction,
) {
  return tx.orm.public.Expense.where({ id }).update(input);
}

export function deleteExpenseRecord(id: string, tx: ExpenseTransaction) {
  return tx.orm.public.Expense.where({ id }).delete();
}
