import { Router } from "express";
import { analyzePR, getPR, getAllPRs, deletePR } from "../controllers/pr.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { analyzeLimiter } from "../middlewares/rateLimit.middleware.js";

const router = Router();

// Protected PR routes
router.use(verifyJwt);

router.route("/analyze").post(analyzeLimiter, analyzePR);
router.route("/").get(getAllPRs);

router.route("/:id").get(getPR).delete(deletePR);

export default router;
