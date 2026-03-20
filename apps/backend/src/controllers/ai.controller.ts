import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as aiService from "../services/ai.service";

// ─── Chat streaming (fitness + travel coach) ───────────────────────────────
export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { message, chatId } = z.object({
      message: z.string().min(1).max(4000),
      chatId: z.string().min(1),
    }).parse(req.body);

    await aiService.streamFitChat(chatId, req.user!.sub, message, res);
  } catch (err) { next(err); }
}

// ─── Analyze workout performance ───────────────────────────────────────────
export async function analyzePerformance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { weeklyData, fitnessGoal, weeklyTargetKm } = z.object({
      weeklyData: z.array(z.object({
        weekNumber: z.number(),
        distanceKm: z.number(),
        durationMin: z.number(),
        calories: z.number(),
        sessions: z.number(),
      })),
      fitnessGoal: z.string().default('ENDURANCE'),
      weeklyTargetKm: z.number().default(30),
    }).parse(req.body);

    const result = await aiService.analyzeWorkoutPerformance(weeklyData, fitnessGoal, weeklyTargetKm);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── Generate route via IA ──────────────────────────────────────────────────
export async function generateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { city, country, activityType, distanceKm, difficulty } = z.object({
      city: z.string().min(1),
      country: z.string().min(1),
      activityType: z.string().default('RUN'),
      distanceKm: z.number().min(1).max(50),
      difficulty: z.string().default('MODERATE'),
    }).parse(req.body);

    const result = await aiService.generateRoute(city, country, activityType, distanceKm, difficulty);
    res.json(result);
  } catch (err) { next(err); }
}

// ─── Restaurant recommendations ────────────────────────────────────────────
export async function recommendRestaurants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { city, country, targetCalories, fitnessGoal, restrictions } = z.object({
      city: z.string().min(1),
      country: z.string().min(1),
      targetCalories: z.number().default(600),
      fitnessGoal: z.string().default('MAINTENANCE'),
      restrictions: z.array(z.string()).optional(),
    }).parse(req.body);

    const recommendations = await aiService.recommendRestaurants(city, country, targetCalories, fitnessGoal, restrictions);
    res.json({ recommendations });
  } catch (err) { next(err); }
}
