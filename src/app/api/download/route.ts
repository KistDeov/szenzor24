import { createReadStream } from "fs";
import path from "path";

export async function GET(req: Request) {
  try {
    const filePath = path.join(process.cwd(), "public", "aimail", "aimail-Setup-1.0.13.exe");
    const stream = createReadStream(filePath);

    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    const headers = new Headers({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": "attachment; filename=aimail-Setup-1.0.13.exe",
    });

    return new Response(readableStream, { headers });
  } catch (error) {
    console.error("Error serving file:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}