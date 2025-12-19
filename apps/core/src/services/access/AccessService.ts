import type { AiVendor, OrganizationQuota } from "@/prisma";
import { db } from "@/database/db";
import { isCloudInstance } from "@/utils/env";

export async function checkPromptAccess(promptId: number, projectId: number) {
	const prompt = await db.prompts.getPromptById(promptId);
	if (!prompt) {
		// prompt not found
		throw new Error("Prompt is not found");
	} else if (prompt.projectId === projectId) {
		// prompt found and belongs to project
		return prompt;
	} else {
		throw new Error("Prompt is not found");
	}
}

export async function checkMemoryAccess(memoryId: number, promptId: number) {
	const memory = await db.memories.getMemoryByIDAndPromptId(memoryId, promptId);
	if (!memory) {
		throw new Error("Memory is not found");
	} else if (memory.promptId === promptId) {
		return memory;
	} else {
		throw new Error("Memory is not found");
	}
}

export async function checkTestcaseAccess(testcaseId: number, projectId: number) {
	const testcase = await db.testcases.getTestcaseByID(testcaseId);
	if (!testcase) {
		throw new Error("Testcase is not found");
	} else if (testcase.prompt.projectId === projectId) {
		return testcase;
	} else {
		throw new Error("Testcase is not found");
	}
}

export async function getApiKeyByQuota(quota: OrganizationQuota, orgId: number, vendor: AiVendor) {
	// if cloud instance and quota is 0 - return user API key.
	// if local instance always return system API key.
	if (isCloudInstance() && quota.balance <= 0) {
		const userApiKey = await db.organization.getOrganizationApiKey(orgId, vendor);
		if (!userApiKey) {
			throw new Error(`User API key not found for ${vendor}`);
		}
		return { apiKey: userApiKey, quotaUsed: false };
	} else {
		// if quota is greater than 0, return organization GENUM API KEY
		const systemId = await db.system.getSystemOrganizationId();
		if (!systemId) {
			throw new Error("System organization ID not found in database");
		}
		const systemApiKey = await db.organization.getOrganizationApiKey(systemId, vendor);
		if (!systemApiKey) {
			throw new Error(`System API key not found for ${vendor}`);
		}

		return { apiKey: systemApiKey, quotaUsed: true };
	}
}
