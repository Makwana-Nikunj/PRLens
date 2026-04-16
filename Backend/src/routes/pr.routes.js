import { Router } from "express";
import { analyzePRController, getPRController } from "../controllers/pr.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected PR routes
router.use(verifyJwt);
router.route("/analyze").post(analyzePRController);
router.route("/:id").get(getPRController);

export default router;
