// Prisma reads and writes for staff profiles.
// Password hashing and last-admin rules remain in the service layer.
import "server-only";
import { prisma } from "@/lib/prisma";

export type StaffTransaction = Parameters<
  Parameters<typeof prisma.transaction>[0]
>[0];

export function listStaffRecords(showBlocked: boolean) {
  return prisma.orm.public.User.where({
    status: showBlocked ? "BLOCKED" : "ACTIVE",
  })
    .orderBy([(user) => user.name.asc(), (user) => user.email.asc()])
    .select("id", "name", "email", "mobile", "role", "status")
    .all();
}

export function findStaffRecord(id: string, tx: StaffTransaction) {
  return tx.orm.public.User.where({ id }).first();
}

export function createStaffRecord(input: {
  name: string;
  email: string;
  mobile: string;
  role: "ADMIN" | "RECEPTIONIST";
  passwordHash: string;
  status: "ACTIVE";
}) {
  return prisma.orm.public.User.create(input);
}

export function countActiveAdmins(tx: StaffTransaction) {
  return tx.orm.public.User.where({
    role: "ADMIN",
    status: "ACTIVE",
  }).aggregate((aggregate) => ({ count: aggregate.count() }));
}

export function setStaffStatus(
  id: string,
  status: "ACTIVE" | "BLOCKED",
  tx: StaffTransaction,
) {
  return tx.orm.public.User.where({ id }).update({ status });
}
