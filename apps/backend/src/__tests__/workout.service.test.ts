import { createWorkout, listWorkouts, getWorkoutStats } from '../services/workout.service';

jest.mock('../lib/prisma', () => ({
  workout: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('../lib/utils', () => ({
  getISOWeek: jest.fn(() => 12),
}));

import prisma from '../lib/prisma';
const mockWorkout = prisma.workout as jest.Mocked<typeof prisma.workout>;

describe('Workout Service', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('createWorkout', () => {
    it('creates a workout with week number', async () => {
      const fakeWorkout = { id: 'w1', type: 'RUN', distanceKm: 5, durationMin: 30, calories: 350, weekNumber: 12, yearNumber: 2026, userId: 'u1' };
      (mockWorkout.create as jest.Mock).mockResolvedValue(fakeWorkout);

      const result = await createWorkout('u1', { type: 'RUN' as any, durationMin: 30, distanceKm: 5, calories: 350, city: 'Paris', country: 'France' });

      expect(mockWorkout.create).toHaveBeenCalledTimes(1);
      const call = (mockWorkout.create as jest.Mock).mock.calls[0][0];
      expect(call.data.weekNumber).toBe(12);
      expect(call.data.userId).toBe('u1');
      expect(result.type).toBe('RUN');
    });
  });

  describe('listWorkouts', () => {
    it('returns paginated workouts for a user', async () => {
      const fakeWorkouts = [{ id: 'w1', type: 'RUN' }, { id: 'w2', type: 'WALK' }];
      (mockWorkout.findMany as jest.Mock).mockResolvedValue(fakeWorkouts);
      (mockWorkout.count as jest.Mock).mockResolvedValue(2);

      const result = await listWorkouts('u1', 1, 20);

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
    });
  });

  describe('getWorkoutStats', () => {
    it('aggregates weekly data correctly', async () => {
      (mockWorkout.findMany as jest.Mock).mockResolvedValue([
        { distanceKm: 5, durationMin: 30, calories: 350 },
        { distanceKm: 8, durationMin: 48, calories: 520 },
      ]);

      const result = await getWorkoutStats('u1', 4);

      expect(result.weeklyData).toHaveLength(4);
      expect(result.totalSessions).toBeGreaterThanOrEqual(0);
    });
  });
});
