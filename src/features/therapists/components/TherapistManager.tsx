// Therapist card grid with profile dialogs and reversible status actions.
// Deleted view uses BLOCKED status because the current schema has no deletedAt.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, RotateCcw, UserRoundPlus, UserRoundX } from "lucide-react";
import { formatBDT } from "@/lib/format";
import { restoreTherapistAction, softDeleteTherapistAction } from "../actions";
import {
  TherapistFormDialog,
  type TherapistDraft,
} from "./TherapistFormDialog";

type TherapistCardData = TherapistDraft & { balance: number };

export function TherapistManager({
  therapists,
  showDeleted,
}: {
  therapists: TherapistCardData[];
  showDeleted: boolean;
}) {
  const [dialog, setDialog] = useState<TherapistDraft | "new" | null>(null);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  async function changeStatus(therapist: TherapistCardData, deleted: boolean) {
    if (
      deleted &&
      !window.confirm(
        `Mark ${therapist.name} as deleted? They will be hidden from active lists.`,
      )
    )
      return;
    setPendingId(therapist.id ?? null);
    setError("");
    try {
      const action = deleted
        ? softDeleteTherapistAction
        : restoreTherapistAction;
      const result = await action({ id: therapist.id });
      if (!result.ok) setError(result.error);
      else router.refresh();
    } catch {
      setError("Unable to update therapist status. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e7e3] pb-5">
        <div>
          <p className="text-sm text-[#69807c]">
            {therapists.length} {showDeleted ? "inactive" : "active"} therapists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={
              showDeleted
                ? "/dashboard/therapists"
                : "/dashboard/therapists?showDeleted=1"
            }
            aria-pressed={showDeleted}
            className="flex min-h-11 items-center border border-[#cbdad6] px-3 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
          >
            {showDeleted ? "Show active" : "Show deleted"}
          </Link>
          {!showDeleted && (
            <button
              type="button"
              onClick={() => setDialog("new")}
              className="flex min-h-11 items-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53]"
            >
              <UserRoundPlus aria-hidden="true" className="size-4" />
              Add therapist
            </button>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
        >
          {error}
        </p>
      )}

      {therapists.length === 0 ? (
        <p className="py-10 text-sm text-[#69807c]">
          {showDeleted
            ? "No deleted therapists."
            : "No active therapists have been added."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {therapists.map((therapist) => (
            <article
              key={therapist.id}
              className="border border-[#d9e7e3] bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/therapists/${therapist.id}`}
                    className="text-base font-semibold text-[#183330] underline-offset-4 hover:text-[#116c61] hover:underline"
                  >
                    {therapist.name}
                  </Link>
                  <p className="mt-1 text-sm text-[#526965]">
                    {therapist.mobile}
                  </p>
                </div>
                {showDeleted && (
                  <span className="shrink-0 border border-[#e7c7c2] px-2 py-1 text-xs font-medium text-[#9b3f35]">
                    Deleted
                  </span>
                )}
              </div>
              <div className="mt-5 border-t border-[#e2ebe8] pt-4">
                <p className="text-xs font-medium uppercase text-[#69807c]">
                  Current balance
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {formatBDT(therapist.balance)}
                </p>
              </div>
              <div className="mt-4 flex justify-end gap-1 border-t border-[#e2ebe8] pt-3">
                {showDeleted ? (
                  <button
                    type="button"
                    disabled={pendingId === therapist.id}
                    onClick={() => changeStatus(therapist, false)}
                    title={`Restore ${therapist.name}`}
                    className="flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-[#116c61] hover:bg-[#edf5f1] disabled:opacity-60"
                  >
                    <RotateCcw aria-hidden="true" className="size-4" />
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setDialog(therapist)}
                      title={`Edit ${therapist.name}`}
                      className="flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === therapist.id}
                      onClick={() => changeStatus(therapist, true)}
                      title={`Delete ${therapist.name}`}
                      className="flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-[#9b3f35] hover:bg-[#fbf2f0] disabled:opacity-60"
                    >
                      <UserRoundX aria-hidden="true" className="size-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {dialog && (
        <TherapistFormDialog
          key={dialog === "new" ? "new" : dialog.id}
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
