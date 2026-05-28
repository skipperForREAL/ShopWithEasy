import { PrismaClient } from "@prisma/client";
import { getPrismaDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: { url: getPrismaDatabaseUrl() },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reuse one client across hot reloads in dev and across invocations in serverless.
globalForPrisma.prisma = prisma;
