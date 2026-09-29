import { describe, expect, it } from "vitest";
import { calculateTherapistBalance } from "@/lib/services/balance-calculator";

describe("therapist lifetime balance", () => {
  it("subtracts paid payouts from active appointment earnings", () => {
    expect(calculateTherapistBalance(12_500, 4_000)).toEqual({
      lifetime: 12_500,
      paid: 4_000,
      balance: 8_500,
    });
  });

  it("treats empty aggregates as zero", () => {
    expect(calculateTherapistBalance(null, null)).toEqual({
      lifetime: 0,
      paid: 0,
      balance: 0,
    });
  });
});
