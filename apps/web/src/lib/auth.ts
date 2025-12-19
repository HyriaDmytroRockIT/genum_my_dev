/**
 * Authentication mode detection and utilities
 * Supports both cloud (Auth0) and self-hosted (cookie-based) authentication
 */

import { runtimeConfig } from "./runtime-config";

export type AuthMode = "cloud" | "local";

/**
 * Determines the authentication mode from environment variables
 * Defaults to 'cloud' if not specified
 */
export function getAuthMode(): AuthMode {
	const mode = runtimeConfig.AUTH_MODE;
	if (mode === "local") {
		return "local";
	}
	return "cloud"; // Default to cloud
}

/**
 * Checks if the current instance is using cloud (Auth0) authentication
 */
export function isCloudAuth(): boolean {
	return getAuthMode() === "cloud";
}

/**
 * Checks if the current instance is using self-hosted (cookie-based) authentication
 */
export function isLocalAuth(): boolean {
	return getAuthMode() === "local";
}

/**
 * Gets the API URL from environment variables
 */
export function getApiUrl(): string {
	return runtimeConfig.API_URL;
}
