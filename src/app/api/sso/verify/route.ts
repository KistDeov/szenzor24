import { verifySsoToken } from "@/app/api/sso/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json().catch(() => ({ token: null }));

  if (typeof token !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = verifySsoToken(token);

  if (!payload) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      email: payload.email,
      id: payload.userId,
    },
  });
}
