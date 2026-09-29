import { describe, expect, it } from "vitest";
import { isValidBdMobile, normalizeBdMobile } from "@/lib/mobile";
import { bdMobileSchema } from "@/lib/validators/shared";

describe("Bangladesh mobile normalization", () => {
  it.each([
    ["01712345678", "01712345678"],
    ["+880 1712-345678", "01712345678"],
    ["8801712345678", "01712345678"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeBdMobile(input)).toBe(expected);
    expect(isValidBdMobile(input)).toBe(true);
    expect(bdMobileSchema.parse(input)).toBe(expected);
  });

  it.each(["02123456789", "0171234567", "+1 555 123 4567"])(
    "rejects invalid mobile %s",
    (input) => {
      expect(isValidBdMobile(input)).toBe(false);
      expect(bdMobileSchema.safeParse(input).success).toBe(false);
    },
  );
});
