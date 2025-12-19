import { apiClient, ApiRequestConfig } from "../client";

// ============================================================================
// Types
// ============================================================================

export interface Organization {
	id: number;
	name: string;
	description: string;
	personal: boolean;
	createdAt?: string;
	author?: {
		name: string;
		email: string;
	};
}

export interface UpdateOrganizationData {
	name: string;
	description: string;
}

export interface Member {
	id: number;
	organizationId?: number;
	userId?: number;
	projectId?: number;
	role: string;
	user: {
		id: number;
		email: string;
		name: string;
		picture?: string;
	};
}

export interface MembersResponse {
	members: {
		members: Member[];
	};
}

export interface InviteMemberData {
	email: string;
}

export interface Invite {
	id: number;
	email: string;
	role: string;
	token: string;
	createdAt: string;
}

export interface Project {
	id: number;
	name: string;
	description: string;
	initial: boolean;
	organizationId: number;
	_count: {
		members: number;
		Prompts: number;
	};
}

export interface CreateProjectData {
	name: string;
	description?: string;
}

export interface AIKey {
	id: number;
	vendor: string;
	createdAt: string;
	publicKey: string;
}

export interface CreateAIKeyData {
	key: string;
	vendor: string;
}

export interface OrgKey {
	id: number;
	name: string;
	publicKey: string;
	createdAt: string;
	lastUsed?: string;
	project: {
		id: number;
		name: string;
	};
	author: {
		id: number;
		name: string;
		email: string;
		picture?: string;
	};
}

export interface Quota {
	balance: number;
}

// ============================================================================
// Organization API
// ============================================================================

export const organizationApi = {
	/**
	 * Get organization details
	 */
	getOrganization: async (config?: ApiRequestConfig): Promise<{ organization: Organization }> => {
		const response = await apiClient.get<{ organization: Organization }>(
			"/organization",
			config,
		);
		return response.data;
	},

	/**
	 * Update organization
	 */
	updateOrganization: async (
		data: UpdateOrganizationData,
		config?: ApiRequestConfig,
	): Promise<Organization> => {
		const response = await apiClient.put<Organization>("/organization", data, config);
		return response.data;
	},

	// ============================================================================
	// Members API
	// ============================================================================

	/**
	 * Get organization members
	 */
	getMembers: async (config?: ApiRequestConfig): Promise<MembersResponse> => {
		const response = await apiClient.get<MembersResponse>("/organization/members", config);
		return response.data;
	},

	/**
	 * Invite a member to the organization
	 */
	inviteMember: async (data: InviteMemberData, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.post("/organization/members/invite", data, config);
	},

	/**
	 * Get members not in project
	 */
	getMembersNotInProject: async (config?: ApiRequestConfig): Promise<{ members: Member[] }> => {
		const response = await apiClient.get<{ members: Member[] }>(
			"/organization/members/not-in-project",
			config,
		);
		return response.data;
	},

	// ============================================================================
	// Invites API
	// ============================================================================

	/**
	 * Get organization invites
	 */
	getInvites: async (config?: ApiRequestConfig): Promise<{ invites: Invite[] }> => {
		const response = await apiClient.get<{ invites: Invite[] }>(
			"/organization/invites",
			config,
		);
		return response.data;
	},

	/**
	 * Delete an invite
	 */
	deleteInvite: async (token: string, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.delete(`/organization/invites/${token}`, config);
	},

	// ============================================================================
	// Projects API
	// ============================================================================

	/**
	 * Get organization projects
	 */
	getProjects: async (config?: ApiRequestConfig): Promise<{ projects: Project[] }> => {
		const response = await apiClient.get<{ projects: Project[] }>(
			"/organization/projects",
			config,
		);
		return response.data;
	},

	/**
	 * Create a new project
	 */
	createProject: async (
		data: CreateProjectData,
		config?: ApiRequestConfig,
	): Promise<{ project: { id: number } }> => {
		const response = await apiClient.post<{ project: { id: number } }>(
			"/organization/projects",
			data,
			config,
		);
		return response.data;
	},

	/**
	 * Delete a project
	 */
	deleteProject: async (projectId: number | string, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.delete(`/organization/projects/${projectId}`, config);
	},

	// ============================================================================
	// API Keys (AI Keys) API
	// ============================================================================

	/**
	 * Get organization AI keys
	 */
	getAIKeys: async (config?: ApiRequestConfig): Promise<{ keys: AIKey[] }> => {
		const response = await apiClient.get<{ keys: AIKey[] }>("/organization/api-keys", config);
		return response.data;
	},

	/**
	 * Create a new AI key
	 */
	createAIKey: async (data: CreateAIKeyData, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.post("/organization/api-keys", data, config);
	},

	/**
	 * Delete an AI key
	 */
	deleteAIKey: async (keyId: number | string, config?: ApiRequestConfig): Promise<void> => {
		await apiClient.delete(`/organization/api-keys/${keyId}`, config);
	},

	// ============================================================================
	// Quota API
	// ============================================================================

	/**
	 * Get organization quota
	 */
	getQuota: async (config?: ApiRequestConfig): Promise<{ quota: Quota }> => {
		const response = await apiClient.get<{ quota: Quota }>("/organization/quota", config);
		return response.data;
	},

	// ============================================================================
	// Project Keys API
	// ============================================================================

	/**
	 * Get organization project keys
	 */
	getProjectKeys: async (config?: ApiRequestConfig): Promise<{ keys: OrgKey[] }> => {
		const response = await apiClient.get<{ keys: OrgKey[] }>(
			"/organization/project-keys",
			config,
		);
		return response.data;
	},
};
