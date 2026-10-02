// Create/edit form for an expense item.
// The service and Server Action recheck the Dhaka-date role policy.
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createExpenseAction, updateExpenseAction } from "../actions";

export type ExpenseDraft = {
  id: string;
  name: string;
  amount: number;
  expenseDate: string;
};

const fieldClass =
  "h-11 w-full border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]";

export function ExpenseDialog({
  today,
  initial,
  onClose,
}: {
  today: string;
  initial?: ExpenseDraft;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [expenseDate, setExpenseDate] = useState(initial?.expenseDate ?? today);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = { name, amount: Number(amount), expenseDate };
    try {
      const result = initial
        ? await updateExpenseAction({ ...data, id: initial.id })
        : await createExpenseAction(data);
      if (!result.ok) setError(result.error);
      else onClose();
    } catch {
      setError("Unable to save the expense. Please try again.");
    } finally {
      setPending(false);
      router.refresh();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#102c29]/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="expense-dialog-title"
        className="w-full max-w-lg bg-white p-6 shadow-xl"
      >
        <h2 id="expense-dialog-title" className="text-xl font-semibold">
          {initial ? "Edit expense" : "Add expense"}
        </h2>
        {error && (
          <p
            role="alert"
            className="mt-4 border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
          >
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            <span>Expense name</span>
            <input
              required
              maxLength={160}
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Amount (BDT)</span>
            <input
              required
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Date</span>
            <input
              required
              type="date"
              value={expenseDate}
              onChange={(event) => setExpenseDate(event.target.value)}
              className={fieldClass}
            />
          </label>
          <div className="flex justify-end gap-2 border-t border-[#e2ebe8] pt-4 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53] disabled:opacity-60"
            >
              {pending ? "Saving..." : initial ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
