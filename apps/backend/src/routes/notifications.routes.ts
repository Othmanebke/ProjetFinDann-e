import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

router.use(authenticate);

// List notifications
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

// Mark as read
router.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user!.sub },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Mark all as read
router.patch("/read-all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.sub, isRead: false },
      data: { isRead: true },
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
