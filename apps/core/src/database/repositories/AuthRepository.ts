import type { PrismaClient } from "@/prisma";

export class AuthRepository {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	public async getUserById(id: number) {
		return await this.prisma.user.findUnique({
			where: { id },
		});
	}

	public async getUserOrganizationContext(userId: number, orgId: number) {
		return await this.prisma.organizationMember.findFirst({
			where: {
				userId,
				organizationId: orgId,
			},
			include: {
				organization: {
					include: {
						quota: true,
					},
				},
			},
		});
	}

	public async getUserProjectContext(userId: number, orgId: number, projId: number) {
		return await this.prisma.projectMember.findFirst({
			where: {
				userId,
				projectId: projId,
				project: {
					is: { organizationId: orgId },
				},
			},
			include: {
				project: true,
			},
		});
	}
}
