import type { NextFunction, Request, Response } from "express";
import type {
	Organization,
	OrganizationMember,
	Project,
	ProjectMember,
	User,
	OrganizationQuota,
} from "@/prisma";
import { auth0AuthMiddleware } from "./auth0/auth0";
import { localAuthMiddleware } from "./local/middleware";
import { isLocalInstance } from "@/utils/env";

export type GenumMetadata = {
	ids: {
		userID: number;
		orgID: number;
		projID: number;
	};
	user: User;
	organization: Organization;
	organizationMember: OrganizationMember;
	organizationQuota: OrganizationQuota;
	project: Project;
	projectMember: ProjectMember;
};

declare global {
	namespace Express {
		interface Request {
			genumMeta: GenumMetadata;
		}
	}
}

// middleware to check JWT
export function checkJwt(req: Request, res: Response, next: NextFunction) {
	if (isLocalInstance()) {
		localAuthMiddleware(req, res, next);
	} else {
		auth0AuthMiddleware(req, res, next);
	}
}

// generic function to extract metadata from headers
export function extractMetadataIds(req: Request, userID: number): GenumMetadata["ids"] {
	const orgID = req.headers["lab-org-id"] as string;
	const projID = req.headers["lab-proj-id"] as string;

	// if user endpoint - skip orgID and projID
	const isUserMeEndpoint = req.path.startsWith("/user/");
	if (!isUserMeEndpoint) {
		if (!orgID) {
			throw new Error("orgID not found");
		}
		if (!projID) {
			throw new Error("projID not found");
		}
	}

	return {
		userID,
		orgID: orgID ? Number(orgID) : -1,
		projID: projID ? Number(projID) : -1,
	};
}
