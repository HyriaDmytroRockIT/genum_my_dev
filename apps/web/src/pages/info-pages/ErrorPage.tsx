import { useMemo } from "react";
import { isRouteErrorResponse } from "react-router-dom";

export function ErrorPage({ error }: any) {
	const content = useMemo(() => {
		if (isRouteErrorResponse(error)) {
			return (
				<>
					<h2>
						{error.status} {error.statusText}
					</h2>
					<p>{error.data}</p>
				</>
			);
		} else if (error instanceof Error) {
			return (
				<div>
					<h2>Error</h2>
					<p>{error.message}</p>
					<p>The stack trace is:</p>
					<pre>{error.stack}</pre>
				</div>
			);
		} else {
			return <h2>Unknown Error</h2>;
		}
	}, [error]);

	return (
		<div className="h-screen w-screen flex flex-col items-center gap-4 justify-center">
			{content}
		</div>
	);
}
