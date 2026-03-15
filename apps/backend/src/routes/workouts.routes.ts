import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as workoutService from '../services/workout.service';
import { z } from 'zod';
import { WorkoutType } from '@prisma/client';

const router = Router();

const CreateWorkoutSchema = z.object({
  type: z.nativeEnum(WorkoutType),
  distanceKm: z.number().min(0).optional(),
  durationMin: z.number().min(1),
  calories: z.number().min(0).optional(),
  heartRateAvg: z.number().optional(),
  heartRateMax: z.number().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  routeId: z.string().optional(),
  completedAt: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const data = await workoutService.listWorkouts(req.user!.id, page, limit);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 8;
    const data = await workoutService.getWorkoutStats(req.user!.id, weeks);
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await workoutService.getWorkout(req.params.id, req.user!.id);
    res.json(data);
  } catch (err) { next(err); }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const body = CreateWorkoutSchema.parse(req.body);
    const data = await workoutService.createWorkout(req.user!.id, body);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const data = await workoutService.updateWorkout(req.params.id, req.user!.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await workoutService.deleteWorkout(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
