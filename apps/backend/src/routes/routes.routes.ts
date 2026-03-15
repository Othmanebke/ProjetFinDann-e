import { Router } from 'express';
import { authenticate, requirePlan } from '../middlewares/auth.middleware';
import * as routeService from '../services/route.service';
import * as aiService from '../services/ai.service';
import { z } from 'zod';
import { RouteType, RouteDifficulty } from '@prisma/client';

const router = Router();

const GenerateRouteSchema = z.object({
  city: z.string().min(1),
  country: z.string().min(1),
  type: z.nativeEnum(RouteType).default('RUNNING'),
  distanceKm: z.number().min(1).max(50),
  difficulty: z.nativeEnum(RouteDifficulty).default('MODERATE'),
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const data = await routeService.listRoutes(req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/generate', authenticate, requirePlan('PREMIUM_COACH', 'PASS_VOYAGEUR'), async (req, res, next) => {
  try {
    const body = GenerateRouteSchema.parse(req.body);
    const route = await routeService.generateAndSaveRoute(req.user!.id, body);
    res.status(201).json(route);
  } catch (err) { next(err); }
});

router.post('/restaurants', authenticate, async (req, res, next) => {
  try {
    const { city, country, targetCalories, fitnessGoal, restrictions } = req.body;
    const recs = await aiService.recommendRestaurants(city, country, targetCalories ?? 600, fitnessGoal ?? 'MAINTENANCE', restrictions);
    res.json({ recommendations: recs });
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await routeService.getRoute(req.params.id, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await routeService.deleteRoute(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
