// Database-backed login, logout, and password-reset mutations for staff.
// Password reset tokens are single-use Redis values; passwords use Argon2.
"use server";

import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
  createRefreshToken,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE,
} from "@/lib/session-tokens";
import { sendPasswordResetEmail } from "@/lib/mailer";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});

const resetRequestSchema = z.object({ email: z.email().max(254) });
const resetPasswordSchema = z
  .object({
    token: z.string().min(40).max(100),
    password: z.string().min(12).max(256),
    confirmPassword: z.string().min(12).max(256),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
  });

const RESET_NOTICE =
  "If an active staff account uses that email, a password reset link is on its way.";
const INVALID_RESET_LINK = "This password reset link is invalid or expired.";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

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

export async function requestPasswordReset(input: unknown) {
  const parsed = resetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid email address." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  try {
    const allowed = await redis.set(
      `password-reset:rate:${sha256(email)}`,
      "1",
      { ex: 60, nx: true },
    );
    if (!allowed) return { ok: true as const, message: RESET_NOTICE };

    const user = await prisma.orm.public.User.where({ email }).first();
    if (
      !user ||
      user.status !== "ACTIVE" ||
      (user.role !== "ADMIN" && user.role !== "RECEPTIONIST")
    ) {
      return { ok: true as const, message: RESET_NOTICE };
    }

    const token = randomBytes(32).toString("base64url");
    await redis.set(`password-reset:token:${sha256(token)}`, user.id, {
      ex: 30 * 60,
    });

    const appUrl = process.env.APP_URL;
    if (!appUrl) throw new Error("APP_URL is not configured");
    const resetUrl = new URL("/reset-password", appUrl);
    resetUrl.searchParams.set("token", token);
    await sendPasswordResetEmail(email, resetUrl.toString());
  } catch {
    console.error("Password reset request could not be completed.");
  }

  return { ok: true as const, message: RESET_NOTICE };
}

export async function resetPassword(input: unknown) {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Enter a password of at least 12 characters and confirm it.",
    };
  }

  const userId = await redis.getdel<string>(
    `password-reset:token:${sha256(parsed.data.token)}`,
  );
  if (!userId) return { ok: false as const, error: INVALID_RESET_LINK };

  const user = await prisma.orm.public.User.where({ id: userId }).first();
  if (!user || user.status !== "ACTIVE") {
    return { ok: false as const, error: INVALID_RESET_LINK };
  }

  const passwordHash = await argon2.hash(parsed.data.password);
  await prisma.orm.public.User.where({ id: userId }).update({ passwordHash });

  return { ok: true as const };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}
