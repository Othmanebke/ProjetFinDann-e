// Custom Cypress commands
Cypress.Commands.add("setAuth", (user = {}) => {
  cy.window().then((win) => {
    win.localStorage.setItem(
      "smartproject-auth",
      JSON.stringify({
        state: {
          accessToken: "test_access_token",
          refreshToken: "test_refresh_token",
          isAuthenticated: true,
          user: {
            id: "user-test-1",
            name: "Test User",
            email: "test@smartproject.ai",
            role: "USER",
            subscription: { plan: "PRO", status: "ACTIVE" },
            ...user,
          },
        },
      })
    );
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      setAuth(user?: object): Chainable<void>;
    }
  }
}

export {};
