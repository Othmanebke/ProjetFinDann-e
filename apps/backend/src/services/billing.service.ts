import { stripeClient, STRIPE_PLANS } from "../clients/stripe.client";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error.middleware";
import { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";
import { subscriptionsGauge } from "../clients/prometheus.client";
import Stripe from "stripe";

// ─── Get or Create Stripe Customer ───────────────────────────────────────────
async function getOrCreateCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { subscription: true },
  });

  if (!user) throw new AppError(404, "User not found");

  if (user.subscription?.stripeCustomerId) {
    return user.subscription.stripeCustomerId;
  }

  const customer = await stripeClient.customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId },
  });

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, stripeCustomerId: customer.id },
    update: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Create Checkout Session ──────────────────────────────────────────────────
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  const customerId = await getOrCreateCustomer(userId);

  const session = await stripeClient.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId },
    },
    allow_promotion_codes: true,
  });

  return session.url!;
}

// ─── Create Customer Portal Session ──────────────────────────────────────────
export async function createPortalSession(userId: string, returnUrl: string): Promise<string> {
  const customerId = await getOrCreateCustomer(userId);

  const session = await stripeClient.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

// ─── Get Subscription Status ──────────────────────────────────────────────────
export async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) {
    return { plan: SubscriptionPlan.FREE, status: SubscriptionStatus.ACTIVE };
  }

  return subscription;
}

// ─── Handle Stripe Webhook ────────────────────────────────────────────────────
export async function handleWebhook(
  payload: Buffer,
  signature: string
): Promise<void> {
  let event: Stripe.Event;

  try {
    event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    throw new AppError(400, "Invalid webhook signature");
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutComplete(session);
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdated(sub);
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeleted(sub);
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await handlePaymentFailed(invoice);
      break;
    }

    default:
      break;
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId;
  if (!userId || !session.subscription) return;

  const stripeSub = await stripeClient.subscriptions.retrieve(
    session.subscription as string
  );

  const plan = getPlanFromPriceId(stripeSub.items.data[0].price.id);

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items.data[0].price.id,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
    update: {
      plan,
      status: SubscriptionStatus.ACTIVE,
      stripeSubscriptionId: stripeSub.id,
      stripePriceId: stripeSub.items.data[0].price.id,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
    },
  });

  subscriptionsGauge.set({ plan }, 1);
}

async function handleSubscriptionUpdated(stripeSub: Stripe.Subscription): Promise<void> {
  const customerId = stripeSub.customer as string;
  const sub = await prisma.subscription.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!sub) return;

  const plan = getPlanFromPriceId(stripeSub.items.data[0].price.id);
  const status = mapStripeStatus(stripeSub.status);

  await prisma.subscription.update({
    where: { stripeCustomerId: customerId },
    data: {
      plan,
      status,
      currentPeriodStart: new Date(stripeSub.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(stripeSub: Stripe.Subscription): Promise<void> {
  const customerId = stripeSub.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.CANCELLED,
      stripeSubscriptionId: null,
    },
  });
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const customerId = invoice.customer as string;

  await prisma.subscription.updateMany({
    where: { stripeCustomerId: customerId },
    data: { status: SubscriptionStatus.PAST_DUE },
  });
}

function getPlanFromPriceId(priceId: string): SubscriptionPlan {
  if (priceId === STRIPE_PLANS.PRO_MONTHLY || priceId === STRIPE_PLANS.PRO_YEARLY) {
    return SubscriptionPlan.PRO;
  }
  if (priceId === STRIPE_PLANS.ENTERPRISE_MONTHLY || priceId === STRIPE_PLANS.ENTERPRISE_YEARLY) {
    return SubscriptionPlan.ENTERPRISE;
  }
  return SubscriptionPlan.FREE;
}

function mapStripeStatus(status: string): SubscriptionStatus {
  const map: Record<string, SubscriptionStatus> = {
    active: SubscriptionStatus.ACTIVE,
    past_due: SubscriptionStatus.PAST_DUE,
    canceled: SubscriptionStatus.CANCELLED,
    trialing: SubscriptionStatus.TRIALING,
    incomplete: SubscriptionStatus.INCOMPLETE,
  };
  return map[status] || SubscriptionStatus.ACTIVE;
}
