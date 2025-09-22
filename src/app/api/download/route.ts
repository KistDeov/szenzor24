import { prisma } from "@/lib/prismaDB";
import { NextApiRequest, NextApiResponse } from "next";
import { createReadStream } from "fs";
import path from "path";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Request query:", req.query);

    // Check if the user is authenticated
    const user = await prisma.user.findUnique({
      where: { email: req.query.email as string },
    });

    console.log("User lookup result:", user);

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the user has access to the file
    if (user.trialEnded) {
      return res.status(403).json({ error: "Trial period has ended" });
    }

    // Serve the file
    const filePath = path.join(process.cwd(), "public", "aimail", "aimail-Setup-1.0.13.exe");
    console.log("File path:", filePath);

    const stream = createReadStream(filePath);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment; filename=aimail-Setup-1.0.13.exe");

    stream.pipe(res);
  } catch (error) {
    console.error("Error serving file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}