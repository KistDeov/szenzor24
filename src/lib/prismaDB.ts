import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import path from "path";

// Next.js alapból betölt `.env.local`/`.env` fájlokat, de ez a modul
// önálló futtatásnál (pl. scriptek) is használható, ezért itt is betöltjük.
dotenv.config({ path: path.join(process.cwd(), ".env.local") });
dotenv.config({ path: path.join(process.cwd(), ".env") });

declare global {
  var prisma: PrismaClient | undefined;
}

function buildDatabaseUrlFromParts() {
  const host = (process.env.DB_HOST || "").trim() || "127.0.0.1";
  const user = (process.env.DB_USER || "").trim();
  // Allow empty password when DB user has no password.
  const password = process.env.DB_PASSWORD;
  const database = (process.env.DB_NAME || "").trim();
  const port = (process.env.DB_PORT || "").trim() || "3306";

  const missing = [] as string[];
  if (!user) missing.push("DB_USER");
  if (password === undefined) missing.push("DB_PASSWORD");
  if (!database) missing.push("DB_NAME");
  if (!port) missing.push("DB_PORT");

  if (missing.length) {
    throw new Error(
      `[PrismaDB] Hiányzó környezeti változó(k): ${missing.join(", ")}. Állítsd be a DATABASE_URL-t, vagy a DB_HOST/DB_USER/DB_PASSWORD/DB_NAME/DB_PORT változókat.`,
    );
  }

  const safeHost = host.replace("localhost", "127.0.0.1");
  const safeUser = encodeURIComponent(user);
  const safePassword = encodeURIComponent(password ?? "");
  const safeDatabase = encodeURIComponent(database);

  return `mysql://${safeUser}:${safePassword}@${safeHost}:${port}/${safeDatabase}`;
}

function getDatabaseUrl() {
  const fromUrl = (process.env.DATABASE_URL || "").trim();
  if (fromUrl) return fromUrl;
  return buildDatabaseUrlFromParts();
}

function parseDbUrl(url: string) {
  // Allow empty password: mysql://user:@host:port/db
  const regex = /mysql:\/\/([^:]+):([^@]*)@([^:\/]+)(?::(\d+))?\/([^?]+)/;
  const match = url.match(regex);
  if (!match) {
    throw new Error("Invalid DATABASE_URL format");
  }
  return {
    user: match[1],
    password: decodeURIComponent(match[2]),
    host: match[3].replace("localhost", "127.0.0.1"),
    port: match[4] ? parseInt(match[4], 10) : 3306,
    database: match[5],
  };
}

function getPrismaClient() {
  if (global.prisma) {
    return global.prisma;
  }

  const dbUrl = getDatabaseUrl();

  const dbConfig = parseDbUrl(dbUrl);

  const adapter = new PrismaMariaDb({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    connectionLimit: 5,
    acquireTimeout: 30000,
    connectTimeout: 10000,
    allowPublicKeyRetrieval: true,
  } as any);

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    adapter,
  });

  global.prisma = client;
  return client;
}

export const prisma = getPrismaClient();
