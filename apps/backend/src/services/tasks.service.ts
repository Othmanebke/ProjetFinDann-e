import { prisma } from "../lib/prisma";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";
import { tasksTotal } from "../clients/prometheus.client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  tags?: string[];
  projectId: string;
  assigneeId?: string;
  parentTaskId?: string;
}

export interface UpdateTaskInput extends Partial<Omit<CreateTaskInput, "projectId">> {
  loggedHours?: number;
}

// ─── List Tasks ───────────────────────────────────────────────────────────────
export async function listTasks(
  userId: string,
  params: {
    projectId?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }
) {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 50, 200);
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.projectId) {
    // Verify user has access to project
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    });
    if (!project) throw new AppError(403, "Access denied to project");
    where.projectId = params.projectId;
  } else {
    // Only show tasks from user's projects
    where.project = {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    };
  }

  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.assigneeId) where.assigneeId = params.assigneeId;
  if (params.search) {
    where.title = { contains: params.search, mode: "insensitive" };
  }

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        creator: { select: { id: true, name: true } },
        project: { select: { id: true, name: true, color: true } },
        _count: { select: { subTasks: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { data: tasks, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

// ─── Get Task ─────────────────────────────────────────────────────────────────
export async function getTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true, email: true } },
      creator: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true, color: true } },
      subTasks: {
        include: { assignee: { select: { id: true, name: true, avatarUrl: true } } },
      },
      activityLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
  });

  if (!task) throw new AppError(404, "Task not found");
  return task;
}

// ─── Create Task ──────────────────────────────────────────────────────────────
export async function createTask(userId: string, data: CreateTaskInput) {
  const project = await prisma.project.findFirst({
    where: {
      id: data.projectId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
  });

  if (!project) throw new AppError(403, "Access denied to project");

  const task = await prisma.$transaction(async (tx) => {
    const task = await tx.task.create({
      data: {
        ...data,
        creatorId: userId,
        tags: data.tags || [],
      },
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
      },
    });

    await tx.activityLog.create({
      data: {
        action: "task.created",
        userId,
        projectId: data.projectId,
        taskId: task.id,
        metadata: { taskTitle: task.title, priority: task.priority },
      },
    });

    return task;
  });

  tasksTotal.inc({ status: task.status, priority: task.priority });
  return task;
}

// ─── Update Task ──────────────────────────────────────────────────────────────
export async function updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
  const existing = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    },
  });

  if (!existing) throw new AppError(404, "Task not found");

  return prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
      },
    });

    const changes: string[] = [];
    if (data.status && data.status !== existing.status) changes.push(`status: ${existing.status} → ${data.status}`);
    if (data.assigneeId !== undefined) changes.push("assignee changed");

    if (changes.length > 0) {
      await tx.activityLog.create({
        data: {
          action: "task.updated",
          userId,
          projectId: existing.projectId,
          taskId,
          metadata: { changes },
        },
      });
    }

    return updated;
  });
}

// ─── Delete Task ──────────────────────────────────────────────────────────────
export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      OR: [
        { creatorId: userId },
        { project: { ownerId: userId } },
      ],
    },
  });

  if (!task) throw new AppError(404, "Task not found or insufficient permissions");
  await prisma.task.delete({ where: { id: taskId } });
}
