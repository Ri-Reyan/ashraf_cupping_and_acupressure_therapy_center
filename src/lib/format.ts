// Shared presentation formatting for BDT values.
// Accepts integer taka values and never performs floating-point conversion.
export function formatBDT(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError("BDT amount must be a safe integer");
  }

  return `৳ ${new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(amount)}`;
}
