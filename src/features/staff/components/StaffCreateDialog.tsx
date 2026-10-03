// Initial staff account dialog for ADMIN users.
// The password is sent once to the server action and never returned or stored plain.
"use client";

import { useState, type FormEvent } from "react";
import { createStaffAction } from "../actions";

const fieldClass =
  "h-11 w-full border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]";

export function StaffCreateDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState<"ADMIN" | "RECEPTIONIST">("RECEPTIONIST");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const result = await createStaffAction({
        name,
        email,
        mobile,
        role,
        password,
      });
      if (!result.ok) setError(result.error);
      else onClose();
    } catch {
      setError("Unable to create the staff account. Please try again.");
    } finally {
      setPending(false);
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
        aria-labelledby="staff-dialog-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl"
      >
        <h2 id="staff-dialog-title" className="text-xl font-semibold">
          Add staff account
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
            <span>Name</span>
            <input
              required
              maxLength={120}
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Email</span>
            <input
              required
              type="email"
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Mobile</span>
            <input
              required
              type="tel"
              autoComplete="tel"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Role</span>
            <select
              value={role}
              onChange={(event) =>
                setRole(event.target.value as "ADMIN" | "RECEPTIONIST")
              }
              className={fieldClass}
            >
              <option value="RECEPTIONIST">Receptionist</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Initial password</span>
            <input
              required
              type="password"
              minLength={12}
              maxLength={256}
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
              {pending ? "Creating..." : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
