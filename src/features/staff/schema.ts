// Zod input contract for admin-created staff accounts.
// Passwords are transient input and are hashed before repository persistence.
import { z } from "zod";
import { bdMobileSchema } from "@/lib/validators/shared";

export const staffCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.email().max(254),
  mobile: bdMobileSchema,
  role: z.enum(["ADMIN", "RECEPTIONIST"]),
  password: z.string().min(12).max(256),
});

export type StaffCreateInput = z.infer<typeof staffCreateSchema>;
