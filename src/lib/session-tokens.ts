// Signs and verifies the two database-auth session tokens.
// Access tokens are short-lived; refresh tokens live longer and only renew access.
import "server-only";
import { SignJWT, jwtVerify } from "jose";

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const ACCESS_TOKEN_MAX_AGE = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

function signingKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must contain at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

async function signToken(
  userId: string,
  tokenUse: "access" | "refresh",
  lifetime: string,
) {
  return new SignJWT({ tokenUse })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer("acupressure-clinic")
    .setAudience("clinic-dashboard")
    .setIssuedAt()
    .setExpirationTime(lifetime)
    .sign(signingKey());
}

export function createAccessToken(userId: string) {
  return signToken(userId, "access", "15m");
}

export function createRefreshToken(userId: string) {
  return signToken(userId, "refresh", "7d");
}

export async function verifyToken(
  token: string,
  tokenUse: "access" | "refresh",
) {
  const { payload } = await jwtVerify(token, signingKey(), {
    issuer: "acupressure-clinic",
    audience: "clinic-dashboard",
  });

  if (payload.tokenUse !== tokenUse || typeof payload.sub !== "string") {
    throw new Error("Invalid session token");
  }

  return payload.sub;
}
