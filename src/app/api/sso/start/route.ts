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
  return NextResponse.redirect(new URL("/login", getHubUrl(request)));
}
