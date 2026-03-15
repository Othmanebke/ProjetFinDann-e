// ─── SmartProject AI — Shared TypeScript Types ───────────────────────────────

export type Role = "ADMIN" | "USER";
export type OAuthProvider = "GOOGLE" | "GITHUB" | "LOCAL";
export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SubscriptionPlan = "FREE" | "PRO" | "ENTERPRISE";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELLED" | "TRIALING" | "INCOMPLETE";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  oauthProvider: OAuthProvider;
  phone?: string;
  timezone: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  subscription?: Subscription;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  color: string;
  ownerId: string;
  owner?: Pick<User, "id" | "name" | "avatarUrl">;
  members?: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number; members: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: Pick<User, "id" | "name" | "avatarUrl" | "email">;
  role: string;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  startDate?: Date;
  estimatedHours?: number;
  loggedHours?: number;
  tags: string[];
  projectId: string;
  project?: Pick<Project, "id" | "name" | "color">;
  assigneeId?: string;
  assignee?: Pick<User, "id" | "name" | "avatarUrl">;
  creatorId: string;
  creator?: Pick<User, "id" | "name">;
  subTasks?: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  metadata?: Record<string, any>;
  userId: string;
  user?: Pick<User, "id" | "name" | "avatarUrl">;
  projectId?: string;
  taskId?: string;
  createdAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd: boolean;
  trialEnd?: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AIChat {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  messages?: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// ─── AI Response Types ────────────────────────────────────────────────────────
export interface AIProjectPlan {
  phases: { name: string; duration: string; tasks: string[] }[];
  milestones: { name: string; date?: string }[];
  risks: string[];
  recommendations: string[];
  estimatedDuration: string;
}

export interface AIRiskAnalysis {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risks: {
    title: string;
    severity: string;
    probability: string;
    mitigation: string;
  }[];
  overallAssessment: string;
}

export interface AIGeneratedTasks {
  tasks: {
    title: string;
    description: string;
    priority: TaskPriority;
    estimatedHours: number;
    tags: string[];
  }[];
}
