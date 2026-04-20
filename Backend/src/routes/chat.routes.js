import { Router } from "express";
import { chatController, getChatHistory } from "../controllers/chat.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected chat route
router.use(verifyJwt);
router.route("/").post(chatController);
router.route("/:pr_id").get(getChatHistory);

export default router;
