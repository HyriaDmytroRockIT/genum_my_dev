import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Plugin } from "vite";

/**
 * Vite plugin that automatically maps environment variables from root .env
 * to VITE_ prefixed variables for development mode.
 *
 * This allows storing variables without VITE_ prefix in .env file,
 * while Vite can still access them with the required prefix.
 */
export function envMapper(): Plugin {
	return {
		name: "env-mapper",
		config(_config, { mode }) {
			if (mode === "development") {
				const rootEnvPath = resolve(__dirname, "../../.env");
				const envVars: Record<string, string> = {};

				try {
					const envContent = readFileSync(rootEnvPath, "utf-8");

					// List of variables that should be mapped to VITE_ prefix
					const webEnvVars = [
						"API_URL",
						"AUTH_MODE",
						"AUTH0_DOMAIN",
						"AUTH0_CLIENT_ID",
						"AUTH0_AUDIENCE",
						"SENTRY_ENABLED",
						"SENTRY_DSN",
						"SENTRY_ENVIRONMENT",
						"GA_TRACKING_ID",
					];

					// Parse .env file
					envContent.split("\n").forEach((line) => {
						line = line.trim();
						if (!line || line.startsWith("#")) return;

						const [key, ...valueParts] = line.split("=");
						if (!key) return;

						const envKey = key.trim();
						const envValue = valueParts
							.join("=")
							.trim()
							.replace(/^["']|["']$/g, "");

						// Map web variables to VITE_ prefix
						if (webEnvVars.includes(envKey)) {
							envVars[`VITE_${envKey}`] = envValue;
						}
					});

					// Merge with existing env
					return {
						define: {
							...Object.fromEntries(
								Object.entries(envVars).map(([key, value]) => [
									`import.meta.env.${key}`,
									JSON.stringify(value),
								]),
							),
						},
					};
				} catch (_error) {
					// .env file not found or unreadable - that's ok
					console.warn(`[env-mapper] Could not read .env file: ${rootEnvPath}`);
				}
			}
		},
	};
}
