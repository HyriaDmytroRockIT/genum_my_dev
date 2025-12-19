import { Router } from "express";
import { HelpersController } from "../controllers/helper.controller";
import { asyncHandler } from "@/utils/asyncHandler";

export function createHelpersRouter(): Router {
	const router = Router();
	const controller = new HelpersController();

	// // Agent
	// router.post('/agent/message', async (req, res) => {
	// 	await controller.agent(req, res);
	// });

	// Helpers
	router.post("/prompt-tune", asyncHandler(controller.promptTune.bind(controller)));

	router.post(
		"/speech-to-text",
		controller.uploadMiddleware,
		asyncHandler(controller.speechToText.bind(controller)),
	);

	router.post("/content-prettify", asyncHandler(controller.contentPrettify.bind(controller)));

	return router;
}
