describe("Billing Page", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "smartproject-auth",
        JSON.stringify({
          state: {
            accessToken: "test_token",
            refreshToken: "test_refresh_token",
            user: {
              id: "user-1", name: "Test User", email: "test@test.com", role: "USER",
              subscription: { plan: "FREE", status: "ACTIVE" },
            },
            isAuthenticated: true,
          },
        })
      );
    });

    cy.intercept("GET", "/billing/subscription", {
      body: { plan: "FREE", status: "ACTIVE" },
    }).as("getSubscription");

    cy.visit("/billing");
    cy.wait("@getSubscription");
  });

  it("should display all pricing plans", () => {
    cy.contains("Free").should("be.visible");
    cy.contains("Pro").should("be.visible");
    cy.contains("Enterprise").should("be.visible");
  });

  it("should show current plan badge", () => {
    cy.contains("Plan actuel").should("be.visible");
  });

  it("should show Pro features", () => {
    cy.contains("Projets illimités").should("be.visible");
    cy.contains("IA avancée (GPT-4o)").should("be.visible");
  });

  it("should redirect to Stripe checkout when upgrading", () => {
    cy.intercept("POST", "/billing/checkout", {
      body: { url: "https://checkout.stripe.com/pay/cs_test_abc123" },
    }).as("createCheckout");

    cy.contains("Passer à Pro").click();
    cy.wait("@createCheckout");
    // URL changes to Stripe (intercepted)
  });

  it("should show the Pro plan as highlighted/recommended", () => {
    cy.contains("Recommandé").should("be.visible");
  });
});
