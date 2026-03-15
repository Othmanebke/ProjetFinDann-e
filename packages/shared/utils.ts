// ─── SmartProject AI — Shared Utilities ──────────────────────────────────────

/**
 * Format a date to locale string (FR)
 */
export function formatDate(date: Date | string, locale = "fr-FR"): string {
  return new Date(date).toLocaleDateString(locale);
}

/**
 * Format relative time (e.g., "il y a 3 jours")
 */
export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "il y a quelques secondes";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `il y a ${Math.floor(seconds / 86400)} jours`;
  return formatDate(date);
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLen = 50): string {
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

/**
 * Generate a random hex color
 */
export function randomColor(): string {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

/**
 * Check if a task is overdue
 */
export function isOverdue(dueDate: Date | string | null | undefined): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Calculate project completion percentage
 */
export function completionRate(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

/**
 * Map subscription plan to feature limits
 */
export const PLAN_LIMITS = {
  FREE: { maxProjects: 3, maxTasksPerProject: 10, aiRequestsPerDay: 5, maxMembers: 1 },
  PRO: { maxProjects: Infinity, maxTasksPerProject: Infinity, aiRequestsPerDay: 200, maxMembers: 10 },
  ENTERPRISE: { maxProjects: Infinity, maxTasksPerProject: Infinity, aiRequestsPerDay: Infinity, maxMembers: Infinity },
} as const;
