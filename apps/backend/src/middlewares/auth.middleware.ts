import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JWTPayload } from "../services/auth.service";
import { prisma } from "../lib/prisma";
import { SubscriptionPlan } from "@prisma/client";

// Extend Express Request with user context
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload & { subscriptionPlan?: SubscriptionPlan };
    }
  }
}

// ─── Authenticate (JWT Required) ──────────────────────────────────────────────
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Require Admin Role ───────────────────────────────────────────────────────
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (req.user.role !== "ADMIN") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

// ─── Require Subscription Plan ────────────────────────────────────────────────
export function requirePlan(...allowedPlans: SubscriptionPlan[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.sub },
    });

    const plan = subscription?.plan || SubscriptionPlan.FREE;
    req.user.subscriptionPlan = plan;

    if (!allowedPlans.includes(plan)) {
      res.status(403).json({
        error: "Upgrade required",
        message: `This feature requires one of: ${allowedPlans.join(", ")}`,
        currentPlan: plan,
        upgradeUrl: "/billing",
      });
      return;
    }

    next();
  };
}

// ─── Optional Auth ────────────────────────────────────────────────────────────
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.substring(7);
      req.user = verifyAccessToken(token);
    } catch {
      // ignore — optional auth
    }
  }
  next();
}
