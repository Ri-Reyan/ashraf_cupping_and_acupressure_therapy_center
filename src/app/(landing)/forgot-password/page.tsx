// Staff password-reset request form for the public landing route group.
// The server action intentionally returns an account-neutral confirmation.
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/app/(landing)/login/actions";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await requestPasswordReset({ email });
      if (result.ok) setMessage(result.message);
      else setError(result.error);
    } catch {
      setError("Unable to send a reset link right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-130px)] bg-[#f4f7f5] px-4 py-12 text-[#183330]">
      <section className="mx-auto w-full max-w-md border border-[#d9e7e3] bg-white p-7 shadow-sm md:p-10">
        <p className="text-sm font-medium text-[#116c61]">Staff workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-[#69807c]">
          Enter your staff email address and we’ll send a reset link if there’s
          an active account for it.
        </p>

        {(message || error) && (
          <p
            role={error ? "alert" : "status"}
            className={`mt-5 border px-3 py-2 text-sm ${
              error
                ? "border-[#e7c7c2] bg-[#fbf2f0] text-[#9b3f35]"
                : "border-[#c9e3da] bg-[#f0f8f4] text-[#256b50]"
            }`}
          >
            {message || error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            <span>Email address</span>
            <input
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@clinic.com"
              className="h-11 w-full border border-[#d9e7e3] px-3 text-sm outline-none placeholder:text-[#9aa9a5] focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center bg-[#116c61] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0d5d53] disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-[#116c61] underline-offset-4 hover:underline"
        >
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
