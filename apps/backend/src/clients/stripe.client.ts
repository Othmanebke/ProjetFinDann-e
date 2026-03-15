import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-02-15.acacia",
  typescript: true,
});

export const STRIPE_PLANS = {
  PREMIUM_COACH_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  PREMIUM_COACH_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY!,
  PASS_VOYAGEUR_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
  PASS_VOYAGEUR_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
};

export default stripeClient;
