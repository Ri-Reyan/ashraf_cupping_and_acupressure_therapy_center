// Server-only guards for authenticated staff and role-protected routes.
// Signed access-token identity is accepted only when it maps to an active User row.
import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ACCESS_TOKEN_COOKIE, verifyToken } from "@/lib/session-tokens";

export type StaffRole = "ADMIN" | "RECEPTIONIST";

export async function requireUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) redirect("/login");

  let userId: string;
  try {
    userId = await verifyToken(token, "access");
  } catch {
    redirect("/login");
  }

  const user = await prisma.orm.public.User.where({ id: userId! }).first();
  if (!user || user.status === "BLOCKED") {
    redirect("/login");
  }
  const role: StaffRole | null =
    user.role === "ADMIN" || user.role === "RECEPTIONIST" ? user.role : null;
  if (!role) redirect("/login");

  return { ...user, role };
}

export async function requireRole(role: StaffRole) {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
