// Shared Zod primitives for business-feature validation.
// Mobile input is normalized before the canonical BD format is checked.
import { z } from "zod";
import { BD_MOBILE_PATTERN, normalizeBdMobile } from "@/lib/mobile";

export const genderSchema = z.enum(["MALE", "FEMALE", "OTHER"]);
export const bdMobileSchema = z
  .string()
  .trim()
  .transform(normalizeBdMobile)
  .pipe(
    z
      .string()
      .regex(BD_MOBILE_PATTERN, "Enter a valid Bangladesh mobile number"),
  );

export const positiveMoneySchema = z.number().int().positive().safe();
export const nonNegativeIntegerSchema = z.number().int().nonnegative().safe();
