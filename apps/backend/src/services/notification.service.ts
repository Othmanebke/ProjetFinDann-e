import sgMail from '@sendgrid/mail';
import twilio from '../clients/twilio.client';
import prisma from '../lib/prisma';
import logger from '../lib/logger';

// ─── Email: Welcome ────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: '🏃 Bienvenue sur Fit & Travel — Ton aventure commence !',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#030712;color:#f8fafc;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:40px;text-align:center;">
            <h1 style="margin:0;font-size:28px;font-weight:900;">🌍 Fit & Travel</h1>
            <p style="margin:8px 0 0;opacity:0.9;">Coaching sportif intelligent pour voyageurs</p>
          </div>
          <div style="padding:40px;">
            <h2 style="color:#a78bfa;">Salut ${name} ! 👋</h2>
            <p style="color:#94a3b8;line-height:1.7;">Bienvenue dans la communauté Fit & Travel. Tu peux maintenant :</p>
            <ul style="color:#94a3b8;line-height:2;">
              <li>🗺️ Générer des parcours de sport sécurisés dans n'importe quelle ville</li>
              <li>🍽️ Obtenir des recommandations de plats locaux adaptés à tes objectifs</li>
              <li>📊 Suivre tes performances semaine après semaine</li>
              <li>🤖 Consulter ton coach IA 24/7</li>
            </ul>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">
              🚀 Démarrer mon premier run
            </a>
          </div>
        </div>`,
    });
  } catch (err) {
    logger.error('sendWelcomeEmail failed', err);
  }
}

// ─── Email: Weekly performance recap ──────────────────────────────────────

export async function sendWeeklyRecapEmail(
  email: string,
  name: string,
  stats: { distanceKm: number; durationMin: number; calories: number; sessions: number; bestWorkout?: string }
): Promise<void> {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: `📊 Ton bilan fitness de la semaine — ${stats.distanceKm.toFixed(1)}km parcourus !`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#030712;color:#f8fafc;border-radius:16px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;">
            <h1 style="margin:0;font-size:22px;">📊 Bilan de la semaine</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#a78bfa;">Bravo ${name} ! 💪</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0;">
              <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.2);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:#a78bfa;">${stats.distanceKm.toFixed(1)}</div>
                <div style="color:#64748b;font-size:13px;">km parcourus</div>
              </div>
              <div style="background:rgba(6,182,212,0.1);border:1px solid rgba(6,182,212,0.2);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:#22d3ee;">${stats.sessions}</div>
                <div style="color:#64748b;font-size:13px;">séances réalisées</div>
              </div>
              <div style="background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.2);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:#fb7185;">${stats.calories}</div>
                <div style="color:#64748b;font-size:13px;">calories brûlées</div>
              </div>
              <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:20px;text-align:center;">
                <div style="font-size:28px;font-weight:800;color:#34d399;">${Math.floor(stats.durationMin / 60)}h${(stats.durationMin % 60).toString().padStart(2,'0')}</div>
                <div style="color:#64748b;font-size:13px;">en mouvement</div>
              </div>
            </div>
            <a href="${process.env.FRONTEND_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;">
              Voir mon tableau de bord →
            </a>
          </div>
        </div>`,
    });
  } catch (err) {
    logger.error('sendWeeklyRecapEmail failed', err);
  }
}

// ─── Email: Billing ────────────────────────────────────────────────────────

export async function sendBillingEmail(
  email: string,
  name: string,
  event: 'upgrade' | 'downgrade' | 'renewal' | 'payment_failed',
  plan?: string
): Promise<void> {
  const subjects: Record<string, string> = {
    upgrade: `🎉 Bienvenue sur ${plan} — Fit & Travel`,
    downgrade: `Modification de ton abonnement Fit & Travel`,
    renewal: `✅ Abonnement ${plan} renouvelé`,
    payment_failed: `⚠️ Problème de paiement — Action requise`,
  };
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject: subjects[event] ?? 'Mise à jour de ton abonnement',
      html: `<p>Bonjour ${name},</p><p>${subjects[event]}</p><a href="${process.env.FRONTEND_URL}/billing">Gérer mon abonnement</a>`,
    });
  } catch (err) {
    logger.error('sendBillingEmail failed', err);
  }
}

// ─── SMS: Daily run reminder ───────────────────────────────────────────────

export async function sendRunReminderSMS(phone: string, name: string, city: string): Promise<void> {
  try {
    await twilio.messages.create({
      to: phone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: `🏃 Fit & Travel : Salut ${name} ! Prêt pour ton run à ${city} ce matin ? Ton coach IA t'a préparé un nouveau parcours 🗺️`,
    });
  } catch (err) {
    logger.error('sendRunReminderSMS failed', err);
  }
}

// ─── In-app notification ───────────────────────────────────────────────────

export async function createInAppNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await prisma.notification.create({ data: { userId, type, title, body, metadata } });
}

// ─── Cron: Send weekly recaps every Monday ─────────────────────────────────

export async function sendWeeklyRecaps(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { isActive: true, emailVerified: true },
    include: { subscription: true },
  });

  const currentWeek = getISOWeek(new Date());
  const currentYear = new Date().getFullYear();
  const prevWeek = currentWeek - 1;

  for (const user of users) {
    try {
      const workouts = await prisma.workout.findMany({
        where: { userId: user.id, weekNumber: prevWeek, yearNumber: currentYear },
      });
      if (!workouts.length) continue;

      const stats = {
        distanceKm: workouts.reduce((s, w) => s + w.distanceKm, 0),
        durationMin: workouts.reduce((s, w) => s + w.durationMin, 0),
        calories: workouts.reduce((s, w) => s + w.calories, 0),
        sessions: workouts.length,
      };

      await sendWeeklyRecapEmail(user.email, user.name ?? 'Sportif', stats);
    } catch (err) {
      logger.error(`Weekly recap failed for ${user.email}`, err);
    }
  }
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
