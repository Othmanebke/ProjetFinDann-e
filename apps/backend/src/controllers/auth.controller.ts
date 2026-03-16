import { Request, Response, NextFunction } from "express";
import passport from "passport";
import {
  createAuthTokens,
  refreshAccessToken,
  revokeRefreshToken,
} from "../services/auth.service";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error.middleware";

// ─── OAuth Initiate ───────────────────────────────────────────────────────────
export const demoLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const email = "demo@fittravel.app";
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: "Charles Démo",
          emailVerified: true,
          role: "USER",
          oauthProvider: "LOCAL",
          subscription: { create: { plan: "PASS_VOYAGEUR" } }, // Give user PREMIUM to test routes
        },
      });
    }

    const tokens = await createAuthTokens(
      user,
      req.ip || undefined,
      req.headers["user-agent"] || undefined
    );

    const params = new URLSearchParams({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  session: false,
});

export const githubLogin = passport.authenticate("github", {
  scope: ["user:email"],
  session: false,
});

export const microsoftLogin = passport.authenticate("microsoft", {
  scope: ["user.read"],
  prompt: "select_account",
  session: false,
});

// ─── OAuth Callbacks ──────────────────────────────────────────────────────────
export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate("google", { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    try {
      const tokens = await createAuthTokens(
        user,
        req.ip || undefined,
        req.headers["user-agent"] || undefined
      );
      const params = new URLSearchParams({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
}

export async function githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate("github", { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    try {
      const tokens = await createAuthTokens(
        user,
        req.ip || undefined,
        req.headers["user-agent"] || undefined
      );
      const params = new URLSearchParams({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
}

export async function microsoftCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  passport.authenticate("microsoft", { session: false }, async (err: any, user: any) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
    try {
      const tokens = await createAuthTokens(
        user,
        req.ip || undefined,
        req.headers["user-agent"] || undefined
      );
      const params = new URLSearchParams({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params}`);
    } catch (error) {
      next(error);
    }
  })(req, res, next);
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError(400, "Refresh token required");

    const tokens = await refreshAccessToken(refreshToken);
    res.json(tokens);
  } catch (err: any) {
    if (err.message?.includes("token")) {
      next(new AppError(401, err.message));
    } else {
      next(err);
    }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
}

// ─── Get Current User ─────────────────────────────────────────────────────────
export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        phone: true,
        timezone: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        subscription: {
          select: { plan: true, status: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) throw new AppError(404, "User not found");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, phone, timezone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.sub },
      data: { name, phone, timezone },
      select: { id: true, email: true, name: true, phone: true, timezone: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
