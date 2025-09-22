import { createReadStream } from "fs";
import path from "path";

export async function GET(req: Request) {
  const fileUrl = "https://github.com/%3Cowner%3E/%3Crepo%3E/releases/download/%3Ctag%3E/aimail-Setup-1.0.13.exe";
  return new Response(null, {
    status: 302,
    headers: {
      Location: fileUrl,
    },
  });
}