#!/usr/bin/env node

import { execSync } from "node:child_process";

// do not install lefthook if CI, DOCKER_BUILD or SKIP_LEFTHOOK_INSTALL is set
if (process.env.CI || process.env.DOCKER_BUILD || process.env.SKIP_LEFTHOOK_INSTALL) {
	console.log("Skipping lefthook install");
	process.exit(0);
} else {
	console.log("Installing lefthook");
	execSync("pnpm lefthook install", { stdio: "inherit" });
}
