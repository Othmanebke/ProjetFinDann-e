// ─── Auth ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'USER';
  fitnessGoal?: FitnessGoal;
  weightKg?: number;
  heightCm?: number;
  weeklyTargetKm?: number;
  preferredActivities?: WorkoutType[];
  currentCity?: string;
  currentCountry?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}

// ─── Enums ─────────────────────────────────────────────────────────────────

export type WorkoutType = 'RUN' | 'WALK' | 'CYCLE' | 'GYM' | 'HIIT' | 'YOGA' | 'SWIM';
export type RouteType = 'RUNNING' | 'WALKING' | 'CYCLING';
export type RouteDifficulty = 'EASY' | 'MODERATE' | 'HARD';
export type FitnessGoal = 'WEIGHT_LOSS' | 'MUSCLE_GAIN' | 'ENDURANCE' | 'FLEXIBILITY' | 'MAINTENANCE';
export type SubscriptionPlan = 'FREE' | 'PREMIUM_COACH' | 'PASS_VOYAGEUR';
export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIALING' | 'INCOMPLETE';

// ─── Workout ───────────────────────────────────────────────────────────────

export interface Workout {
  id: string;
  userId: string;
  type: WorkoutType;
  title?: string;
  distanceKm: number;
  durationMin: number;
  calories: number;
  heartRateAvg?: number;
  heartRateMax?: number;
  paceMinPerKm?: number;
  elevationM?: number;
  city?: string;
  country?: string;
  routeId?: string;
  route?: TravelRoute;
  completedAt: string;
  weekNumber: number;
  yearNumber: number;
  notes?: string;
  isOutdoor: boolean;
  weatherInfo?: WeatherInfo;
  createdAt: string;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  humidity: number;
}

export interface WorkoutStats {
  totalDistanceKm: number;
  totalDurationMin: number;
  totalCalories: number;
  totalSessions: number;
  avgPaceMinPerKm?: number;
  weeklyData: WeeklyStats[];
}

export interface WeeklyStats {
  weekNumber: number;
  yearNumber: number;
  label: string;
  distanceKm: number;
  durationMin: number;
  calories: number;
  sessions: number;
}

// ─── Travel Route ──────────────────────────────────────────────────────────

export interface TravelRoute {
  id: string;
  userId: string;
  city: string;
  country: string;
  name: string;
  description?: string;
  type: RouteType;
  difficulty: RouteDifficulty;
  distanceKm: number;
  estimatedMinutes: number;
  elevationM?: number;
  waypoints: Waypoint[];
  pointsOfInterest: PointOfInterest[];
  aiGenerated: boolean;
  safetyScore?: number;
  safetyNotes?: string;
  bestTimeOfDay?: string;
  isPublic: boolean;
  savedCount: number;
  createdAt: string;
}

export interface Waypoint {
  lat: number;
  lng: number;
  name: string;
  type: 'start' | 'end' | 'poi' | 'waypoint';
}

export interface PointOfInterest {
  name: string;
  type: string;
  description: string;
}

// ─── Nutrition ─────────────────────────────────────────────────────────────

export interface NutritionLog {
  id: string;
  userId: string;
  city?: string;
  country?: string;
  restaurant?: string;
  mealName: string;
  description?: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  aiRecommended: boolean;
  tags: string[];
  loggedAt: string;
}

// ─── AI Responses ──────────────────────────────────────────────────────────

export interface AIGeneratedRoute {
  name: string;
  description: string;
  distanceKm: number;
  estimatedMinutes: number;
  difficulty: RouteDifficulty;
  waypoints: Waypoint[];
  pointsOfInterest: PointOfInterest[];
  safetyScore: number;
  safetyNotes: string;
  bestTimeOfDay: string;
  tips: string[];
}

export interface AIRestaurantRecommendation {
  restaurant: string;
  mealName: string;
  description: string;
  caloriesKcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  tags: string[];
  whyRecommended: string;
  priceRange: '€' | '€€' | '€€€';
}

export interface AIWorkoutAnalysis {
  summary: string;
  performanceTrend: 'improving' | 'stable' | 'declining';
  strengths: string[];
  areasToImprove: string[];
  nextWeekGoal: string;
  recommendedWorkouts: string[];
}

// ─── Subscription ──────────────────────────────────────────────────────────

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
}

// ─── Notification ──────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ─── Chat ──────────────────────────────────────────────────────────────────

export interface FitChat {
  id: string;
  userId: string;
  title: string;
  messages: FitMessage[];
  createdAt: string;
}

export interface FitMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

// ─── Pagination ────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
