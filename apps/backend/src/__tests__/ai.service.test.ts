import { generateProjectPlan, summarizeActivity, identifyRisks, generateTasks } from "../services/ai.service";
import { AppError } from "../middlewares/error.middleware";

// Mock OpenAI client
const mockCreate = jest.fn();
jest.mock("../clients/openai.client", () => ({
  openaiClient: { chat: { completions: { create: mockCreate } } },
  AI_MODEL: "gpt-4o",
}));

// Mock Prisma
const mockProject = {
  id: "proj-1",
  name: "Test Project",
  description: "A test project",
  status: "ACTIVE",
  endDate: new Date("2026-12-31"),
  tasks: [
    { title: "Task 1", status: "DONE", priority: "HIGH", dueDate: null },
    { title: "Task 2", status: "TODO", priority: "MEDIUM", dueDate: new Date("2025-01-01") },
  ],
  members: [{ user: { name: "Alice" } }, { user: { name: "Bob" } }],
};

jest.mock("../lib/prisma", () => ({
  prisma: {
    project: {
      findFirst: jest.fn().mockResolvedValue(mockProject),
    },
    activityLog: {
      findMany: jest.fn().mockResolvedValue([
        { action: "task.created", user: { name: "Alice" }, createdAt: new Date(), metadata: {} },
      ]),
    },
  },
}));

jest.mock("../clients/prometheus.client", () => ({
  aiRequestsTotal: { inc: jest.fn() },
  aiRequestDuration: { startTimer: jest.fn().mockReturnValue(jest.fn()) },
}));

const mockAIResponse = (content: object) => {
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content: JSON.stringify(content) } }],
  });
};

describe("AIService", () => {
  const userId = "user-123";
  const projectId = "proj-1";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateProjectPlan", () => {
    it("should generate a project plan from OpenAI", async () => {
      const expectedPlan = {
        phases: ["Phase 1", "Phase 2"],
        milestones: ["Launch"],
        risks: ["Resource constraints"],
        recommendations: ["Use agile"],
        estimatedDuration: "3 months",
      };

      mockAIResponse(expectedPlan);

      const result = await generateProjectPlan(projectId, userId);
      expect(result).toEqual(expectedPlan);
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4o",
          response_format: { type: "json_object" },
        })
      );
    });

    it("should throw AppError 404 when project not found", async () => {
      const { prisma } = require("../lib/prisma");
      prisma.project.findFirst.mockResolvedValueOnce(null);

      await expect(generateProjectPlan(projectId, userId)).rejects.toThrow(AppError);
    });
  });

  describe("identifyRisks", () => {
    it("should identify risks for a project", async () => {
      const riskData = {
        riskLevel: "MEDIUM",
        risks: [{ title: "Late tasks", severity: "HIGH", probability: "MEDIUM", mitigation: "Add resources" }],
        overallAssessment: "Project is on track with minor concerns",
      };

      mockAIResponse(riskData);

      const result = await identifyRisks(projectId, userId);
      expect(result).toEqual(riskData);
    });
  });

  describe("generateTasks", () => {
    it("should generate tasks for a project", async () => {
      const tasksData = {
        tasks: [
          { title: "Setup CI/CD", description: "Configure pipeline", priority: "HIGH", estimatedHours: 8, tags: ["devops"] },
          { title: "Write tests", description: "Unit and E2E tests", priority: "MEDIUM", estimatedHours: 16, tags: ["testing"] },
        ],
      };

      mockAIResponse(tasksData);

      const result = await generateTasks(projectId, userId, "Backend API development");
      expect(result).toEqual(tasksData);
    });
  });

  describe("summarizeActivity", () => {
    it("should summarize recent activity", async () => {
      const summaryData = {
        summary: "Good progress this week",
        highlights: ["3 tasks completed"],
        concerns: [],
        count: 1,
      };

      mockAIResponse(summaryData);

      const result = await summarizeActivity(projectId, userId, 7);
      expect(result).toEqual(summaryData);
    });
  });
});
