import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from "prom-client";

export const register = new Registry();
register.setDefaultLabels({ app: "smartproject-ai" });
collectDefaultMetrics({ register });

// ─── AI Metrics ───────────────────────────────────────────────────────────────
export const aiRequestsTotal = new Counter({
  name: "smartproject_ai_requests_total",
  help: "Total number of AI requests",
  labelNames: ["type", "model", "status"],
  registers: [register],
});

export const aiRequestDuration = new Histogram({
  name: "smartproject_ai_request_duration_seconds",
  help: "AI request duration in seconds",
  labelNames: ["type"],
  buckets: [0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

// ─── HTTP Metrics ─────────────────────────────────────────────────────────────
export const httpRequestsTotal = new Counter({
  name: "smartproject_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: "smartproject_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

// ─── Business Metrics ─────────────────────────────────────────────────────────
export const activeUsersGauge = new Gauge({
  name: "smartproject_active_users",
  help: "Number of active users",
  registers: [register],
});

export const projectsTotal = new Counter({
  name: "smartproject_projects_total",
  help: "Total projects created",
  registers: [register],
});

export const tasksTotal = new Counter({
  name: "smartproject_tasks_total",
  help: "Total tasks created",
  labelNames: ["status", "priority"],
  registers: [register],
});

export const backendErrorsTotal = new Counter({
  name: "smartproject_errors_total",
  help: "Total backend errors",
  labelNames: ["type", "route"],
  registers: [register],
});

export const subscriptionsGauge = new Gauge({
  name: "smartproject_subscriptions",
  help: "Number of subscriptions by plan",
  labelNames: ["plan"],
  registers: [register],
});
