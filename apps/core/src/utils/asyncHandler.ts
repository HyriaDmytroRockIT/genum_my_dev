import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wrap an async Express handler so that thrown errors / rejected promises
 * are forwarded to Express error middleware via next(err).
 *
 * This lets controllers "throw" and rely on the global error handler,
 * without repeating try/catch(next) in every route/controller method.
 */
export function asyncHandler<
	P = Record<string, string>,
	ResBody = unknown,
	ReqBody = unknown,
	ReqQuery = Record<string, unknown>,
>(
	fn: (
		req: Request<P, ResBody, ReqBody, ReqQuery>,
		res: Response,
		next: NextFunction,
	) => unknown | Promise<unknown>,
): RequestHandler<P, ResBody, ReqBody, ReqQuery> {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
}
