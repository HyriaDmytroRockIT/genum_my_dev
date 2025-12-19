import { Router, type Request, type Response } from "express";
import { db } from "@/database/db";
import { LocalUserLoginSchema, LocalUserRegisterSchema } from "@/services/validate/types/user.type";
import { createSession, destroySession } from "@/auth/local/session";
import { hashPassword, verifyPassword } from "@/auth/local/password";
import { OrganizationRole, ProjectRole } from "@/prisma";
import { asyncHandler } from "@/utils/asyncHandler";

export function createLocalUserRouter(): Router {
	const router = Router();

	router.post(
		"/register",
		asyncHandler(async (req: Request, res: Response) => {
			const data = LocalUserRegisterSchema.parse(req.body);

			const passwordHash = await hashPassword(data.password);

			const user = await db.users.createLocalUser(data.email, data.name, passwordHash);
			await db.organization.createPersonalOrganization(user);

			// if this is the first user (except system), give them access to the system organization
			const nonSystemUserCount = await db.users.countNonSystemUsers();
			if (nonSystemUserCount === 1) {
				const systemOrgId = await db.system.getSystemOrganizationId();
				const systemProjectId = await db.system.getSystemProjectId();
				if (systemOrgId && systemProjectId) {
					await db.organization.addMemberToOrganization(
						systemOrgId,
						user.id,
						OrganizationRole.ADMIN,
					);

					await db.project.addMember(systemProjectId, user.id, ProjectRole.OWNER);
				}
			}

			await createSession(res, user.id);

			res.status(200).json({ userId: user.id });
		}),
	);

	router.post(
		"/login",
		asyncHandler(async (req: Request, res: Response) => {
			const data = LocalUserLoginSchema.parse(req.body);

			const user = await db.users.getLocalUserByEmail(data.email);

			if (!user) {
				return res.status(401).json({ error: "Invalid email or password" });
			}

			const passwordHash = user.userCredentials[0].passwordHash as string;

			const isPasswordValid = await verifyPassword(data.password, passwordHash);

			if (!isPasswordValid) {
				return res.status(401).json({ error: "Invalid email or password" });
			}

			await createSession(res, user.id);

			res.status(200).json({ userId: user.id });
		}),
	);

	router.post(
		"/logout",
		asyncHandler(async (req: Request, res: Response) => {
			await destroySession(req, res);
			res.status(200).json({ message: "Logged out" });
		}),
	);

	return router;
}
