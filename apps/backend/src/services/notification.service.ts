import { sgMail, FROM_EMAIL, FROM_NAME } from "../clients/sendgrid.client";
import { twilioClient, TWILIO_PHONE } from "../clients/twilio.client";
import { prisma } from "../lib/prisma";
import { logger } from "../lib/logger";

// ─── Email Templates ──────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: "Bienvenue sur SmartProject AI ! 🚀",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #6366f1;">Bienvenue, ${name} !</h1>
          <p>Nous sommes ravis de vous accueillir sur <strong>SmartProject AI</strong>.</p>
          <p>Vous pouvez dès maintenant :</p>
          <ul>
            <li>Créer vos premiers projets</li>
            <li>Utiliser l'IA pour planifier et organiser</li>
            <li>Collaborer avec votre équipe</li>
          </ul>
          <a href="${process.env.FRONTEND_URL}/dashboard"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
            Accéder au Dashboard
          </a>
          <p style="color: #64748b; font-size: 14px; margin-top: 32px;">
            L'équipe SmartProject AI
          </p>
        </div>
      `,
    });
    logger.info(`Welcome email sent to ${to}`);
  } catch (err) {
    logger.error("Failed to send welcome email:", err);
  }
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void> {
  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation du mot de passe</h2>
          <p>Bonjour ${name},</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
          <a href="${resetUrl}"
             style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
            Réinitialiser le mot de passe
          </a>
          <p style="color: #64748b; font-size: 14px; margin-top: 16px;">
            Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    logger.error("Failed to send password reset email:", err);
  }
}

export async function sendBillingEmail(
  to: string,
  name: string,
  type: "upgrade" | "downgrade" | "renewal" | "failed",
  plan?: string
): Promise<void> {
  const subjects: Record<string, string> = {
    upgrade: `🎉 Votre abonnement ${plan} est actif !`,
    downgrade: "Modification de votre abonnement",
    renewal: "Votre abonnement a été renouvelé",
    failed: "⚠️ Problème avec votre paiement",
  };

  const bodies: Record<string, string> = {
    upgrade: `<p>Bravo ${name} ! Votre abonnement <strong>${plan}</strong> est maintenant actif. Profitez de toutes les fonctionnalités avancées.</p>`,
    downgrade: `<p>Votre abonnement a été modifié. Les changements prendront effet à la fin de la période actuelle.</p>`,
    renewal: `<p>Votre abonnement <strong>${plan}</strong> a été renouvelé avec succès.</p>`,
    failed: `<p>Nous n'avons pas pu traiter votre paiement. Veuillez mettre à jour vos informations de paiement.</p><a href="${process.env.FRONTEND_URL}/billing">Mettre à jour</a>`,
  };

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: subjects[type],
      html: `<div style="font-family: Inter, sans-serif; max-width: 600px;">${bodies[type]}</div>`,
    });
  } catch (err) {
    logger.error("Failed to send billing email:", err);
  }
}

// ─── SMS via Twilio ───────────────────────────────────────────────────────────
export async function sendSMSDeadlineReminder(
  phone: string,
  taskTitle: string,
  projectName: string,
  dueDate: Date
): Promise<void> {
  try {
    await twilioClient.messages.create({
      from: TWILIO_PHONE,
      to: phone,
      body: `⏰ SmartProject AI : La tâche "${taskTitle}" du projet "${projectName}" est due le ${dueDate.toLocaleDateString("fr-FR")}. Connectez-vous pour gérer.`,
    });
    logger.info(`SMS deadline reminder sent to ${phone}`);
  } catch (err) {
    logger.error("Failed to send SMS:", err);
  }
}

// ─── In-App Notifications ─────────────────────────────────────────────────────
export async function createInAppNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: object
): Promise<void> {
  await prisma.notification.create({
    data: { userId, type, title, body, metadata: metadata as any },
  });
}

// ─── Send Deadline Reminders (Cron-triggered) ────────────────────────────────
export async function sendDeadlineReminders(): Promise<void> {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueTasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: today, lte: tomorrow },
      status: { notIn: ["DONE", "CANCELLED"] },
    },
    include: {
      assignee: { select: { phone: true, email: true, name: true } },
      project: { select: { name: true } },
    },
  });

  for (const task of dueTasks) {
    if (!task.assignee) continue;

    // In-app notification
    await createInAppNotification(
      task.assigneeId!,
      "task.due",
      "Tâche bientôt due",
      `"${task.title}" est due demain dans le projet ${task.project.name}`,
      { taskId: task.id, projectId: task.projectId }
    );

    // SMS if phone available
    if (task.assignee.phone) {
      await sendSMSDeadlineReminder(
        task.assignee.phone,
        task.title,
        task.project.name,
        task.dueDate!
      );
    }
  }

  logger.info(`Sent deadline reminders for ${dueTasks.length} tasks`);
}
