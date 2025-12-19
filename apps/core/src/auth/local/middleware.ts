// src/auth/middleware.ts
import type { Request, Response, NextFunction } from "express";
import { getSession } from "./session";
import { type GenumMetadata, extractMetadataIds } from "../jwt";

export async function localAuthMiddleware(req: Request, res: Response, next: NextFunction) {
	const session = await getSession(req);
	if (!session) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	const userID = session.user.id;

	try {
		req.genumMeta = {} as GenumMetadata;
		req.genumMeta.ids = extractMetadataIds(req, userID);
		next();
	} catch (error: any) {
		return res.status(401).json({ error: error.message });
	}
}
