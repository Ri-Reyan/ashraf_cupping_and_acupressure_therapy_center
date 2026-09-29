"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { loginWithPassword } from "@/app/(landing)/login/actions";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123456789");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginWithPassword({ email, password });
      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-130px)] bg-[#f4f7f5] px-4 py-12 text-[#183330]">
      <div className="mx-auto grid min-h-140 max-w-5xl overflow-hidden border border-[#d9e7e3] bg-white shadow-sm md:grid-cols-[1fr_0.9fr]">
        <section className="flex flex-col justify-between bg-[#116c61] p-8 text-white md:p-12">
          <div className="flex items-center gap-3 text-sm font-semibold tracking-wide">
            <span className="grid size-10 place-items-center border border-white/30">
              <ShieldCheck className="size-5" />
            </span>
            ASHRAF THERAPY CENTER
          </div>
          <div className="max-w-sm py-14 md:py-0">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Staff workspace
            </p>
            <h1 className="font-serif text-4xl font-semibold leading-tight">
              Care, recorded with clarity.
            </h1>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/75">
              Secure access for the clinic team.
            </p>
          </div>
          <p className="text-xs text-white/65">Authorized staff only</p>
        </section>

        <section className="flex items-center px-7 py-10 md:px-12">
          <div className="w-full max-w-sm">
            <p className="text-sm font-medium text-[#116c61]">Welcome back</p>
            <h2 className="mt-2 text-2xl font-semibold">Sign in</h2>
            <p className="mt-2 text-sm text-[#69807c]">
              Use your staff email and password.
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
                <span>Email address</span>
                <span className="flex h-11 items-center gap-3 border border-[#d9e7e3] px-3 focus-within:border-[#116c61] focus-within:ring-1 focus-within:ring-[#116c61]">
                  <Mail aria-hidden="true" className="size-4 text-[#69807c]" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@clinic.com"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa9a5]"
                  />
                </span>
              </label>

              <label className="block space-y-2 text-sm font-medium">
                <span>Password</span>
                <span className="flex h-11 items-center gap-3 border border-[#d9e7e3] px-3 focus-within:border-[#116c61] focus-within:ring-1 focus-within:ring-[#116c61]">
                  <LockKeyhole
                    aria-hidden="true"
                    className="size-4 text-[#69807c]"
                  />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center bg-[#116c61] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0d5d53] disabled:cursor-wait disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
