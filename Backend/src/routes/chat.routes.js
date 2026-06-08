import { Router } from "express";
import { chatController, summarizeChatController, getChatHistory } from "../controllers/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { chatLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// Protected chat routes
router.use(verifyJwt);

router.get("/:prId/history", chatLimiter, getChatHistory);
router.post("/:prId", chatLimiter, chatController);
router.post("/:prId/summarize", chatLimiter, summarizeChatController);

export default router;
