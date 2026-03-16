import { generateRoute, recommendRestaurants, analyzeWorkoutPerformance } from '../services/ai.service';

jest.mock('../clients/openai.client', () => ({
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../lib/prisma', () => ({
  fitChat: { findFirst: jest.fn(), create: jest.fn() },
  fitMessage: { create: jest.fn() },
}));

import openai from '../clients/openai.client';
const mockCreate = openai.chat.completions.create as jest.Mock;

const mockRoute = {
  name: 'Barceloneta Coastal Run',
  description: 'A scenic 6km run along the Barcelona waterfront',
  distanceKm: 6.2,
  estimatedMinutes: 38,
  difficulty: 'EASY',
  waypoints: [{ lat: 41.37, lng: 2.18, name: 'Barceloneta Beach', type: 'start' }],
  pointsOfInterest: [{ name: 'Port Olímpic', type: 'landmark', description: 'Olympic marina' }],
  safetyScore: 9,
  safetyNotes: 'Well-lit flat route',
  bestTimeOfDay: 'morning',
  tips: ['Bring water', 'Avoid peak hours'],
};

describe('AI Service — Fit & Travel', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('generateRoute', () => {
    it('generates a route for a given city', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockRoute) } }],
      });

      const route = await generateRoute('Barcelona', 'Spain', 'RUNNING', 6, 'EASY', { fitnessGoal: 'ENDURANCE' });

      expect(route.name).toBe('Barceloneta Coastal Run');
      expect(route.distanceKm).toBe(6.2);
      expect(route.safetyScore).toBe(9);
      expect(route.waypoints).toHaveLength(1);
      expect(route.pointsOfInterest).toHaveLength(1);
    });

    it('calls OpenAI with city and activity type in prompt', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockRoute) } }],
      });

      await generateRoute('Tokyo', 'Japan', 'WALKING', 5, 'MODERATE');

      expect(mockCreate).toHaveBeenCalledTimes(1);
      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[1].content).toContain('Tokyo');
      expect(call.messages[1].content).toContain('walking');
    });
  });

  describe('recommendRestaurants', () => {
    it('returns restaurant recommendations for a city', async () => {
      const mockRecs = {
        recommendations: [
          { restaurant: 'La Boqueria', mealName: 'Grilled Sea Bass', caloriesKcal: 420, proteinG: 38, carbsG: 22, fatG: 16, tags: ['local', 'high-protein'], whyRecommended: 'High protein for muscle gain', priceRange: '€€' },
        ],
      };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockRecs) } }],
      });

      const recs = await recommendRestaurants('Barcelona', 'Spain', 600, 'MUSCLE_GAIN');

      expect(recs).toHaveLength(1);
      expect(recs[0].mealName).toBe('Grilled Sea Bass');
      expect(recs[0].proteinG).toBe(38);
    });
  });

  describe('analyzeWorkoutPerformance', () => {
    it('returns performance trend analysis', async () => {
      const mockAnalysis = {
        summary: 'Tu as parcouru 23km cette semaine, en progression de 15%.',
        performanceTrend: 'improving',
        strengths: ['Régularité', 'Distance en hausse'],
        areasToImprove: ['Vitesse', 'Récupération'],
        nextWeekGoal: 'Atteindre 25km en 4 séances',
        recommendedWorkouts: ['Fartlek 5km', 'Long run 10km', 'HIIT 30min'],
      };
      mockCreate.mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
      });

      const weeklyData = [
        { weekNumber: 10, distanceKm: 15, durationMin: 90, calories: 1200, sessions: 3 },
        { weekNumber: 11, distanceKm: 20, durationMin: 120, calories: 1500, sessions: 4 },
        { weekNumber: 12, distanceKm: 23, durationMin: 140, calories: 1700, sessions: 4 },
      ];

      const analysis = await analyzeWorkoutPerformance(weeklyData, 'ENDURANCE', 25);

      expect(analysis.performanceTrend).toBe('improving');
      expect(analysis.strengths).toContain('Régularité');
      expect(analysis.nextWeekGoal).toContain('25km');
    });
  });
});
