import { Request, Response, NextFunction } from "express";
import * as tasksService from "../services/tasks.service";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  startDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  estimatedHours: z.number().positive().optional(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
  parentTaskId: z.string().cuid().optional(),
});

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await tasksService.listTasks(req.user!.sub, {
      projectId: req.query.projectId as string,
      status: req.query.status as any,
      priority: req.query.priority as any,
      assigneeId: req.query.assigneeId as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 50,
      search: req.query.search as string,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await tasksService.getTask(req.params.id, req.user!.sub);
    res.json(task);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.parse(req.body);
    const task = await tasksService.createTask(req.user!.sub, data);
    res.status(201).json(task);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.omit({ projectId: true }).partial().parse(req.body);
    const task = await tasksService.updateTask(req.params.id, req.user!.sub, data);
    res.json(task);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await tasksService.deleteTask(req.params.id, req.user!.sub);
    res.status(204).send();
  } catch (err) { next(err); }
}
