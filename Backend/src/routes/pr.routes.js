import { Router } from "express";
import { analyzePRController, getPRController, getAllPRs, deletePR } from "../controllers/pr.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Protected PR routes
router.use(verifyJwt);

router.route("/analyze").post(analyzePRController);
router.route("/").get(getAllPRs);

router.route("/:id").get(getPRController).delete(deletePR);

export default router;
