export type Organization = {
	id: number;
	name: string;
	description: string;
	personal: boolean;
};

export type OrganizationWithProjects = Organization & {
	projects: {
		description: string;
		id: number;
		initial: boolean;
		name: string;
		organizationId: number;
	}[];
};
