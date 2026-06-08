import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { chatLimiter } from "../middlewares/rateLimit.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { retrieveRelevantChunks, cleanupPRVectors } from "../services/rag.service.js";

const router = Router();

router.use(verifyJwt);

router.post("/retrieve", chatLimiter, asyncHandler(async (req, res) => {
  const { prId, query } = req.body;
  if (!prId || !query) return res.status(400).json({ error: "prId and query required" });
  
  const results = await retrieveRelevantChunks(prId, query);
  res.status(200).json({ results });
}));

router.post("/delete", chatLimiter, asyncHandler(async (req, res) => {
  const { prId } = req.body;
  if (!prId) return res.status(400).json({ error: "prId required" });
  
  await cleanupPRVectors(prId);
  res.status(200).json({ success: true });
}));

export default router;
