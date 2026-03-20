import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { prisma } from "../lib/prisma";
import { sendRunReminderSMS, createInAppNotification } from "../services/notification.service";

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

// Send SMS run reminder
router.post("/sms-reminder", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!user?.phone) {
      res.status(400).json({ error: "No phone number on your account. Add one in your profile." });
      return;
    }
    await sendRunReminderSMS(
      user.phone,
      user.name ?? "Sportif",
      req.body.city ?? user.currentCity ?? "votre ville",
      req.body.time ?? "18h30"
    );
    await createInAppNotification(
      user.id,
      "sms_reminder",
      "SMS envoyé",
      `Rappel run SMS envoyé au ${user.phone}`
    );
    res.json({ ok: true, message: `SMS sent to ${user.phone}` });
  } catch (err) { next(err); }
});

// Create in-app notification (admin/test)
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      res.status(400).json({ error: "title and message are required" });
      return;
    }
    const notif = await createInAppNotification(req.user!.sub, "manual", title, message);
    res.status(201).json(notif);
  } catch (err) { next(err); }
});

export default router;
