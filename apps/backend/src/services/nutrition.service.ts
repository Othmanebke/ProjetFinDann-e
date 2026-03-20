import prisma from '../lib/prisma';
import { getISOWeek } from '../lib/utils';

export async function listNutritionLogs(userId: string, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.nutritionLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.nutritionLog.count({ where: { userId } }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getNutritionLog(id: string, userId: string) {
  const log = await prisma.nutritionLog.findFirst({ where: { id, userId } });
  if (!log) throw new Error('Nutrition log not found');
  return log;
}

export async function createNutritionLog(userId: string, data: {
  mealName: string;
  caloriesKcal?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  notes?: string;
  tags?: string[];
  loggedAt?: Date;
}) {
  const loggedAt = data.loggedAt ?? new Date();
  const weekNumber = getISOWeek(loggedAt);
  const yearNumber = loggedAt.getFullYear();
  return prisma.nutritionLog.create({
    data: { ...data, userId, weekNumber, yearNumber, loggedAt },
  });
}

export async function updateNutritionLog(id: string, userId: string, data: Partial<{
  mealName: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes: string;
  tags: string[];
}>) {
  const log = await prisma.nutritionLog.findFirst({ where: { id, userId } });
  if (!log) throw new Error('Nutrition log not found');
  return prisma.nutritionLog.update({ where: { id }, data });
}

export async function deleteNutritionLog(id: string, userId: string) {
  const log = await prisma.nutritionLog.findFirst({ where: { id, userId } });
  if (!log) throw new Error('Nutrition log not found');
  return prisma.nutritionLog.delete({ where: { id } });
}

export async function getDailyNutritionSummary(userId: string, date?: Date) {
  const target = date ?? new Date();
  const start = new Date(target);
  start.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(23, 59, 59, 999);

  const logs = await prisma.nutritionLog.findMany({
    where: { userId, loggedAt: { gte: start, lte: end } },
    orderBy: { loggedAt: 'asc' },
  });

  const totals = logs.reduce(
    (acc, l) => ({
      calories: acc.calories + (l.caloriesKcal ?? 0),
      protein: acc.protein + (l.proteinG ?? 0),
      carbs: acc.carbs + (l.carbsG ?? 0),
      fat: acc.fat + (l.fatG ?? 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return { date: start, logs, totals };
}

export async function getWeeklyNutritionStats(userId: string, weeks = 4) {
  const currentWeek = getISOWeek(new Date());
  const currentYear = new Date().getFullYear();

  const weeklyData = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const w = Math.max(1, currentWeek - i);
    const logs = await prisma.nutritionLog.findMany({
      where: { userId, weekNumber: w, yearNumber: currentYear },
    });
    weeklyData.push({
      weekNumber: w,
      label: `S${w}`,
      avgCalories: logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.caloriesKcal ?? 0), 0) / logs.length) : 0,
      totalCalories: logs.reduce((s, l) => s + (l.caloriesKcal ?? 0), 0),
      avgProtein: logs.length > 0 ? Math.round(logs.reduce((s, l) => s + (l.proteinG ?? 0), 0) / logs.length) : 0,
      meals: logs.length,
    });
  }
  return weeklyData;
}
