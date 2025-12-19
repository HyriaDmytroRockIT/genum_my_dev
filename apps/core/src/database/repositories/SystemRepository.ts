import type { PrismaClient } from "@/prisma";

export enum SYSTEM_CONFIG_KEY {
	SYSTEM_ORG_ID = "system.organization.id",
	SYSTEM_PRJ_ID = "system.project.id",
}

export class SystemRepository {
	private prisma: PrismaClient;
	private systemOrganizationId: number | null;
	private systemProjectId: number | null;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
		this.systemOrganizationId = null;
		this.systemProjectId = null;
	}

	public async getSystemOrganizationId(): Promise<number | null> {
		if (this.systemOrganizationId) {
			return this.systemOrganizationId;
		}

		const systemOrganization = await this.prisma.systemConfig.findUnique({
			where: {
				key: SYSTEM_CONFIG_KEY.SYSTEM_ORG_ID,
			},
		});

		this.systemOrganizationId = systemOrganization ? Number(systemOrganization.value) : null;

		return systemOrganization ? Number(systemOrganization.value) : null;
	}

	public async getSystemProjectId(): Promise<number | null> {
		if (this.systemProjectId) {
			return this.systemProjectId;
		}

		const systemProject = await this.prisma.systemConfig.findUnique({
			where: {
				key: SYSTEM_CONFIG_KEY.SYSTEM_PRJ_ID,
			},
		});

		this.systemProjectId = systemProject ? Number(systemProject.value) : null;

		return systemProject ? Number(systemProject.value) : null;
	}

	public async createSystemOrganization() {
		// create system organization
		const systemOrganization = await this.prisma.organization.create({
			data: {
				name: "SYSTEM",
				description: "System organization for internal prompts",
				personal: false,
				quota: {
					create: {
						balance: 0,
					},
				},
				projects: {
					create: {
						name: "PROMPTS",
						description: "System project for internal prompts",
						initial: true,
					},
				},
			},
			include: {
				projects: true,
			},
		});

		// add system organization ID config
		await this.prisma.systemConfig.create({
			data: {
				key: SYSTEM_CONFIG_KEY.SYSTEM_ORG_ID,
				value: systemOrganization.id.toString(),
			},
		});

		// add system project ID config
		await this.prisma.systemConfig.create({
			data: {
				key: SYSTEM_CONFIG_KEY.SYSTEM_PRJ_ID,
				value: systemOrganization.projects[0].id.toString(),
			},
		});

		return systemOrganization;
	}

	public async getSystemUser() {
		return await this.prisma.user.findUnique({
			where: { email: "SYSTEM_USER" },
		});
	}

	public async createSystemUser() {
		return await this.prisma.user.create({
			data: {
				email: "SYSTEM_USER",
				name: "system",
				authID: "",
			},
		});
	}
}
