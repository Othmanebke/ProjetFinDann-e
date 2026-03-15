import prisma from '../lib/prisma';
import { RouteType, RouteDifficulty } from '@prisma/client';
import * as aiService from './ai.service';

export async function listRoutes(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    prisma.travelRoute.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.travelRoute.count({ where: { userId } }),
  ]);
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getRoute(id: string, userId: string) {
  const route = await prisma.travelRoute.findFirst({ where: { id, userId } });
  if (!route) throw new Error('Route not found');
  return route;
}

export async function generateAndSaveRoute(userId: string, params: {
  city: string; country: string; type: RouteType; distanceKm: number; difficulty: RouteDifficulty;
}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { fitnessGoal: true, weightKg: true } });

  const aiRoute = await aiService.generateRoute(
    params.city, params.country, params.type,
    params.distanceKm, params.difficulty,
    { fitnessGoal: user?.fitnessGoal ?? undefined, weightKg: user?.weightKg ?? undefined }
  );

  return prisma.travelRoute.create({
    data: {
      userId,
      city: params.city,
      country: params.country,
      name: aiRoute.name,
      description: aiRoute.description,
      type: params.type,
      difficulty: params.difficulty,
      distanceKm: aiRoute.distanceKm,
      estimatedMinutes: aiRoute.estimatedMinutes,
      waypoints: aiRoute.waypoints as any,
      pointsOfInterest: aiRoute.pointsOfInterest as any,
      safetyScore: aiRoute.safetyScore,
      safetyNotes: aiRoute.safetyNotes,
      bestTimeOfDay: aiRoute.bestTimeOfDay,
      aiGenerated: true,
    },
  });
}

export async function deleteRoute(id: string, userId: string) {
  const route = await prisma.travelRoute.findFirst({ where: { id, userId } });
  if (!route) throw new Error('Route not found');
  return prisma.travelRoute.delete({ where: { id } });
}
