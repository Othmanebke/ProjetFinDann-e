import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import passport from "passport";

import { errorMiddleware } from "./middlewares/error.middleware";
import { logger } from "./lib/logger";
import { metricsMiddleware } from "./middlewares/metrics.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/projects.routes";
import taskRoutes from "./routes/tasks.routes";
import aiRoutes from "./routes/ai.routes";
import billingRoutes from "./routes/billing.routes";
import notificationRoutes from "./routes/notifications.routes";
import metricsRoutes from "./routes/metrics.routes";
import adminRoutes from "./routes/admin.routes";

// Passport config
import "./config/passport";

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security Middlewares ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── General Middlewares ───────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("combined", {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));
app.use(metricsMiddleware);
app.use(passport.initialize());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SmartProject AI Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/ai", aiRoutes);
app.use("/billing", billingRoutes);
app.use("/notifications", notificationRoutes);
app.use("/metrics", metricsRoutes);
app.use("/admin", adminRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 SmartProject AI Backend running on port ${PORT}`);
  logger.info(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
});

export default app;
