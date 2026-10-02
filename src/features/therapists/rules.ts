// Pure therapist and payout rules shared by services and tests.
// BLOCKED is used as the reversible soft-delete state per the current schema.
export class TherapistRuleError extends Error {
  constructor(
    readonly code: "NOT_FOUND" | "BALANCE_TOO_LOW" | "AMOUNT_EXCEEDS_BALANCE",
  ) {
    super(code);
  }
}

export function assertPayoutAllowed(balance: number, amount: number) {
  if (balance < 500) throw new TherapistRuleError("BALANCE_TOO_LOW");
  if (amount < 500 || amount > balance) {
    throw new TherapistRuleError("AMOUNT_EXCEEDS_BALANCE");
  }
}
