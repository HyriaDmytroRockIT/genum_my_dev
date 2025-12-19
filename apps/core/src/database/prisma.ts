import "dotenv/config";
import { PrismaClient } from "@/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton pattern for PrismaClient
 *
 * Guarantees:
 * - One connection to the DB for the entire application
 * - Proper work with hot-reload in development
 * - No problems with connection pool exhaustion
 */
let prisma: PrismaClient;

declare global {
	// eslint-disable-next-line no-var
	var __prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({
	connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient({ adapter });
} else {
	// in development mode, use global variable to avoid creating multiple instances on hot-reload
	if (!global.__prisma) {
		global.__prisma = new PrismaClient({ adapter });
	}
	prisma = global.__prisma;
}

// Graceful shutdown - close connection when process is exiting
if (typeof process !== "undefined") {
	process.on("beforeExit", async () => {
		await prisma.$disconnect();
	});
}

export { prisma };
