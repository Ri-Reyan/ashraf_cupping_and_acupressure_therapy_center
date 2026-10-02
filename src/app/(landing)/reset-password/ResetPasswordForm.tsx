// Client form for submitting a password-reset token and new password.
// The parent page reads the token using Next.js page searchParams.
"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/app/(landing)/login/actions";

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await resetPassword({ token, password, confirmPassword });
      if (result.ok) setComplete(true);
      else setError(result.error);
    } catch {
      setError("Unable to reset your password. Please request a new link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-130px)] bg-[#f4f7f5] px-4 py-12 text-[#183330]">
      <section className="mx-auto w-full max-w-md border border-[#d9e7e3] bg-white p-7 shadow-sm md:p-10">
        <p className="text-sm font-medium text-[#116c61]">Staff workspace</p>
        <h1 className="mt-2 text-2xl font-semibold">
          {complete ? "Password updated" : "Choose a new password"}
        </h1>

        {complete ? (
          <>
            <p className="mt-3 text-sm leading-6 text-[#69807c]">
              Your password has been changed. You can now sign in with it.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-semibold text-[#116c61] underline-offset-4 hover:underline"
            >
              Continue to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-[#69807c]">
              Use at least 12 characters. This reset link expires after 30
              minutes and can only be used once.
            </p>
            {error && (
              <p
                role="alert"
                className="mt-5 border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
              >
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block space-y-2 text-sm font-medium">
                <span>New password</span>
                <input
                  type="password"
                  required
                  minLength={12}
                  maxLength={256}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-11 w-full border border-[#d9e7e3] px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                <span>Confirm new password</span>
                <input
                  type="password"
                  required
                  minLength={12}
                  maxLength={256}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-11 w-full border border-[#d9e7e3] px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !token}
                className="flex h-11 w-full items-center justify-center bg-[#116c61] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0d5d53] disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Updating password..." : "Update password"}
              </button>
              {!token && (
                <p role="status" className="text-sm text-[#9b3f35]">
                  This reset link is missing or invalid. Request a new one.
                </p>
              )}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
