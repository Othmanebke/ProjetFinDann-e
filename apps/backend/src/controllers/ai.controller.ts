import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as aiService from "../services/ai.service";

const chatSchema = z.object({
  message: z.string().min(1).max(4000),
  chatId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
});

export async function generatePlan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = z.object({ projectId: z.string().cuid() }).parse(req.body);
    const result = await aiService.generateProjectPlan(projectId, req.user!.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function summarize(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, days } = z.object({
      projectId: z.string().cuid(),
      days: z.number().min(1).max(90).optional(),
    }).parse(req.body);
    const result = await aiService.summarizeActivity(projectId, req.user!.sub, days);
    res.json(result);
  } catch (err) { next(err); }
}

export async function risks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId } = z.object({ projectId: z.string().cuid() }).parse(req.body);
    const result = await aiService.identifyRisks(projectId, req.user!.sub);
    res.json(result);
  } catch (err) { next(err); }
}

export async function generateTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { projectId, context } = z.object({
      projectId: z.string().cuid(),
      context: z.string().max(1000),
    }).parse(req.body);
    const result = await aiService.generateTasks(projectId, req.user!.sub, context);
    res.json(result);
  } catch (err) { next(err); }
}

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, chatId, projectId } = chatSchema.parse(req.body);
    await aiService.streamChat(
      req.user!.sub,
      chatId || null,
      message,
      projectId || null,
      res
    );
  } catch (err) { next(err); }
}
