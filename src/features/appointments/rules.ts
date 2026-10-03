// Pure appointment calculations shared by the transaction service and tests.
// These functions enforce therapist-share rounding and package progression.
export class AppointmentRuleError extends Error {
  constructor(
    readonly code:
      | "PACKAGE_UNAVAILABLE"
      | "PACKAGE_COMPLETE"
      | "THERAPIST_UNAVAILABLE"
      | "NOT_FOUND"
      | "LEDGER_NEGATIVE",
  ) {
    super(code);
  }
}

export function calculateTherapistShare(fee: number, percent: number) {
  return Math.round((fee * percent) / 100);
}

export function getNextPackageCount(latest: {
  sessionCount: number | null;
  currentCount: number | null;
}) {
  if (latest.sessionCount === null || latest.currentCount === null) {
    throw new AppointmentRuleError("PACKAGE_UNAVAILABLE");
  }
  if (latest.currentCount >= latest.sessionCount) {
    throw new AppointmentRuleError("PACKAGE_COMPLETE");
  }
  return latest.currentCount + 1;
}
