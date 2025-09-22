import { prisma } from "@/lib/prismaDB";
import { NextApiRequest, NextApiResponse } from "next";
import { createReadStream } from "fs";
import path from "path";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {

    const filePath = path.join(process.cwd(), "public", "aimail", "aimail-Setup-1.0.13.exe");
    const stream = createReadStream(filePath);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=aimail-Setup-1.0.13.exe");

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}