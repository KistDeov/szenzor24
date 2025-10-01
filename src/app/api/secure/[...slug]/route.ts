import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

async function authorize(request: Request) {
  const session = await getServerSession(authOptions);
  if (session) return { ok: true, method: "session" };

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
  return `present; len=${value.length}; tail=${value.slice(-3)}`;
}

function getPathname(request: Request) {
  const url = new URL(request.url);
  return url.pathname.replace(/\/+$/, "");
}

export async function GET(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const pathname = getPathname(request);

  if (pathname.endsWith("/api/secure/keys")) {
    // If the request was authorized via the client API token, return the
    // real values so the trusted client can use them. If authorized via a
    // session, continue to return masked presence information.
    const isClient = auth.method === "token";
    return NextResponse.json({
      DATABASE_URL: isClient ? process.env.DATABASE_URL ?? null : maskPresence(process.env.DATABASE_URL),
      OPENAI_API_KEY: isClient ? process.env.OPENAI_API_KEY ?? null : maskPresence(process.env.OPENAI_API_KEY),
    });
  }

  return new NextResponse(JSON.stringify({ error: "not found" }), { status: 404 });
}

export async function POST(request: Request) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return new NextResponse(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  const pathname = getPathname(request);

  if (pathname.endsWith("/api/secure/openai/proxy")) {
    const body = await request.text();
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new NextResponse(JSON.stringify({ error: "server misconfigured" }), { status: 500 });

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
