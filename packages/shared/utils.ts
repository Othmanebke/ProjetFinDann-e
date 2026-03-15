import { WorkoutType, RouteDifficulty, FitnessGoal } from '@smartproject/types';

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

export function timeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return formatDate(date);
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${h}h`;
}

export function formatPace(paceMinPerKm: number): string {
  const min = Math.floor(paceMinPerKm);
  const sec = Math.round((paceMinPerKm - min) * 60);
  return `${min}'${sec.toString().padStart(2, '0')}''/km`;
}

export function getISOWeek(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function workoutTypeLabel(type: WorkoutType): string {
  const labels: Record<WorkoutType, string> = {
    RUN: '🏃 Course', WALK: '🚶 Marche', CYCLE: '🚴 Vélo',
    GYM: '💪 Muscu', HIIT: '⚡ HIIT', YOGA: '🧘 Yoga', SWIM: '🏊 Natation',
  };
  return labels[type] ?? type;
}

export function workoutTypeIcon(type: WorkoutType): string {
  const icons: Record<WorkoutType, string> = {
    RUN: '🏃', WALK: '🚶', CYCLE: '🚴', GYM: '💪', HIIT: '⚡', YOGA: '🧘', SWIM: '🏊',
  };
  return icons[type] ?? '🏋️';
}

export function difficultyLabel(d: RouteDifficulty): string {
  return { EASY: 'Facile', MODERATE: 'Modéré', HARD: 'Difficile' }[d] ?? d;
}

export function difficultyColor(d: RouteDifficulty): string {
  return { EASY: '#10b981', MODERATE: '#f59e0b', HARD: '#ef4444' }[d] ?? '#94a3b8';
}

export function fitnessGoalLabel(g: FitnessGoal): string {
  return {
    WEIGHT_LOSS: 'Perte de poids', MUSCLE_GAIN: 'Prise de muscle',
    ENDURANCE: 'Endurance', FLEXIBILITY: 'Flexibilité', MAINTENANCE: 'Maintien',
  }[g] ?? g;
}

export const PLAN_LIMITS = {
  FREE:           { routesPerMonth: 3,  aiChats: 5,  nutritionLogs: 10 },
  PREMIUM_COACH:  { routesPerMonth: 30, aiChats: 100, nutritionLogs: -1 },
  PASS_VOYAGEUR:  { routesPerMonth: -1, aiChats: -1,  nutritionLogs: -1 },
} as const;
