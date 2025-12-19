export type UserType = {
	name: string;
	email: string;
	organizations: {
		id: number;
		name: string;
		description: string;
		role: string;
		projects: {
			id: number;
			name: string;
			description: string;
			role: string;
		}[];
	}[];
};
