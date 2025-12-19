import { env } from "../env";

// CORS configuration
// IMPORTANT: When credentials: true, you MUST return the actual origin (cannot use '*')
export const corsOptions = {
	origin: (
		origin: string | undefined,
		callback: (err: Error | null, origin?: string | boolean) => void,
	) => {
		// 1. Allow requests with no origin (server-to-server, mobile apps, curl, Postman)
		// This is crucial for "API for external integrations" that are not browser-based.
		if (!origin) {
			return callback(null, true);
		}

		// 2. Define allowed origins
		// We trust our FRONTEND_URL defined in env
		const allowedOrigins = [env.FRONTEND_URL];

		// 3. Environment specific logic
		if (env.NODE_ENV === "development") {
			// In development, we are more permissive to allow localhost on various ports
			return callback(null, true);
		}

		// 4. Production strict check
		if (allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			// Block untrusted origins
			callback(new Error(`Origin ${origin} not allowed by CORS`));
		}
	},
	credentials: true, // Required for cookies (local auth sessions)
	allowedHeaders: [
		"Content-Type",
		"Authorization",
		"lab-org-id",
		"lab-proj-id",
		"sentry-trace",
		"baggage",
	],
	exposedHeaders: ["Set-Cookie"],
	methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};
