// Staff account list with a separate blocked/deactivated view.
// Status changes are confirmed and rechecked by ADMIN-only Server Actions.
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCcw, UserPlus, UserRoundX } from "lucide-react";
import { setStaffBlockedAction } from "../actions";
import { StaffCreateDialog } from "./StaffCreateDialog";

export type StaffRow = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "RECEPTIONIST";
  status: "ACTIVE" | "BLOCKED";
};

export function StaffManager({
  staff,
  showBlocked,
}: {
  staff: StaffRow[];
  showBlocked: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const router = useRouter();

  async function changeStatus(member: StaffRow, blocked: boolean) {
    const verb = blocked ? "deactivate" : "restore";
    if (
      !window.confirm(
        `${verb === "deactivate" ? "Deactivate" : "Restore"} ${member.name}'s account?`,
      )
    )
      return;
    setPendingId(member.id);
    setError("");
    try {
      const result = await setStaffBlockedAction({ id: member.id, blocked });
      if (!result.ok) setError(result.error);
      else router.refresh();
    } catch {
      setError("Unable to update this staff account. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e7e3] pb-5">
        <p className="text-sm text-[#69807c]">
          {staff.length} {showBlocked ? "deactivated" : "active"} accounts
        </p>
        <div className="flex items-center gap-2">
          <Link
            href={
              showBlocked
                ? "/dashboard/staff"
                : "/dashboard/staff?showBlocked=1"
            }
            aria-pressed={showBlocked}
            className="flex min-h-11 items-center border border-[#cbdad6] px-3 text-sm font-medium text-[#526965] hover:bg-[#f1f5f4]"
          >
            {showBlocked ? "Show active" : "Show deactivated"}
          </Link>
          {!showBlocked && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex min-h-11 items-center gap-2 bg-[#116c61] px-4 text-sm font-semibold text-white hover:bg-[#0d5d53]"
            >
              <UserPlus aria-hidden="true" className="size-4" />
              Add staff
            </button>
          )}
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 border border-[#e7c7c2] bg-[#fbf2f0] px-3 py-2 text-sm text-[#9b3f35]"
        >
          {error}
        </p>
      )}

      {staff.length === 0 ? (
        <p className="py-10 text-sm text-[#69807c]">
          {showBlocked
            ? "No deactivated accounts."
            : "No active staff accounts."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border-y border-[#d9e7e3]">
          <table className="w-full min-w-200 border-collapse text-left text-sm">
            <thead className="bg-[#edf4f1] text-xs uppercase text-[#526965]">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Email
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Mobile
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Role
                </th>
                <th scope="col" className="px-3 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-3 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2ebe8]">
              {staff.map((member) => (
                <tr key={member.id} className="bg-white hover:bg-[#f8fbf9]">
                  <td className="px-3 py-3 font-medium">{member.name}</td>
                  <td className="px-3 py-3">{member.email}</td>
                  <td className="px-3 py-3">{member.mobile}</td>
                  <td className="px-3 py-3">{member.role.toLowerCase()}</td>
                  <td className="px-3 py-3">{member.status.toLowerCase()}</td>
                  <td className="px-3 py-2 text-right">
                    {showBlocked ? (
                      <button
                        type="button"
                        disabled={pendingId === member.id}
                        onClick={() => changeStatus(member, false)}
                        className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-[#116c61] hover:bg-[#edf5f1] disabled:opacity-60"
                      >
                        <RotateCcw aria-hidden="true" className="size-4" />
                        Restore
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pendingId === member.id}
                        onClick={() => changeStatus(member, true)}
                        className="inline-flex min-h-10 items-center gap-2 px-3 text-sm font-medium text-[#9b3f35] hover:bg-[#fbf2f0] disabled:opacity-60"
                      >
                        <UserRoundX aria-hidden="true" className="size-4" />
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <StaffCreateDialog
          onClose={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
