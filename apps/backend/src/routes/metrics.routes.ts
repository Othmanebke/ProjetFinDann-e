import { Router, Request, Response } from "express";
import { register } from "../clients/prometheus.client";

const router = Router();

// Prometheus metrics endpoint — no auth (scraping)
router.get("/", async (_req: Request, res: Response) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

export default router;
