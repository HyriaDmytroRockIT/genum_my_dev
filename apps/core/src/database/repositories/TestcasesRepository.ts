import type { PrismaClient, TestCase } from "@/prisma";
import type { TestcasesCreateType, TestcasesUpdateType } from "@/services/validate";

export class TestcasesRepository {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	public async getProjectTestcases(projectId: number) {
		return await this.prisma.testCase.findMany({
			where: {
				prompt: {
					projectId,
				},
			},
			include: {
				memory: {
					select: {
						id: true,
						key: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	public async getTestcaseByID(id: number) {
		return await this.prisma.testCase.findUnique({
			where: { id },
			include: {
				prompt: true,
				memory: true,
			},
		});
	}

	public async getTestcaseByIDWithPrompt(id: number) {
		return await this.prisma.testCase.findUnique({
			where: { id },
			include: { prompt: { include: { languageModel: true } } },
		});
	}

	public async newTestcase(data: TestcasesCreateType) {
		return await this.prisma.testCase.create({
			data,
		});
	}

	public async deleteTestcaseByID(id: number): Promise<TestCase> {
		return await this.prisma.testCase.delete({
			where: { id },
		});
	}

	public async updateTestcaseByID(id: number, data: TestcasesUpdateType) {
		return await this.prisma.testCase.update({ where: { id }, data });
	}

	public async getTestcasesByPromptId(promptId: number) {
		return await this.prisma.testCase.findMany({
			where: { promptId },
			include: {
				memory: {
					select: {
						id: true,
						key: true,
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
	}

	public async countTestcasesByDate(startDate: Date, endDate: Date) {
		return await this.prisma.testCase.count({
			where: {
				createdAt: {
					gte: startDate,
					lte: endDate,
				},
			},
		});
	}
}
