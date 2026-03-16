import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { prisma } from "../lib/prisma";
import { OAuthProvider, Role } from "@prisma/client";

// ─── Google Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email from Google"), undefined);

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { oauthProviderId: profile.id, oauthProvider: OAuthProvider.GOOGLE },
            ],
          },
          include: { subscription: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || email,
              avatarUrl: profile.photos?.[0]?.value,
              oauthProvider: OAuthProvider.GOOGLE,
              oauthProviderId: profile.id,
              emailVerified: true,
              role: Role.USER,
              subscription: { create: {} },
            },
            include: { subscription: true },
          });
        } else if (!user.oauthProviderId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthProvider: OAuthProvider.GOOGLE,
              oauthProviderId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
              emailVerified: true,
            },
            include: { subscription: true },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// ─── GitHub Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.invalid`;

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { oauthProviderId: String(profile.id), oauthProvider: OAuthProvider.GITHUB },
            ],
          },
          include: { subscription: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || profile.username || email,
              avatarUrl: profile.photos?.[0]?.value,
              oauthProvider: OAuthProvider.GITHUB,
              oauthProviderId: String(profile.id),
              emailVerified: true,
              role: Role.USER,
              subscription: { create: {} },
            },
            include: { subscription: true },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// ─── Microsoft Strategy ───────────────────────────────────────────────────────
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      callbackURL: process.env.MICROSOFT_CALLBACK_URL || "",
      scope: ["user.read"],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : profile.userPrincipalName;
        if (!email) return done(new Error("No email from Microsoft"), undefined);

        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { oauthProviderId: profile.id, oauthProvider: OAuthProvider.MICROSOFT },
            ],
          },
          include: { subscription: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName || email,
              avatarUrl: null, // Microsoft photo API usually requires an extra fetch
              oauthProvider: OAuthProvider.MICROSOFT,
              oauthProviderId: profile.id,
              emailVerified: true,
              role: Role.USER,
              subscription: { create: {} },
            },
            include: { subscription: true },
          });
        } else if (!user.oauthProviderId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthProvider: OAuthProvider.MICROSOFT,
              oauthProviderId: profile.id,
            },
            include: { subscription: true },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
