// Assumes auth is set up via cy.login() custom command

describe("Projects CRUD", () => {
  beforeEach(() => {
    // Set auth tokens in localStorage to simulate logged-in state
    cy.window().then((win) => {
      win.localStorage.setItem(
        "smartproject-auth",
        JSON.stringify({
          state: {
            accessToken: Cypress.env("TEST_ACCESS_TOKEN") || "test_token",
            refreshToken: "test_refresh_token",
            user: { id: "user-1", name: "Test User", email: "test@test.com", role: "USER" },
            isAuthenticated: true,
          },
        })
      );
    });

    // Intercept API calls
    cy.intercept("GET", "/projects*", {
      statusCode: 200,
      body: {
        data: [
          {
            id: "proj-1",
            name: "Mon Projet Test",
            description: "Description du projet",
            status: "ACTIVE",
            color: "#6366f1",
            owner: { id: "user-1", name: "Test User", avatarUrl: null },
            members: [{ user: { id: "user-1", name: "Test User", avatarUrl: null } }],
            _count: { tasks: 5 },
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    }).as("getProjects");

    cy.intercept("POST", "/projects", {
      statusCode: 201,
      body: {
        id: "proj-new",
        name: "Nouveau Projet",
        status: "PLANNING",
        color: "#6366f1",
        ownerId: "user-1",
        owner: { id: "user-1", name: "Test User", avatarUrl: null },
        _count: { tasks: 0 },
      },
    }).as("createProject");

    cy.visit("/projects");
    cy.wait("@getProjects");
  });

  it("should display projects list", () => {
    cy.contains("Mon Projet Test").should("be.visible");
    cy.contains("ACTIVE").should("be.visible");
  });

  it("should open create project modal", () => {
    cy.contains("Nouveau projet").click();
    cy.contains("Nouveau projet").should("be.visible");
    cy.get("input[placeholder*='lancement']").should("be.visible");
  });

  it("should create a new project", () => {
    cy.contains("Nouveau projet").click();
    cy.get("input[placeholder*='lancement']").type("Nouveau Projet");
    cy.get("textarea[placeholder*='Décrivez']").type("Description du test");
    cy.contains("button", "Créer le projet").click();
    cy.wait("@createProject");
  });

  it("should navigate to project detail", () => {
    cy.intercept("GET", "/projects/proj-1", {
      statusCode: 200,
      body: {
        id: "proj-1",
        name: "Mon Projet Test",
        description: "Test",
        status: "ACTIVE",
        color: "#6366f1",
        owner: { id: "user-1", name: "Test User", avatarUrl: null, email: "test@test.com" },
        members: [],
        tasks: [],
        _count: { tasks: 0, members: 1 },
      },
    }).as("getProject");

    cy.contains("Mon Projet Test").click();
    cy.url().should("include", "/projects/proj-1");
    cy.wait("@getProject");
    cy.contains("Mon Projet Test").should("be.visible");
  });
});
