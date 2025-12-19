import type { Database } from "@/database/db";

export class UserService {
	constructor(private readonly db: Database) {}

	public async getUserContext(userId: number) {
		const userData = await this.db.users.getUserContextByID(userId);

		const organizations = userData.organizationMemberships.map((member) => ({
			id: member.organization.id,
			name: member.organization.name,
			description: member.organization.description,
			role: member.role,
			projects: member.organization.projects.map((project) => ({
				id: project.id,
				name: project.name,
				description: project.description,
				role: project.members.length > 0 ? project.members[0].role : null,
			})),
		}));

		const { organizationMemberships: _, ...userDataWithoutMembers } = userData;

		return {
			...userDataWithoutMembers,
			organizations,
		};
	}
}
