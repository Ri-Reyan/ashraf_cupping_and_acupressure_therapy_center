// Create/edit dialog for therapist profile details.
// Server Actions revalidate the schema and enforce ADMIN authorization.
"use client";

import { useState, type FormEvent } from "react";
import { createTherapistAction, updateTherapistAction } from "../actions";

export type TherapistDraft = {
  id?: string;
  name: string;
  mobile: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  location: string | null;
  education: string | null;
};

const fieldClass =
  "h-11 w-full border border-[#cbdad6] bg-white px-3 text-sm outline-none focus:border-[#116c61] focus:ring-1 focus:ring-[#116c61]";

export function TherapistFormDialog({
  initial,
  onClose,
}: {
  initial?: TherapistDraft;
  onClose: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [mobile, setMobile] = useState(initial?.mobile ?? "");
  const [age, setAge] = useState(String(initial?.age ?? ""));
  const [gender, setGender] = useState<TherapistDraft["gender"]>(
    initial?.gender ?? "OTHER",
  );
  const [location, setLocation] = useState(initial?.location ?? "");
  const [education, setEducation] = useState(initial?.education ?? "");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const input = {
      name,
      mobile,
      age: Number(age),
      gender,
      location: location.trim() || null,
      education: education.trim() || null,
    };

    try {
      const result = initial?.id
        ? await updateTherapistAction({ ...input, id: initial.id })
        : await createTherapistAction(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    } catch {
      setError("Unable to save therapist details. Please try again.");
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
        aria-labelledby="therapist-dialog-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-white p-6 shadow-xl"
      >
        <h2 id="therapist-dialog-title" className="text-xl font-semibold">
          {initial ? "Edit therapist" : "Add therapist"}
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
            <span>Mobile</span>
            <input
              required
              type="tel"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Age</span>
            <input
              required
              type="number"
              min={0}
              max={130}
              step={1}
              value={age}
              onChange={(event) => setAge(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Gender</span>
            <select
              value={gender}
              onChange={(event) =>
                setGender(event.target.value as TherapistDraft["gender"])
              }
              className={fieldClass}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>Location</span>
            <input
              maxLength={200}
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium sm:col-span-2">
            <span>Education</span>
            <input
              maxLength={200}
              value={education}
              onChange={(event) => setEducation(event.target.value)}
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
              {pending
                ? "Saving..."
                : initial
                  ? "Save changes"
                  : "Add therapist"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
