import { describe, expect, it } from "vitest";
import {
  AppointmentRuleError,
  calculateTherapistShare,
  getNextPackageCount,
} from "@/features/appointments/rules";

describe("appointment calculations", () => {
  it("rounds therapist share to the nearest whole taka", () => {
    expect(calculateTherapistShare(500, 33)).toBe(165);
    expect(calculateTherapistShare(5, 50)).toBe(3);
  });

  it("advances an unfinished session package by one", () => {
    expect(getNextPackageCount({ sessionCount: 6, currentCount: 2 })).toBe(3);
  });

  it("rejects complete or malformed packages", () => {
    expect(() =>
      getNextPackageCount({ sessionCount: 3, currentCount: 3 }),
    ).toThrow(AppointmentRuleError);
    expect(() =>
      getNextPackageCount({ sessionCount: null, currentCount: 1 }),
    ).toThrow(AppointmentRuleError);
  });
});
