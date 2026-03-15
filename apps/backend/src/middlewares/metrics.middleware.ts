import { Request, Response, NextFunction } from "express";
import { httpRequestsTotal, httpRequestDuration } from "../clients/prometheus.client";

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path || "unknown";

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });

    httpRequestDuration.observe({ method: req.method, route }, duration);
  });

  next();
}
