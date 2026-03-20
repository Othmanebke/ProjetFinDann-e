import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as nutritionService from '../services/nutrition.service';
import * as aiService from '../services/ai.service';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const CreateLogSchema = z.object({
  mealName: z.string().min(1).max(200),
  caloriesKcal: z.number().min(0).optional(),
  proteinG: z.number().min(0).optional(),
  carbsG: z.number().min(0).optional(),
  fatG: z.number().min(0).optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  loggedAt: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
});

// List logs
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const data = await nutritionService.listNutritionLogs(req.user!.sub, page, limit);
    res.json(data);
  } catch (err) { next(err); }
});

// Daily summary
router.get('/daily', async (req, res, next) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const data = await nutritionService.getDailyNutritionSummary(req.user!.sub, date);
    res.json(data);
  } catch (err) { next(err); }
});

// Weekly stats
router.get('/stats', async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks as string) || 4;
    const data = await nutritionService.getWeeklyNutritionStats(req.user!.sub, weeks);
    res.json(data);
  } catch (err) { next(err); }
});

// AI restaurant recommendations
router.post('/recommend', async (req, res, next) => {
  try {
    const { city, country, targetCalories, fitnessGoal, restrictions } = req.body;
    if (!city || !country) {
      res.status(400).json({ error: 'city and country are required' });
      return;
    }
    const recommendations = await aiService.recommendRestaurants(
      city, country,
      targetCalories ?? 600,
      fitnessGoal ?? 'MAINTENANCE',
      restrictions
    );
    res.json({ recommendations });
  } catch (err) { next(err); }
});

// Create log
router.post('/', async (req, res, next) => {
  try {
    const body = CreateLogSchema.parse(req.body);
    const data = await nutritionService.createNutritionLog(req.user!.sub, body);
    res.status(201).json(data);
  } catch (err) { next(err); }
});

// Get one log
router.get('/:id', async (req, res, next) => {
  try {
    const data = await nutritionService.getNutritionLog(req.params.id, req.user!.sub);
    res.json(data);
  } catch (err) { next(err); }
});

// Update log
router.patch('/:id', async (req, res, next) => {
  try {
    const data = await nutritionService.updateNutritionLog(req.params.id, req.user!.sub, req.body);
    res.json(data);
  } catch (err) { next(err); }
});

// Delete log
router.delete('/:id', async (req, res, next) => {
  try {
    await nutritionService.deleteNutritionLog(req.params.id, req.user!.sub);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
