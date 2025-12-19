/// <reference types="node" />
import "dotenv/config";
import { join } from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
	schema: join("prisma"),
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: process.env.DATABASE_URL || "",
	},
});
