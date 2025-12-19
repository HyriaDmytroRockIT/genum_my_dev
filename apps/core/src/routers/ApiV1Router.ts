import { Router } from "express";
import { ApiV1Controller } from "../controllers/apiv1.controller";
import { asyncHandler } from "@/utils/asyncHandler";

export function createApiV1Router(): Router {
	const router = Router();
	const controller = new ApiV1Controller();

	// API V1
	// prompts
	router.get("/prompts", asyncHandler(controller.listPrompts.bind(controller)));
	router.post("/prompts", asyncHandler(controller.createPrompt.bind(controller)));
	router.get("/prompts/:id", asyncHandler(controller.getPrompt.bind(controller)));
	router.post("/prompts/run", asyncHandler(controller.runPrompt.bind(controller)));

	return router;
}
