import { Router } from "express";
import {
  demoLogin,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  microsoftLogin,
  microsoftCallback,
  refresh,
  logout,
  me,
  updateProfile,
} from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authRateLimit } from "../middlewares/rate-limit.middleware";

const router = Router();

// Dev/Mock 
router.get("/demo", demoLogin);

// OAuth2 flows
router.get("/google", authRateLimit, googleLogin);
router.get("/google/callback", googleCallback);
router.get("/github", authRateLimit, githubLogin);
router.get("/github/callback", githubCallback);
router.get("/microsoft", authRateLimit, microsoftLogin);
router.get("/microsoft/callback", microsoftCallback);

// Token management
router.post("/refresh", authRateLimit, refresh);
router.post("/logout", logout);

// Profile
router.get("/me", authenticate, me);
router.put("/me", authenticate, updateProfile);

export default router;
