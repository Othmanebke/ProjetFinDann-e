import { PrismaClient, WorkoutType, FitnessGoal, RouteType, RouteDifficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Fit & Travel database...');

  const adminHash = await bcrypt.hash('Admin@123!', 12);
  const userHash  = await bcrypt.hash('User@123!',  12);

  const currentWeek = getISOWeek(new Date());
  const currentYear = new Date().getFullYear();

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fittravel.app' },
    update: {},
    create: {
      email: 'admin@fittravel.app',
      name: 'Admin Fit & Travel',
      role: 'ADMIN',
      passwordHash: adminHash,
      emailVerified: true,
      fitnessGoal: FitnessGoal.ENDURANCE,
      weightKg: 75,
      heightCm: 178,
      weeklyTargetKm: 40,
      currentCity: 'Paris',
      currentCountry: 'France',
      subscription: {
        create: { plan: 'PREMIUM_COACH', status: 'ACTIVE' },
      },
    },
  });

  // Demo user
  const demo = await prisma.user.upsert({
    where: { email: 'demo@fittravel.app' },
    update: {},
    create: {
      email: 'demo@fittravel.app',
      name: 'Sophie Martin',
      passwordHash: userHash,
      emailVerified: true,
      fitnessGoal: FitnessGoal.WEIGHT_LOSS,
      weightKg: 62,
      heightCm: 165,
      weeklyTargetKm: 25,
      currentCity: 'Barcelona',
      currentCountry: 'Spain',
      subscription: {
        create: { plan: 'FREE', status: 'ACTIVE' },
      },
    },
  });

  // Demo travel route
  const route = await prisma.travelRoute.create({
    data: {
      userId: demo.id,
      city: 'Barcelona',
      country: 'Spain',
      name: 'Barceloneta to Parc de la Ciutadella',
      description: 'A scenic coastal run passing the Gothic Quarter and ending in the beautiful Ciutadella park.',
      type: RouteType.RUNNING,
      difficulty: RouteDifficulty.EASY,
      distanceKm: 6.2,
      estimatedMinutes: 38,
      elevationM: 45,
      safetyScore: 9,
      bestTimeOfDay: 'morning',
      safetyNotes: 'Well-lit, flat route. Avoid beach promenade peak hours (11h-17h in summer).',
      waypoints: [
        { lat: 41.3764, lng: 2.1899, name: 'Barceloneta Beach', type: 'start' },
        { lat: 41.3788, lng: 2.1872, name: 'Port Olímpic', type: 'poi' },
        { lat: 41.3851, lng: 2.1952, name: 'Arc de Triomf', type: 'poi' },
        { lat: 41.3875, lng: 2.1869, name: 'Parc de la Ciutadella', type: 'end' },
      ],
      pointsOfInterest: [
        { name: 'Barceloneta Beach', type: 'beach', description: 'Start on the iconic Barcelona beach' },
        { name: 'Port Olímpic', type: 'landmark', description: 'Olympic marina from 1992 Games' },
        { name: 'Arc de Triomf', type: 'monument', description: 'Stunning triumphal arch (1888)' },
        { name: 'Parc de la Ciutadella', type: 'park', description: 'Peaceful finish in Barcelona\'s green lung' },
      ],
      aiGenerated: true,
    },
  });

  // Demo workouts (last 3 weeks for chart data)
  const workoutData = [
    // Week currentWeek-2
    { week: currentWeek - 2, distanceKm: 5.2, durationMin: 32, calories: 340, type: WorkoutType.RUN, city: 'Madrid' },
    { week: currentWeek - 2, distanceKm: 3.8, durationMin: 24, calories: 210, type: WorkoutType.WALK, city: 'Madrid' },
    { week: currentWeek - 2, distanceKm: 0,   durationMin: 45, calories: 280, type: WorkoutType.GYM,  city: 'Madrid' },
    // Week currentWeek-1
    { week: currentWeek - 1, distanceKm: 7.1, durationMin: 43, calories: 470, type: WorkoutType.RUN,  city: 'Barcelona' },
    { week: currentWeek - 1, distanceKm: 4.5, durationMin: 28, calories: 245, type: WorkoutType.WALK, city: 'Barcelona' },
    { week: currentWeek - 1, distanceKm: 12,  durationMin: 55, calories: 380, type: WorkoutType.CYCLE, city: 'Barcelona' },
    // Current week
    { week: currentWeek, distanceKm: 6.2, durationMin: 38, calories: 420, type: WorkoutType.RUN,  city: 'Barcelona', routeId: route.id },
    { week: currentWeek, distanceKm: 5.0, durationMin: 30, calories: 310, type: WorkoutType.WALK, city: 'Barcelona' },
  ];

  for (const w of workoutData) {
    await prisma.workout.create({
      data: {
        userId: demo.id,
        type: w.type,
        distanceKm: w.distanceKm,
        durationMin: w.durationMin,
        calories: w.calories,
        city: w.city,
        country: 'Spain',
        weekNumber: Math.max(1, w.week),
        yearNumber: currentYear,
        completedAt: new Date(),
        routeId: w.routeId,
      },
    });
  }

  // Demo nutrition logs
  await prisma.nutritionLog.createMany({
    data: [
      { userId: demo.id, city: 'Barcelona', country: 'Spain', restaurant: 'El Xampanyet', mealName: 'Grilled Sea Bass with Vegetables', caloriesKcal: 420, proteinG: 38, carbsG: 22, fatG: 16, aiRecommended: true, tags: ['high-protein', 'local', 'mediterranean'] },
      { userId: demo.id, city: 'Barcelona', country: 'Spain', restaurant: 'Boqueria Market', mealName: 'Fresh Fruit Bowl + Greek Yogurt', caloriesKcal: 280, proteinG: 14, carbsG: 48, fatG: 6, aiRecommended: true, tags: ['recovery', 'local', 'light'] },
    ],
  });

  console.log('✅ Fit & Travel database seeded successfully!');
  console.log(`   Admin: admin@fittravel.app / Admin@123!`);
  console.log(`   Demo:  demo@fittravel.app / User@123!`);
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
