// Patient create/update input validation.
// Kept independent so forms and server actions share the same contract.
import { z } from "zod";
import {
  bdMobileSchema,
  genderSchema,
  nonNegativeIntegerSchema,
} from "@/lib/validators/shared";

export const patientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  mobile: bdMobileSchema,
  age: nonNegativeIntegerSchema.max(130),
  gender: genderSchema,
});

export type PatientInput = z.infer<typeof patientSchema>;
