// Payout controls reflect the current computed balance, with server validation too.
// The minimum payout is always ৳ 500, regardless of the available balance.
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createTherapistPayoutAction } from "../actions";
import { formatBDT } from "@/lib/format";

export function TherapistPayoutForm({
  therapistId,
  balance,
}: {
  therapistId: string;
  balance: number;
}) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();
  const eligible = balance >= 500;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setPending(true);
    try {
      const result = await createTherapistPayoutAction({
        therapistId,
        amount: Number(amount),
      });
      if (!result.ok) setError(result.error);
      else {
        setSuccess(
          `Payout recorded. Remaining balance: ${formatBDT(result.data.balance)}.`,
        );
        setAmount("");
        router.refresh();
      }
    } catch {
      setError("Unable to record the payout. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="border-y border-[#d9e7e3] py-6">
      <h2 className="text-base font-semibold">Record payout</h2>
      {!eligible ? (
        <p className="mt-2 text-sm text-[#9b3f35]">
          Payout is unavailable until the balance reaches ৳ 500. Current
          balance: {formatBDT(balance)}.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="w-full max-w-xs space-y-2 text-sm font-medium">
            <span>Amount (৳ 500–{formatBDT(balance)})</span>
            <input
              required
              type="number"
              min={500}
              max={balance}
              step={1}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="h-11 w-full border border-[#cbdad6] bg-white px-3 outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53] disabled:opacity-60"
          >
            {pending ? "Recording..." : "Record payout"}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-[#9b3f35]">
          {error}
        </p>
      )}
      {success && (
        <p role="status" className="mt-3 text-sm text-[#256b50]">
          {success}
        </p>
      )}
    </section>
  );
}
