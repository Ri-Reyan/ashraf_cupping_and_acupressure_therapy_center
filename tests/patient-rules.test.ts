import { describe, expect, it } from "vitest";
import {
  assertPatientCanBeDeleted,
  getActiveSessionPackages,
  PatientRuleError,
} from "@/features/patients/rules";

describe("patient deletion rule", () => {
  it("allows deletion only when there are no appointment rows", () => {
    expect(() => assertPatientCanBeDeleted(0)).not.toThrow();
    expect(() => assertPatientCanBeDeleted(1)).toThrow(PatientRuleError);
    expect(() => assertPatientCanBeDeleted(5)).toThrow(PatientRuleError);
  });
});

describe("active patient session packages", () => {
  it("uses the latest visit per package and excludes completed packages", () => {
    expect(
      getActiveSessionPackages([
        {
          isSession: true,
          sessionGroupId: "complete-package",
          currentCount: 4,
          sessionCount: 4,
        },
        {
          isSession: true,
          sessionGroupId: "complete-package",
          currentCount: 3,
          sessionCount: 4,
        },
        {
          isSession: true,
          sessionGroupId: "active-package",
          currentCount: 2,
          sessionCount: 6,
        },
      ]),
    ).toEqual([
      {
        sessionGroupId: "active-package",
        currentCount: 2,
        sessionCount: 6,
      },
    ]);
  });
});
