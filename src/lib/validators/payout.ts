// Therapist payout input validation.
// Enforces the policy minimum before balance checks run in the service.
import { z } from "zod";

export const payoutSchema = z.object({
  therapistId: z.uuid(),
  amount: z.number().int().min(500).safe(),
});

export type PayoutInput = z.infer<typeof payoutSchema>;
