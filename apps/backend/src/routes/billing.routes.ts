import { Router } from "express";
import express from "express";
import { createCheckout, createPortal, getSubscription, webhook } from "../controllers/billing.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// Stripe webhook requires raw body
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

router.use(authenticate);

router.post("/checkout", createCheckout);
router.get("/portal", createPortal);
router.get("/subscription", getSubscription);

export default router;
