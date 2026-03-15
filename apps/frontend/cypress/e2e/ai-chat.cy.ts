describe("AI Chat Interface", () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem(
        "smartproject-auth",
        JSON.stringify({
          state: {
            accessToken: "test_token",
            refreshToken: "test_refresh_token",
            user: { id: "user-1", name: "Test User", email: "test@test.com", role: "USER" },
            isAuthenticated: true,
          },
        })
      );
    });

    cy.visit("/ai");
  });

  it("should display the AI chat interface", () => {
    cy.contains("SmartProject AI Assistant").should("be.visible");
    cy.get("textarea[placeholder*='Posez votre question']").should("be.visible");
  });

  it("should show suggestion prompts initially", () => {
    cy.contains("Génère un plan pour mon projet").should("be.visible");
    cy.contains("meilleures pratiques agiles").should("be.visible");
  });

  it("should populate input when clicking a suggestion", () => {
    cy.contains("Comment prioriser mes tâches cette semaine ?").click();
    cy.get("textarea").should("have.value", "Comment prioriser mes tâches cette semaine ?");
  });

  it("should send a message and show streaming response", () => {
    cy.intercept("POST", "/ai/chat", (req) => {
      req.reply({
        statusCode: 200,
        headers: { "Content-Type": "text/event-stream" },
        body: [
          "data: {\"type\":\"chat_id\",\"chatId\":\"chat-1\"}\n\n",
          "data: {\"type\":\"delta\",\"content\":\"Voici\"}\n\n",
          "data: {\"type\":\"delta\",\"content\":\" ma réponse.\"}\n\n",
          "data: {\"type\":\"done\"}\n\n",
        ].join(""),
      });
    }).as("aiChat");

    cy.get("textarea").type("Test question");
    cy.get("button[type='button']").last().click();

    cy.wait("@aiChat");
    cy.contains("Test question").should("be.visible");
    cy.contains("Voici ma réponse.").should("be.visible");
  });

  it("should disable send button when input is empty", () => {
    cy.get("button").last().should("be.disabled");
  });

  it("should submit on Enter key", () => {
    cy.intercept("POST", "/ai/chat", { body: "" }).as("aiChat");
    cy.get("textarea").type("Question{enter}");
    cy.wait("@aiChat");
  });

  it("should not submit on Shift+Enter (newline)", () => {
    cy.get("textarea").type("Line 1{shift}{enter}Line 2");
    cy.get("textarea").should("contain.value", "Line 1\nLine 2");
  });
});
