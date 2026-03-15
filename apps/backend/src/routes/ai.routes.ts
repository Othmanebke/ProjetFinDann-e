import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { aiRateLimit } from '../middlewares/rate-limit.middleware';
import * as aiService from '../services/ai.service';

const router = Router();

// List chats
router.get('/chats', authenticate, async (req, res, next) => {
  try {
    const chats = await aiService.listFitChats(req.user!.id);
    res.json(chats);
  } catch (err) { next(err); }
});

// Create chat
router.post('/chats', authenticate, async (req, res, next) => {
  try {
    const chat = await aiService.createFitChat(req.user!.id, req.body.title);
    res.status(201).json(chat);
  } catch (err) { next(err); }
});

// Stream message
router.post('/chats/:chatId/stream', authenticate, aiRateLimit, async (req, res, next) => {
  try {
    await aiService.streamFitChat(req.params.chatId, req.user!.id, req.body.message, res);
  } catch (err) { next(err); }
});

// Analyze workout performance
router.post('/analyze-performance', authenticate, async (req, res, next) => {
  try {
    const { weeklyData, fitnessGoal, weeklyTargetKm } = req.body;
    const analysis = await aiService.analyzeWorkoutPerformance(weeklyData, fitnessGoal, weeklyTargetKm);
    res.json(analysis);
  } catch (err) { next(err); }
});

export default router;
