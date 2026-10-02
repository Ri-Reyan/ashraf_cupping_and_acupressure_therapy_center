import { describe, expect, it } from "vitest";
import {
  assertPayoutAllowed,
  TherapistRuleError,
} from "@/features/therapists/rules";

describe("therapist payout rules", () => {
  it("accepts a minimum payout when balance reaches the threshold", () => {
    expect(() => assertPayoutAllowed(500, 500)).not.toThrow();
  });

  it("rejects payouts when balance is below the minimum", () => {
    expect(() => assertPayoutAllowed(499, 500)).toThrow(TherapistRuleError);
  });

  it("rejects amounts below the minimum or above balance", () => {
    expect(() => assertPayoutAllowed(800, 499)).toThrow(TherapistRuleError);
    expect(() => assertPayoutAllowed(800, 801)).toThrow(TherapistRuleError);
  });
});
