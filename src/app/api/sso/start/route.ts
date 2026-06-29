import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createSsoToken } from "@/app/api/sso/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

function getHubUrl(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const localHosts = new Set(["localhost", "127.0.0.1", "192.168.88.209"]);

  if (localHosts.has(hostname)) {
    return "http://192.168.88.209:3000";
  }

  return "https://rendszer.szenzor24.hu";
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  const userId = session?.user?.id;

  if (!email || !userId) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  const token = createSsoToken({ email, userId });
  const redirectUrl = new URL("/sso-login", getHubUrl(request));
  redirectUrl.searchParams.set("token", token);

  return NextResponse.redirect(redirectUrl);
}
