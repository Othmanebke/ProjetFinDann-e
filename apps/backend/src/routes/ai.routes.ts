import { Router } from "express";
import { generatePlan, summarize, risks, generateTasks, chat } from "../controllers/ai.controller";
import { authenticate, requirePlan } from "../middlewares/auth.middleware";
import { aiRateLimit } from "../middlewares/rate-limit.middleware";
import { SubscriptionPlan } from "@prisma/client";

const router = Router();

router.use(authenticate);
router.use(aiRateLimit);

// Free tier: basic chat
router.post("/chat", chat);

// Pro+ features: advanced AI
router.post("/generate-plan", requirePlan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE), generatePlan);
router.post("/summarize", requirePlan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE), summarize);
router.post("/risks", requirePlan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE), risks);
router.post("/generate-tasks", requirePlan(SubscriptionPlan.PRO, SubscriptionPlan.ENTERPRISE), generateTasks);

export default router;
