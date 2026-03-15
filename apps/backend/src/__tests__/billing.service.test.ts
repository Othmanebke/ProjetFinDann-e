import { createCheckoutSession, createPortalSession, getSubscription } from "../services/billing.service";

// Mock Stripe
const mockStripe = {
  customers: { create: jest.fn() },
  checkout: { sessions: { create: jest.fn() } },
  billingPortal: { sessions: { create: jest.fn() } },
  subscriptions: { retrieve: jest.fn() },
  webhooks: { constructEvent: jest.fn() },
};

jest.mock("../clients/stripe.client", () => ({
  stripeClient: mockStripe,
  STRIPE_PLANS: {
    PRO_MONTHLY: "price_pro_monthly",
    PRO_YEARLY: "price_pro_yearly",
    ENTERPRISE_MONTHLY: "price_enterprise_monthly",
    ENTERPRISE_YEARLY: "price_enterprise_yearly",
  },
}));

jest.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: "user-1",
        email: "test@test.com",
        name: "Test User",
        subscription: { stripeCustomerId: null },
      }),
    },
    subscription: {
      findUnique: jest.fn().mockResolvedValue({ plan: "FREE", status: "ACTIVE" }),
      upsert: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("../clients/prometheus.client", () => ({
  subscriptionsGauge: { set: jest.fn() },
}));

describe("BillingService", () => {
  const userId = "user-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCheckoutSession", () => {
    it("should create a Stripe checkout session and return URL", async () => {
      mockStripe.customers.create.mockResolvedValue({ id: "cus_test123" });
      mockStripe.checkout.sessions.create.mockResolvedValue({ url: "https://checkout.stripe.com/pay/test" });

      const url = await createCheckoutSession(
        userId,
        "price_pro_monthly",
        "http://localhost:3000/billing?success=true",
        "http://localhost:3000/billing?canceled=true"
      );

      expect(url).toBe("https://checkout.stripe.com/pay/test");
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: "test@test.com",
        name: "Test User",
        metadata: { userId },
      });
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: "subscription",
          line_items: [{ price: "price_pro_monthly", quantity: 1 }],
        })
      );
    });
  });

  describe("getSubscription", () => {
    it("should return the user subscription", async () => {
      const result = await getSubscription(userId);
      expect(result).toEqual({ plan: "FREE", status: "ACTIVE" });
    });

    it("should return FREE plan when no subscription found", async () => {
      const { prisma } = require("../lib/prisma");
      prisma.subscription.findUnique.mockResolvedValueOnce(null);

      const result = await getSubscription(userId);
      expect(result).toEqual({ plan: "FREE", status: "ACTIVE" });
    });
  });

  describe("createPortalSession", () => {
    it("should create a Stripe customer portal session", async () => {
      const { prisma } = require("../lib/prisma");
      prisma.user.findUnique.mockResolvedValueOnce({
        id: userId,
        email: "test@test.com",
        name: "Test",
        subscription: { stripeCustomerId: "cus_existing" },
      });
      mockStripe.billingPortal.sessions.create.mockResolvedValue({ url: "https://billing.stripe.com/session/test" });

      const url = await createPortalSession(userId, "http://localhost:3000/billing");
      expect(url).toBe("https://billing.stripe.com/session/test");
    });
  });
});
