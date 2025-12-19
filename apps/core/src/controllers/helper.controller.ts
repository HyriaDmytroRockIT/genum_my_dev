import type { Request, Response } from "express";
import { transcribe } from "../ai/runner/run";
import multer from "multer";
import { ContentPrettifySchema, PromptTuneSchema } from "../services/validate";
import { formatToXml } from "@/ai/runner/formatter";
import { system_prompt } from "@/ai/runner/system";

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

export class HelpersController {
	// Middleware to handle file upload
	public uploadMiddleware = upload.single("audio");

	async promptTune(req: Request, res: Response) {
		const metadata = req.genumMeta.ids;
		const data = PromptTuneSchema.parse(req.body);

		const result = await system_prompt.promptEditor(
			formatToXml(data),
			metadata.orgID,
			metadata.projID,
		);

		res.status(200).json({
			prompt: result.answer,
			chainOfThoughts: result.chainOfThoughts,
		});
	}

	async contentPrettify(req: Request, res: Response) {
		const metadata = req.genumMeta.ids;
		const { content } = ContentPrettifySchema.parse(req.body);

		const preview = await system_prompt.contentPrettify(
			content,
			metadata.orgID,
			metadata.projID,
		);

		res.status(200).json({
			text: preview.answer,
		});
	}

	async speechToText(req: Request, res: Response) {
		const metadata = req.genumMeta.ids;
		const user = req.genumMeta.user;
		const file = (req as Request & { file?: Express.Multer.File }).file;
		if (!file) {
			throw new Error("No audio file received");
		}

		// Use the buffer from multer
		const audio = file.buffer;

		const text = await transcribe(
			audio,
			metadata.userID,
			metadata.orgID,
			metadata.projID,
			user.email,
		);

		res.status(200).json({
			text: text,
		});
	}
}
