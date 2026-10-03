// Staff account creation and reversible active/blocked lifecycle rules.
// BLOCKED is the available soft-delete state in the current User schema.
import "server-only";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import type { StaffCreateInput } from "./schema";
import {
  countActiveAdmins,
  createStaffRecord,
  findStaffRecord,
  setStaffStatus,
} from "./repository";

export class StaffRuleError extends Error {
  constructor(readonly code: "NOT_FOUND" | "SELF_DELETE" | "LAST_ADMIN") {
    super(code);
  }
}

export async function createStaff(input: StaffCreateInput) {
  const passwordHash = await argon2.hash(input.password);
  const staff = await createStaffRecord({
    name: input.name,
    email: input.email.trim().toLowerCase(),
    mobile: input.mobile,
    role: input.role,
    passwordHash,
    status: "ACTIVE",
  });
  return { id: staff.id };
}

export async function setStaffBlocked(
  id: string,
  actorId: string,
  blocked: boolean,
) {
  return prisma.transaction(async (tx) => {
    const staff = await findStaffRecord(id, tx);
    if (!staff) throw new StaffRuleError("NOT_FOUND");

    if (blocked && staff.status === "ACTIVE") {
      if (staff.id === actorId) throw new StaffRuleError("SELF_DELETE");
      if (staff.role === "ADMIN") {
        const { count } = await countActiveAdmins(tx);
        if (count <= 1) throw new StaffRuleError("LAST_ADMIN");
      }
    }

    await setStaffStatus(id, blocked ? "BLOCKED" : "ACTIVE", tx);
  });
}
