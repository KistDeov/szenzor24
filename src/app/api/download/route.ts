import { createReadStream } from "fs";
import path from "path";

export async function GET(req: Request) {
  const fileUrl = "https://github.com/KistDeov/AiServiceApp/releases/download/1.0.23/aimail-Setup-1.0.23.exe";
  return new Response(null, {
    status: 302,
    headers: {
      Location: fileUrl,
    },
  });
}