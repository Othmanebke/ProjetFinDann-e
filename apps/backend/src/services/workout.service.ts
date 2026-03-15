import prisma from '../lib/prisma';
import { getISOWeek } from '../lib/utils';
import { WorkoutType } from '@prisma/client';

export async function listWorkouts(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      skip,
      take: limit,
      include: { route: { select: { name: true, city: true } } },
    }),
    prisma.workout.count({ where: { userId } }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getWorkout(id: string, userId: string) {
  const workout = await prisma.workout.findFirst({ where: { id, userId }, include: { route: true } });
  if (!workout) throw new Error('Workout not found');
  return workout;
}

export async function createWorkout(userId: string, data: {
  type: WorkoutType; distanceKm?: number; durationMin: number;
  calories?: number; heartRateAvg?: number; heartRateMax?: number;
  city?: string; country?: string; notes?: string; completedAt?: Date; routeId?: string;
}) {
  const completedAt = data.completedAt ?? new Date();
  const weekNumber = getISOWeek(completedAt);
  const yearNumber = completedAt.getFullYear();

  return prisma.workout.create({
    data: { ...data, userId, weekNumber, yearNumber, completedAt },
  });
}

export async function updateWorkout(id: string, userId: string, data: Partial<{
  type: WorkoutType; distanceKm: number; durationMin: number; calories: number;
  notes: string; heartRateAvg: number; heartRateMax: number;
}>) {
  const workout = await prisma.workout.findFirst({ where: { id, userId } });
  if (!workout) throw new Error('Workout not found');
  return prisma.workout.update({ where: { id }, data });
}

export async function deleteWorkout(id: string, userId: string) {
  const workout = await prisma.workout.findFirst({ where: { id, userId } });
  if (!workout) throw new Error('Workout not found');
  return prisma.workout.delete({ where: { id } });
}

export async function getWorkoutStats(userId: string, weeks = 8) {
  const currentWeek = getISOWeek(new Date());
  const currentYear = new Date().getFullYear();

  const weeklyData = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const w = currentWeek - i;
    const workouts = await prisma.workout.findMany({
      where: { userId, weekNumber: Math.max(1, w), yearNumber: currentYear },
    });
    weeklyData.push({
      weekNumber: Math.max(1, w),
      yearNumber: currentYear,
      label: `S${Math.max(1, w)}`,
      distanceKm: Math.round(workouts.reduce((s, x) => s + x.distanceKm, 0) * 10) / 10,
      durationMin: workouts.reduce((s, x) => s + x.durationMin, 0),
      calories: workouts.reduce((s, x) => s + x.calories, 0),
      sessions: workouts.length,
    });
  }

  const allWorkouts = await prisma.workout.findMany({ where: { userId } });
  return {
    totalDistanceKm: Math.round(allWorkouts.reduce((s, w) => s + w.distanceKm, 0) * 10) / 10,
    totalDurationMin: allWorkouts.reduce((s, w) => s + w.durationMin, 0),
    totalCalories: allWorkouts.reduce((s, w) => s + w.calories, 0),
    totalSessions: allWorkouts.length,
    weeklyData,
  };
}
