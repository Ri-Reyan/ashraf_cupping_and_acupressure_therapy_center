// Verify the signed staff session before dashboard requests reach route handlers.
// The dashboard layout separately confirms the active database user and role.
import { NextResponse, type NextRequest } from "next/server";

// Verify access tokens and renew them from a valid refresh token before routing.
// The dashboard layout separately confirms the active database user and role.
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_MAX_AGE,
  createAccessToken,
  REFRESH_TOKEN_COOKIE,
  verifyToken,
} from "@/lib/session-tokens";

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  try {
    if (!accessToken) throw new Error("Missing access token");
    await verifyToken(accessToken, "access");
    return NextResponse.next();
  } catch {
    const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!refreshToken)
      return NextResponse.redirect(new URL("/login", request.url));

    try {
      const userId = await verifyToken(refreshToken, "refresh");
      const renewedAccessToken = await createAccessToken(userId);
      request.cookies.set(ACCESS_TOKEN_COOKIE, renewedAccessToken);
      const response = NextResponse.next({ request });
      response.cookies.set(ACCESS_TOKEN_COOKIE, renewedAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
      return response;
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(ACCESS_TOKEN_COOKIE);
      response.cookies.delete(REFRESH_TOKEN_COOKIE);
      return response;
    }
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
