import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? [{ level: "query", emit: "event" }, "warn", "error"]
      : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

if (process.env.NODE_ENV === "development") {
  (prisma as any).$on("query", (e: any) => {
    logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

export default prisma;
