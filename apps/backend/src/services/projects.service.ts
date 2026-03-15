import { prisma } from "../lib/prisma";
import { ProjectStatus } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { projectsTotal } from "../clients/prometheus.client";

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  color?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

// ─── List Projects ────────────────────────────────────────────────────────────
export async function listProjects(
  userId: string,
  params: { page?: number; limit?: number; status?: ProjectStatus; search?: string }
) {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  const where: any = {
    OR: [
      { ownerId: userId },
      { members: { some: { userId } } },
    ],
  };

  if (params.status) where.status = params.status;
  if (params.search) {
    where.AND = [
      { name: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        members: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          take: 5,
        },
        _count: { select: { tasks: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// ─── Get Project ──────────────────────────────────────────────────────────────
export async function getProject(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, avatarUrl: true, email: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
        include: {
          assignee: { select: { id: true, name: true, avatarUrl: true } },
          creator: { select: { id: true, name: true } },
        },
      },
      _count: { select: { tasks: true, members: true } },
    },
  });

  if (!project) throw new AppError(404, "Project not found");
  return project;
}

// ─── Create Project ───────────────────────────────────────────────────────────
export async function createProject(userId: string, data: CreateProjectInput) {
  const project = await prisma.$transaction(async (tx) => {
    const project = await tx.project.create({
      data: {
        ...data,
        ownerId: userId,
        members: {
          create: { userId, role: "OWNER" },
        },
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { tasks: true } },
      },
    });

    await tx.activityLog.create({
      data: {
        action: "project.created",
        userId,
        projectId: project.id,
        metadata: { projectName: project.name },
      },
    });

    return project;
  });

  projectsTotal.inc();
  return project;
}

// ─── Update Project ───────────────────────────────────────────────────────────
export async function updateProject(
  projectId: string,
  userId: string,
  data: UpdateProjectInput
) {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { members: { some: { userId, role: { in: ["OWNER", "ADMIN"] } } } },
      ],
    },
  });

  if (!existing) throw new AppError(404, "Project not found or insufficient permissions");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: projectId },
      data,
      include: { owner: { select: { id: true, name: true } } },
    });

    await tx.activityLog.create({
      data: {
        action: "project.updated",
        userId,
        projectId,
        metadata: { changes: Object.keys(data) },
      },
    });

    return updated;
  });
}

// ─── Delete Project ───────────────────────────────────────────────────────────
export async function deleteProject(projectId: string, userId: string) {
  const existing = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
  });

  if (!existing) throw new AppError(404, "Project not found or you are not the owner");

  await prisma.project.delete({ where: { id: projectId } });
}

// ─── Get Project Stats ────────────────────────────────────────────────────────
export async function getProjectStats(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

  if (!project) throw new AppError(404, "Project not found");

  const [taskStats, recentActivity] = await prisma.$transaction([
    prisma.task.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { id: true },
    }),
    prisma.activityLog.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    }),
  ]);

  return { taskStats, recentActivity };
}
