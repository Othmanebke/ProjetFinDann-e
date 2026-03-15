import { Router } from "express";
import {
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  refresh,
  logout,
  me,
  updateProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimit } from "../middlewares/rate-limit.middleware";

const router = Router();

// OAuth2 flows
router.get("/google", authRateLimit, googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", authRateLimit, githubLogin);
router.get("/github/callback", githubCallback);

// Token management
router.post("/refresh", authRateLimit, refresh);
router.post("/logout", logout);

// Profile
router.get("/me", authenticate, me);
router.put("/me", authenticate, updateProfile);

export default router;
