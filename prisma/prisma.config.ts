import path from "path";
import dotenv from "dotenv";
import { defineConfig } from "@prisma/config";

// Biztos .env betöltés a projekt gyökeréből
dotenv.config({ path: path.join(process.cwd(), ".env") });

const rawDbUrl = process.env.DATABASE_URL || "";
const dbUrl = rawDbUrl ? rawDbUrl.replace("localhost", "127.0.0.1") : "";

// A `prisma generate` nem igényel valódi DB kapcsolatot, de a config betöltése
// itt történik, ezért hiányzó DATABASE_URL esetén csak DB-módosító parancsokra dobunk.
const argv = process.argv.join(" ");
const commandNeedsRealDbUrl = /(\b(prisma\s+)?(migrate|db\s+push|db\s+pull|introspect|studio)\b)/i.test(
  argv,
);

if (!dbUrl && commandNeedsRealDbUrl) {
  throw new Error("DATABASE_URL hiányzik a környezeti változók közül!");
}

// Fallback URL csak generáláshoz/validáláshoz; DB parancsoknál fentebb már dobunk.
const effectiveDbUrl = dbUrl || "mysql://user:password@127.0.0.1:3306/prisma";

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  migrations: {
    path: path.join(process.cwd(), "prisma", "migrations"),
  },
  datasource: {
    url: effectiveDbUrl,
  },
});