// Patient profile actions shown only to ADMIN users.
// Delete remains disabled whenever any appointment, including deleted ones, exists.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deletePatientAction } from "../actions";
import { PatientEditDialog } from "./PatientEditDialog";

type PatientProfile = {
  id: string;
  name: string;
  mobile: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
};

export function PatientProfileActions({
  patient,
  hasAppointments,
}: {
  patient: PatientProfile;
  hasAppointments: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (hasAppointments) return;
    if (!window.confirm(`Permanently delete ${patient.name}?`)) return;
    setPending(true);
    setError("");
    try {
      const result = await deletePatientAction({ id: patient.id });
      if (!result.ok) setError(result.error);
      else router.replace("/dashboard/patients");
    } catch {
      setError("Unable to delete this patient. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <p role="alert" className="w-full text-sm text-[#9b3f35]">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex min-h-11 items-center gap-2 border border-[#cbdad6] px-4 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
      >
        <Pencil aria-hidden="true" className="size-4" />
        Edit details
      </button>
      <button
        type="button"
        disabled={hasAppointments || pending}
        onClick={handleDelete}
        title={
          hasAppointments
            ? "Patients with appointments cannot be deleted"
            : "Delete patient"
        }
        className="flex min-h-11 items-center gap-2 border border-[#e7c7c2] px-4 text-sm font-medium text-[#9b3f35] hover:bg-[#fbf2f0] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {pending ? "Deleting..." : "Delete patient"}
      </button>
      {hasAppointments && (
        <p className="w-full text-xs text-[#69807c]">
          This patient has appointments and cannot be deleted.
        </p>
      )}
      {editing && (
        <PatientEditDialog
          patient={patient}
          onClose={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
