import {
	type PrismaClient,
	type User,
	OrganizationRole,
	ProjectRole,
	type AiVendor,
} from "@/prisma";
import type { OrganizationUpdateType } from "@/services/validate";

export class OrganizationRepository {
	private prisma: PrismaClient;
	private PRIVATE_ORG_QUOTA = 5;
	private SHARED_ORG_QUOTA = 0;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	public async getOrganizationById(orgId: number) {
		return await this.prisma.organization.findUnique({
			where: {
				id: orgId,
			},
		});
	}

	public async updateOrganization(orgID: number, data: OrganizationUpdateType) {
		return await this.prisma.organization.update({
			where: { id: orgID },
			data,
		});
	}

	public async getQuotaByOrgId(orgId: number) {
		return await this.prisma.organizationQuota.findUniqueOrThrow({
			where: {
				organizationId: orgId,
			},
		});
	}

	public async getOrganizationMembers(orgId: number) {
		return await this.prisma.organization.findUnique({
			where: {
				id: orgId,
			},
			include: {
				members: {
					include: {
						user: {
							select: {
								id: true,
								email: true,
								name: true,
								picture: true,
							},
						},
					},
				},
			},
		});
	}

	public async getMembersNotInProject(orgId: number, projId: number) {
		return await this.prisma.organizationMember.findMany({
			where: {
				organizationId: orgId,
				user: {
					projectMemberships: {
						none: {
							projectId: projId,
						},
					},
				},
			},
			include: {
				user: {
					select: {
						id: true,
						email: true,
						name: true,
						picture: true,
					},
				},
			},
		});
	}

	public async getOrganizationProjects(orgId: number) {
		return await this.prisma.project.findMany({
			where: {
				organizationId: orgId,
			},
			include: {
				_count: {
					select: {
						members: true,
						Prompts: true,
					},
				},
			},
		});
	}

	public async createPersonalOrganization(user: User) {
		const newUserOrganization = await this.prisma.organization.create({
			data: {
				name: "Personal organization",
				description: `Personal organization for ${user.email}`,
				personal: true,
				members: {
					create: {
						userId: user.id,
						role: OrganizationRole.ADMIN,
					},
				},
				projects: {
					create: {
						name: "Personal Project",
						description: `Personal project for ${user.email}`,
						initial: true,
						members: {
							create: {
								userId: user.id,
								role: ProjectRole.OWNER,
							},
						},
					},
				},
				quota: {
					create: {
						balance: this.PRIVATE_ORG_QUOTA,
					},
				},
			},
			include: {
				projects: true,
			},
		});

		return newUserOrganization;
	}

	public async createSharedOrganization(name: string, description: string, userId: number) {
		const newSharedOrganization = await this.prisma.organization.create({
			data: {
				name,
				description,
				personal: false,
				members: {
					create: {
						userId: userId,
						role: OrganizationRole.ADMIN,
					},
				},
				projects: {
					create: {
						name: "Default Project",
						description: `Default project for ${name} organization`,
						initial: true,
						members: {
							create: {
								userId: userId,
								role: ProjectRole.OWNER,
							},
						},
					},
				},
				quota: {
					create: {
						balance: this.SHARED_ORG_QUOTA,
					},
				},
			},
			include: {
				projects: true,
			},
		});

		return newSharedOrganization;
	}

	public async getMemberByUserId(organizationId: number, userId: number) {
		return await this.prisma.organizationMember.findUnique({
			where: {
				userId_organizationId: {
					organizationId,
					userId,
				},
			},
		});
	}

	public async getMemberByEmail(orgId: number, email: string) {
		return await this.prisma.organizationMember.findFirst({
			where: {
				organizationId: orgId,
				user: {
					email,
				},
			},
		});
	}

	public async getMemberById(orgId: number, memberId: number) {
		return await this.prisma.organizationMember.findUnique({
			where: {
				id: memberId,
				organizationId: orgId,
			},
		});
	}

	public async updateMemberRole(memberId: number, role: OrganizationRole) {
		return await this.prisma.organizationMember.update({
			where: {
				id: memberId,
			},
			data: {
				role,
			},
		});
	}

	public async deleteMember(memberId: number) {
		return await this.prisma.organizationMember.delete({
			where: {
				id: memberId,
			},
		});
	}

	public async inviteMember(orgId: number, email: string, role: OrganizationRole) {
		// Check if invitation already exists
		const existingInvitation = await this.prisma.organizationInvitation.findUnique({
			where: {
				email_organizationId: {
					email,
					organizationId: orgId,
				},
			},
		});

		if (existingInvitation) {
			throw new Error("Invitation already exists for this email");
		}

		// Create new invitation
		return await this.prisma.organizationInvitation.create({
			data: {
				email,
				organizationId: orgId,
				role,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
			},
		});
	}

	public async addMemberToOrganization(orgId: number, userId: number, role: OrganizationRole) {
		return await this.prisma.organizationMember.create({
			data: {
				organizationId: orgId,
				userId,
				role,
			},
		});
	}

	public async getInvitationByToken(token: string) {
		return await this.prisma.organizationInvitation.findUnique({
			where: { token },
			include: {
				organization: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	public async getOrganizationInvites(orgId: number) {
		return await this.prisma.organizationInvitation.findMany({
			where: {
				organizationId: orgId,
				expiresAt: {
					gt: new Date(),
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	public async deleteInvitation(token: string) {
		return await this.prisma.organizationInvitation.delete({
			where: { token },
		});
	}

	public async getOrganizationApiKeys(orgId: number) {
		const keys = await this.prisma.organizationApiKey.findMany({
			where: {
				organizationId: orgId,
			},
			select: {
				id: true,
				vendor: true,
				createdAt: true,
				updatedAt: true,
				publicKey: true,
			},
		});

		return keys;
	}

	public async addOrganizationApiKey(orgId: number, vendor: AiVendor, key: string) {
		// show 3 first and 3 last characters of the key
		const publicKey = `${key.slice(0, 3)}...${key.slice(-4)}`;
		return await this.prisma.organizationApiKey.upsert({
			where: {
				organizationId_vendor: {
					organizationId: orgId,
					vendor,
				},
			},
			update: {
				key,
				updatedAt: new Date(),
				publicKey: publicKey,
			},
			create: {
				organizationId: orgId,
				vendor,
				key,
				publicKey: publicKey,
			},
		});
	}

	public async deleteOrganizationApiKey(orgId: number, id: number) {
		return await this.prisma.organizationApiKey.delete({
			where: {
				organizationId: orgId,
				id: id,
			},
		});
	}

	public async getOrganizationApiKey(orgId: number, vendor: AiVendor) {
		return await this.prisma.organizationApiKey.findUnique({
			where: {
				organizationId_vendor: {
					organizationId: orgId,
					vendor,
				},
			},
		});
	}

	public async getApiKeyByVendor(orgId: number, vendor: AiVendor) {
		return await this.prisma.organizationApiKey.findUnique({
			where: {
				organizationId_vendor: {
					organizationId: orgId,
					vendor,
				},
			},
		});
	}

	public async chargeQuota(orgId: number, amount: number) {
		const quota = await this.getQuotaByOrgId(orgId);

		let newAmount = quota.balance - amount;
		if (newAmount < 0) {
			newAmount = 0;
		}

		console.log(`Charging ${amount} to org ${orgId}. New balance: ${newAmount}`);

		return await this.prisma.organizationQuota.update({
			where: {
				organizationId: orgId,
			},
			data: {
				balance: newAmount,
			},
		});
	}

	public async deleteExpiredInvites() {
		const deleted = await this.prisma.organizationInvitation.deleteMany({
			where: {
				expiresAt: {
					lt: new Date(),
				},
			},
		});

		return deleted.count;
	}
}
