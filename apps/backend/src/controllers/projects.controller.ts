import { Request, Response, NextFunction } from "express";
import * as projectsService from "../services/projects.service";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  startDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  endDate: z.string().datetime().optional().transform((v) => v ? new Date(v) : undefined),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await projectsService.listProjects(req.user!.sub, {
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      status: req.query.status as any,
      search: req.query.search as string,
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await projectsService.getProject(req.params.id, req.user!.sub);
    res.json(project);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.parse(req.body);
    const project = await projectsService.createProject(req.user!.sub, data);
    res.status(201).json(project);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createSchema.partial().parse(req.body);
    const project = await projectsService.updateProject(req.params.id, req.user!.sub, data);
    res.json(project);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await projectsService.deleteProject(req.params.id, req.user!.sub);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function stats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await projectsService.getProjectStats(req.params.id, req.user!.sub);
    res.json(result);
  } catch (err) { next(err); }
}
