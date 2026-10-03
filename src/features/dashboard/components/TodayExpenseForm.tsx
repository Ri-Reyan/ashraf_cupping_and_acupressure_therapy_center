// Compact inline form for adding today's Dhaka-dated expense.
// The Server Action authenticates the staff member and validates the entry.
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createExpenseAction } from "@/features/expenses/actions";

export function TodayExpenseForm({ date }: { date: string }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await createExpenseAction({
        name,
        amount: Number(amount),
        expenseDate: date,
      });
      if (!result.ok) setError(result.error);
      else {
        setName("");
        setAmount("");
        router.refresh();
      }
    } catch {
      setError("Unable to add today's expense.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
      >
        <label className="sr-only" htmlFor="today-expense-name">
          Expense name
        </label>
        <input
          id="today-expense-name"
          required
          maxLength={160}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Expense name"
          className="h-11 min-w-0 border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
        />
        <label className="sr-only" htmlFor="today-expense-amount">
          Amount in BDT
        </label>
        <input
          id="today-expense-amount"
          required
          type="number"
          min={1}
          step={1}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount (BDT)"
          className="h-11 min-w-0 border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-11 items-center justify-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53] disabled:opacity-60"
        >
          <Plus aria-hidden="true" className="size-4" />
          {pending ? "Adding..." : "Add expense"}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[#9b3f35]">
          {error}
        </p>
      )}
    </div>
  );
}
