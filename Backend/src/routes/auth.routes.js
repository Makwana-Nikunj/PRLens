import { Router } from "express";
import {
    logoutUser,
    refreshAccessToken,
    oauthLogin
} from "../controllers/auth.controllers.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router = Router();

// Public routes

router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJwt, logoutUser);

// OAuth login
router.route("/oauth").post(oauthLogin);

export default router;