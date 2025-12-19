import type { PrismaClient, Memory } from "@/prisma";
import type { MemoryCreateType, MemoryUpdateType } from "@/services/validate";

export class MemoriesRepository {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	public async getMemoriesFromProject(projectId: number) {
		return await this.prisma.memory.findMany({
			where: {
				prompt: {
					projectId: projectId,
				},
			},
		});
	}

	public async getMemoryByKeyAndPromptId(key: string, promptId: number) {
		return await this.prisma.memory.findFirst({
			where: { key, promptId },
		});
	}

	public async getMemoryByIDAndPromptId(id: number, promptId: number) {
		return await this.prisma.memory.findUnique({
			where: { id, promptId },
		});
	}

	// new memory for prompt
	public async newPromptMemory(promptId: number, data: MemoryCreateType) {
		return await this.prisma.memory.create({
			data: {
				key: data.key,
				value: data.value,
				promptId: promptId,
			},
		});
	}

	public async deleteMemoryByID(id: number): Promise<Memory> {
		return await this.prisma.memory.delete({
			where: { id },
		});
	}

	public async updateMemoryByID(id: number, data: MemoryUpdateType) {
		return await this.prisma.memory.update({
			where: { id },
			data,
		});
	}

	public async getMemoriesByPromptID(promptID: number) {
		return await this.prisma.memory.findMany({
			where: {
				promptId: promptID,
			},
		});
	}
}
