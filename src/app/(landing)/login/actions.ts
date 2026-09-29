// Database-backed login and logout mutations for staff.
// Passwords are verified with Argon2 and never leave the server action.
"use server";

import argon2 from "argon2";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
  createRefreshToken,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/session-tokens";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

export async function loginWithPassword(input: unknown) {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid email and password." };
  }

  const user = await prisma.orm.public.User.where({
    email: parsed.data.email.trim().toLowerCase(),
  }).first();

  if (
    !user ||
    user.deletedAt ||
    (user.role !== "ADMIN" && user.role !== "RECEPTIONIST") ||
    !user.passwordHash
  ) {
    return { ok: false as const, error: "Invalid email or password." };
  }

  const passwordMatches = await argon2.verify(
    user.passwordHash,
    parsed.data.password,
  );
  if (!passwordMatches) {
    return { ok: false as const, error: "Invalid email or password." };
  }

  const [accessToken, refreshToken] = await Promise.all([
    createAccessToken(user.id),
    createRefreshToken(user.id),
  ]);
  const cookieStore = await cookies();
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return { ok: true as const };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
