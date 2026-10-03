// Zod contract for appointment creation from the reception form.
// Session mode is form input; IDs, serials, and share are derived server-side.
import { z } from "zod";
import { patientSchema } from "@/lib/validators/patient";
import { positiveMoneySchema } from "@/lib/validators/shared";

export const appointmentCreateSchema = z
  .object({
    patient: patientSchema,
    therapistId: z.uuid(),
    services: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    fee: positiveMoneySchema,
    therapistPercent: z.number().int().min(0).max(100),
    isSession: z.boolean(),
    sessionMode: z.enum(["new", "continue"]).nullable(),
    sessionCount: z.number().int().min(1).max(100).nullable(),
    sessionGroupId: z.uuid().nullable(),
  })
  .superRefine((input, context) => {
    if (!input.isSession) {
      if (input.sessionMode || input.sessionCount || input.sessionGroupId) {
        context.addIssue({
          code: "custom",
          path: ["isSession"],
          message: "Package options require session mode",
        });
      }
      return;
    }

    if (
      input.sessionMode === "new" &&
      (!input.sessionCount || input.sessionGroupId)
    ) {
      context.addIssue({
        code: "custom",
        path: ["sessionCount"],
        message: "Choose a total session count for a new package",
      });
    }
    if (
      input.sessionMode === "continue" &&
      (!input.sessionGroupId || input.sessionCount)
    ) {
      context.addIssue({
        code: "custom",
        path: ["sessionGroupId"],
        message: "Choose an existing package to continue",
      });
    }
    if (!input.sessionMode) {
      context.addIssue({
        code: "custom",
        path: ["sessionMode"],
        message: "Choose whether to start or continue a package",
      });
    }
  });

export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;

export const appointmentUpdateSchema = z.object({
  id: z.uuid(),
  therapistId: z.uuid(),
  services: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
  fee: positiveMoneySchema,
  therapistPercent: z.number().int().min(0).max(100),
});

export type AppointmentUpdateInput = z.infer<typeof appointmentUpdateSchema>;
