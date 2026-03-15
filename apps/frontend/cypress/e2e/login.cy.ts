describe("Login Flow", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("should display the login page", () => {
    cy.contains("Bienvenue !").should("be.visible");
    cy.contains("Continuer avec Google").should("be.visible");
    cy.contains("Continuer avec GitHub").should("be.visible");
  });

  it("should redirect to OAuth when clicking Google login", () => {
    const backendUrl = Cypress.env("BACKEND_URL") || "http://localhost:4000";
    cy.get("button").contains("Continuer avec Google").click();
    cy.url().should("include", backendUrl + "/auth/google");
  });

  it("should redirect to OAuth when clicking GitHub login", () => {
    const backendUrl = Cypress.env("BACKEND_URL") || "http://localhost:4000";
    cy.get("button").contains("Continuer avec GitHub").click();
    cy.url().should("include", backendUrl + "/auth/github");
  });

  it("should show error when oauth_failed", () => {
    cy.visit("/login?error=oauth_failed");
    cy.contains("La connexion OAuth a échoué").should("be.visible");
  });

  it("should navigate to home from back button", () => {
    cy.contains("← Accueil").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });

  it("should display legal links", () => {
    cy.contains("CGU").should("be.visible");
    cy.contains("Politique de confidentialité").should("be.visible");
  });
});

describe("Auth Callback", () => {
  it("should handle missing tokens gracefully", () => {
    cy.visit("/auth/callback?error=missing_tokens");
    cy.url().should("include", "/login");
  });
});
