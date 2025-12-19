import { RouterProvider } from "react-router-dom";
import React from "react";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { router } from "./router/router";
import { useAnalytics } from "@/hooks/useAnalytics";
import * as Sentry from "@sentry/react";
import { initSentry } from "@/lib/sentry";
import { useAuth } from "@/hooks/useAuth";

function isSafari() {
	if (typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	return /^((?!chrome|crios|android|edg|fxios).)*safari/i.test(ua);
}

export function App() {
	const { user, isAuthenticated } = useAuth();

	useAnalytics();

	React.useEffect(() => {
		if (isAuthenticated && user?.email) {
			initSentry();
			Sentry.setUser({ email: user.email });
		} else {
			Sentry.setUser(null);
		}
	}, [isAuthenticated, user?.email]);

	return (
		<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
			<RouterProvider router={router} />
			<Toaster />
		</ThemeProvider>
	);
}

export function AppRoot({ children }: { children: React.ReactNode }) {
	React.useEffect(() => {
		if (isSafari()) document.documentElement.classList.add("safari");
	}, []);
	return <>{children}</>;
}

export default App;
