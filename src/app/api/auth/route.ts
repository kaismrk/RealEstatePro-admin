import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? "admin_token";

/**
 * POST /api/auth
 * Proxies login to FastAPI, then sets an httpOnly cookie with the JWT.
 */
export async function POST(request: NextRequest) {
  const body = await request.json() as { email: string; password: string };

  try {
    // Step 1: get token from FastAPI
    const tokenRes = await axios.post(
      `${API_BASE}/auth/login/access-token`,
      new URLSearchParams({ username: body.email, password: body.password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const token = (tokenRes.data as { access_token: string }).access_token;

    // Step 2: verify admin identity
    const meRes = await axios.get(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const admin = meRes.data;

    if (!admin.is_admin_active) {
      return NextResponse.json(
        { detail: "Admin account is deactivated" },
        { status: 403 }
      );
    }

    // Step 3: set httpOnly cookie
    const response = NextResponse.json({ admin, token });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status ?? 500;
      const detail =
        (err.response?.data as { detail?: string } | undefined)?.detail ??
        "Authentication failed";
      return NextResponse.json({ detail }, { status });
    }
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/auth
 * Clears the auth cookie (logout).
 */
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
