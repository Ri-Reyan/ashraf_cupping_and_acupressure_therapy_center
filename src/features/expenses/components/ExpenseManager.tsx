// Month-filtered expense ledger with create/edit/delete interactions.
// Per-row controls mirror the server's Admin/receptionist permissions.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { deleteExpenseAction } from "../actions";
import { ExpenseDialog, type ExpenseDraft } from "./ExpenseDialog";

export type ExpenseRow = ExpenseDraft & {
  createdBy: string;
  canManage: boolean;
};

export function ExpenseManager({
  month,
  today,
  expenses,
  total,
}: {
  month: string;
  today: string;
  expenses: ExpenseRow[];
  total: number;
}) {
  const [dialog, setDialog] = useState<ExpenseDraft | "new" | null>(null);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete(expense: ExpenseRow) {
    if (!expense.canManage) return;
    if (!window.confirm(`Delete expense “${expense.name}”?`)) return;
    setPendingId(expense.id);
    setError("");
    try {
      const result = await deleteExpenseAction({ id: expense.id });
      if (!result.ok) setError(result.error);
      else router.refresh();
    } catch {
      setError("Unable to delete the expense. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d9e7e3] pb-6">
        <form
          action="/dashboard/expenses"
          method="get"
          className="flex items-end gap-3"
        >
          <label className="space-y-2 text-sm font-medium">
            <span>Month</span>
            <input
              type="month"
              name="month"
              required
              defaultValue={month}
              className="h-11 border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
            />
          </label>
          <button
            type="submit"
            className="min-h-11 border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
          >
            Apply
          </button>
        </form>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-medium uppercase text-[#69807c]">
              Selected month total
            </p>
            <p className="mt-1 text-xl font-semibold">{formatBDT(total)}</p>
          </div>
          <button
            type="button"
            onClick={() => setDialog("new")}
            className="flex min-h-11 items-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add expense
          </button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
        >
          {error}
        </p>
      )}

      {expenses.length === 0 ? (
        <p className="py-10 text-sm text-[#69807c]">
          No expenses recorded for this month.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-[#d9e7e3]">
          <table className="w-full min-w-200 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Expense
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Amount
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Created by
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {expenses.map((expense) => (
                <tr key={expense.id} className="bg-white hover:bg-[#f8fbf9]">
                  <td className="px-3 py-3">{expense.expenseDate}</td>
                  <td className="px-3 py-3 font-medium">{expense.name}</td>
                  <td className="px-3 py-3 text-right">
                    {formatBDT(expense.amount)}
                  </td>
                  <td className="px-3 py-3">{expense.createdBy}</td>
                  <td className="px-3 py-2 text-right">
                    {expense.canManage ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          title={`Edit ${expense.name}`}
                          onClick={() => setDialog(expense)}
                          className="grid size-10 place-items-center text-[#526965] hover:bg-[#f1f5f4]"
                        >
                          <Pencil aria-hidden="true" className="size-4" />
                        </button>
                        <button
                          type="button"
                          title={`Delete ${expense.name}`}
                          disabled={pendingId === expense.id}
                          onClick={() => handleDelete(expense)}
                          className="grid size-10 place-items-center text-[#9b3f35] hover:bg-[#fbf2f0] disabled:opacity-60"
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </button>
                      </span>
                    ) : (
                      <span className="text-xs text-[#69807c]">Today only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog && (
        <ExpenseDialog
          key={dialog === "new" ? "new" : dialog.id}
          today={today}
          initial={dialog === "new" ? undefined : dialog}
          onClose={() => {
            setDialog(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
