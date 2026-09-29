// Service catalog input validation.
// Names are normalized and bounded before repository-level uniqueness checks.
import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
