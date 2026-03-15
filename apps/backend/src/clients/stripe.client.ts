import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is required");
}

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-02-15.acacia",
  typescript: true,
});

export const STRIPE_PLANS = {
  PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY!,
  PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY!,
  ENTERPRISE_MONTHLY: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
  ENTERPRISE_YEARLY: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
};

export default stripeClient;
