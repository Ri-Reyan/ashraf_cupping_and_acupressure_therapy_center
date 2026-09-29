// Therapist create/update input validation.
// Profile fields match the current Therapist contract.
import { z } from "zod";
import {
  bdMobileSchema,
  genderSchema,
  nonNegativeIntegerSchema,
} from "@/lib/validators/shared";

export const therapistSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mobile: bdMobileSchema,
  location: z.string().trim().max(200).nullable().optional(),
  education: z.string().trim().max(200).nullable().optional(),
  age: nonNegativeIntegerSchema.max(130),
  gender: genderSchema,
});

export type TherapistInput = z.infer<typeof therapistSchema>;
