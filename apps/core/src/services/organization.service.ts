import type { Database } from "@/database/db";
import { ProjectRole, OrganizationRole } from "@/prisma";
import { webhooks } from "./webhooks/webhooks";
import { env } from "@/env";

export class OrganizationService {
	constructor(private readonly db: Database) {}

	public async addOrganizationMember(orgId: number, userId: number, role: OrganizationRole) {
		// check if user is already a member
		const existingMember = await this.db.organization.getMemberByUserId(orgId, userId);
		if (existingMember) {
			throw new Error("User is already a member of the organization");
		}

		const member = await this.db.organization.addMemberToOrganization(orgId, userId, role);

		// if role is ADMIN - all projects are visible
		if (role === OrganizationRole.ADMIN) {
			await this.syncProjectMembershipByOrganizationRole(orgId, userId);
		}

		return member;
	}

	private async syncProjectMembershipByOrganizationRole(orgId: number, userId: number) {
		const projects = await this.db.project.getProjectsByOrgId(orgId);
		for (const project of projects) {
			await this.db.project.addMember(project.id, userId, ProjectRole.OWNER);
		}
	}

	public async createMemberInvitation(
		orgId: number,
		email: string,
		_role: OrganizationRole,
		orgName: string,
	) {
		// Check if user is already a member
		const existingMember = await this.db.organization.getMemberByEmail(orgId, email);
		if (existingMember) {
			throw new Error("User is already a member");
		}

		// feature: teamwork
		const USER_ROLE = OrganizationRole.ADMIN;
		const invitation = await this.db.organization.inviteMember(orgId, email, USER_ROLE);

		const inviteUrl = `${process.env.FRONTEND_URL}/invite/${invitation.token}`;

		// send email with token if instance is cloud
		if (env.INSTANCE_TYPE === "cloud") {
			await webhooks.sendEmail(email, inviteUrl, orgName);
		}

		return {
			invitation,
			inviteUrl,
		};
	}
}
