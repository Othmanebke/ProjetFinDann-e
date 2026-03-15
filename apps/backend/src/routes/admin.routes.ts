import { Router, Request, Response, NextFunction } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

router.use(authenticate, requireAdmin);

// List all users
router.get("/users", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, name: true, role: true,
          oauthProvider: true, isActive: true, lastLoginAt: true, createdAt: true,
          subscription: { select: { plan: true, status: true } },
          _count: { select: { ownedProjects: true } },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({ data: users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
});

// Global stats
router.get("/stats", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [
      usersTotal, projectsTotal, tasksTotal,
      subscriptionsByPlan, recentActivity,
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.subscription.groupBy({ by: ["plan"], _count: { id: true } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true } } },
      }),
    ]);

    res.json({ usersTotal, projectsTotal, tasksTotal, subscriptionsByPlan, recentActivity });
  } catch (err) { next(err); }
});

// Toggle user active state
router.patch("/users/:id/toggle-active", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, isActive: true },
    });

    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
