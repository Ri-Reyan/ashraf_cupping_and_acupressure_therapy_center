// Appointment creation input validation.
// Server actions supply trusted creator, serial, share, and linkage values.
import { z } from "zod";
import {
  bdMobileSchema,
  genderSchema,
  nonNegativeIntegerSchema,
  positiveMoneySchema,
} from "@/lib/validators/shared";

export const appointmentSchema = z
  .object({
    patient: z.object({
      name: z.string().trim().min(1).max(120),
      mobile: bdMobileSchema,
      age: nonNegativeIntegerSchema.max(130),
      gender: genderSchema,
    }),
    therapistId: z.uuid(),
    services: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    fee: positiveMoneySchema,
    therapistPercent: z.number().int().min(0).max(100),
    isSession: z.boolean(),
    sessionCount: z.number().int().min(1).max(100).nullable().optional(),
    sessionGroupId: z.uuid().nullable().optional(),
  })
  .superRefine((appointment, context) => {
    if (
      appointment.isSession &&
      !appointment.sessionGroupId &&
      !appointment.sessionCount
    ) {
      context.addIssue({
        code: "custom",
        path: ["sessionCount"],
        message: "Session count is required for a new package",
      });
    }
    if (
      !appointment.isSession &&
      (appointment.sessionGroupId || appointment.sessionCount)
    ) {
      context.addIssue({
        code: "custom",
        path: ["isSession"],
        message: "Non-session appointments cannot include package fields",
      });
    }
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;
