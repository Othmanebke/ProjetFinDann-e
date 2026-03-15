import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../lib/prisma";
import { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ─── Generate Tokens ──────────────────────────────────────────────────────────
export function generateAccessToken(user: Pick<User, "id" | "email" | "role">): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
}

export function generateRefreshToken(): string {
  return uuidv4();
}

export async function createAuthTokens(
  user: Pick<User, "id" | "email" | "role">,
  ipAddress?: string,
  userAgent?: string
): Promise<AuthTokens> {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

// ─── Verify Access Token ──────────────────────────────────────────────────────
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// ─── Refresh Token ────────────────────────────────────────────────────────────
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!tokenRecord) throw new Error("Invalid refresh token");
  if (tokenRecord.revokedAt) throw new Error("Refresh token revoked");
  if (tokenRecord.expiresAt < new Date()) throw new Error("Refresh token expired");

  // Rotate refresh token (revoke old, create new)
  await prisma.refreshToken.update({
    where: { id: tokenRecord.id },
    data: { revokedAt: new Date() },
  });

  return createAuthTokens(tokenRecord.user);
}

// ─── Revoke Refresh Token ─────────────────────────────────────────────────────
export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revokedAt: new Date() },
  });
}

// ─── Revoke All User Tokens ───────────────────────────────────────────────────
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
