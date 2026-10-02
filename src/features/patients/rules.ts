// Pure patient deletion guard shared by the service and tests.
// Any appointment row blocks deletion, including soft-deleted appointments.
export class PatientRuleError extends Error {
  constructor(readonly code: "NOT_FOUND" | "HAS_APPOINTMENTS") {
    super(code);
  }
}

export function assertPatientCanBeDeleted(appointmentCount: number) {
  if (appointmentCount > 0) throw new PatientRuleError("HAS_APPOINTMENTS");
}

export function getActiveSessionPackages(
  newestFirstVisits: {
    isSession: boolean;
    sessionGroupId: string | null;
    currentCount: number | null;
    sessionCount: number | null;
  }[],
) {
  const seen = new Set<string>();
  const active: {
    sessionGroupId: string;
    currentCount: number;
    sessionCount: number;
  }[] = [];

  for (const visit of newestFirstVisits) {
    const groupId = visit.sessionGroupId;
    if (!visit.isSession || !groupId || seen.has(groupId)) continue;
    seen.add(groupId);
    const currentCount = visit.currentCount;
    const sessionCount = visit.sessionCount;
    if (
      currentCount !== null &&
      sessionCount !== null &&
      currentCount < sessionCount
    ) {
      active.push({ sessionGroupId: groupId, currentCount, sessionCount });
    }
  }
  return active;
}
