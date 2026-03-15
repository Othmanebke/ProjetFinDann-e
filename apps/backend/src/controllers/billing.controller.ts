import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as billingService from "../services/billing.service";
import { AppError } from "../middlewares/error.middleware";

export async function createCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { priceId } = z.object({ priceId: z.string().min(1) }).parse(req.body);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    const url = await billingService.createCheckoutSession(
      req.user!.sub,
      priceId,
      `${frontendUrl}/billing?success=true`,
      `${frontendUrl}/billing?canceled=true`
    );

    res.json({ url });
  } catch (err) { next(err); }
}

export async function createPortal(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const url = await billingService.createPortalSession(req.user!.sub, `${frontendUrl}/billing`);
    res.json({ url });
  } catch (err) { next(err); }
}

export async function getSubscription(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const subscription = await billingService.getSubscription(req.user!.sub);
    res.json(subscription);
  } catch (err) { next(err); }
}

export async function webhook(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const signature = req.headers["stripe-signature"] as string;
    if (!signature) throw new AppError(400, "Missing stripe-signature header");

    await billingService.handleWebhook(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err) { next(err); }
}
