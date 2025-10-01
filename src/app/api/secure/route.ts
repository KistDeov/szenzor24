import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

async function authorize(request: Request) {
  // 1) Prefer session-based auth
  const session = await getServerSession(authOptions);
  if (session) return { ok: true, method: "session" };

  // 2) Fallback to a static client token sent in Authorization: Bearer <token>
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    const expected = process.env.CLIENT_API_TOKEN;
    if (expected && token === expected) return { ok: true, method: "token" };
  }

  return { ok: false };
}

function maskPresence(value?: string | null) {
  if (!value) return null;
  // Return length and last 3 chars to hint presence without leaking key
  return `present; len=${value.length}; tail=${value.slice(-3)}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "");

  const auth = await authorize(request);
  if (!auth.ok) {
    return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  // only one top-level route: /api/secure/keys
  if (pathname.endsWith("/api/secure/keys")) {
    return NextResponse.json({
      DATABASE_URL: maskPresence(process.env.DATABASE_URL),
      OPENAI_API_KEY: maskPresence(process.env.OPENAI_API_KEY),
    });
  }

  return new NextResponse(JSON.stringify({ error: "not found" }), { status: 404 });
}

export async function POST(request: Request) {
  // POST used to proxy OpenAI requests to keep key server-side
  const auth = await authorize(request);
  if (!auth.ok) {
    return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, "");

  // expected path: /api/secure/openai/proxy
  if (pathname.endsWith("/api/secure/openai/proxy")) {
    const body = await request.text();

    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      return new NextResponse(JSON.stringify({ error: "server misconfigured" }), { status: 500 });
    }

    // Forward the request body to OpenAI with server-side key
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body,
      });

      const text = await res.text();
      return new NextResponse(text, { status: res.status, headers: { "content-type": res.headers.get("content-type") || "application/json" } });
    } catch (err: any) {
      return new NextResponse(JSON.stringify({ error: String(err) }), { status: 502 });
    }
  }

  return new NextResponse(JSON.stringify({ error: "not found" }), { status: 404 });
}
