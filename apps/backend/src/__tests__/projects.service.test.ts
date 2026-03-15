import { createProject, getProject, listProjects } from "../services/projects.service";
import { AppError } from "../middlewares/error.middleware";

// Mock Prisma
const mockPrisma = {
  project: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  activityLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  task: {
    groupBy: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock("../lib/prisma", () => ({ prisma: mockPrisma }));
jest.mock("../clients/prometheus.client", () => ({
  projectsTotal: { inc: jest.fn() },
}));

describe("ProjectsService", () => {
  const userId = "user-123";
  const projectId = "proj-456";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createProject", () => {
    it("should create a project and activity log in a transaction", async () => {
      const projectData = { name: "Test Project", description: "Test desc" };
      const createdProject = {
        id: projectId,
        name: "Test Project",
        ownerId: userId,
        owner: { id: userId, name: "Test User", avatarUrl: null },
        _count: { tasks: 0 },
      };

      mockPrisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          project: { create: jest.fn().mockResolvedValue(createdProject) },
          activityLog: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      const result = await createProject(userId, projectData);

      expect(result).toEqual(createdProject);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe("getProject", () => {
    it("should return a project when user has access", async () => {
      const project = {
        id: projectId,
        name: "My Project",
        ownerId: userId,
        tasks: [],
        members: [],
        _count: { tasks: 0, members: 1 },
      };

      mockPrisma.project.findFirst.mockResolvedValue(project);

      const result = await getProject(projectId, userId);
      expect(result).toEqual(project);
    });

    it("should throw AppError 404 when project not found", async () => {
      mockPrisma.project.findFirst.mockResolvedValue(null);

      await expect(getProject(projectId, userId)).rejects.toThrow(AppError);
      await expect(getProject(projectId, userId)).rejects.toThrow("Project not found");
    });
  });

  describe("listProjects", () => {
    it("should return paginated projects", async () => {
      const projects = [{ id: projectId, name: "Project 1" }];
      mockPrisma.$transaction.mockResolvedValue([projects, 1]);

      const result = await listProjects(userId, { page: 1, limit: 20 });

      expect(result.data).toEqual(projects);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });
  });
});
