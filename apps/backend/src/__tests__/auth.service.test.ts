import { generateAccessToken, verifyAccessToken, generateRefreshToken } from "../services/auth.service";

// Mock prisma
jest.mock("../lib/prisma", () => ({
  prisma: {
    refreshToken: {
      create: jest.fn().mockResolvedValue({ id: "rt-1", token: "token-uuid" }),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      update: jest.fn().mockResolvedValue({ id: "user-1" }),
    },
  },
}));

describe("AuthService", () => {
  const mockUser = { id: "user-123", email: "test@test.com", role: "USER" as any };

  beforeEach(() => {
    process.env.JWT_SECRET = "test_secret_min_32_chars_padding!!!";
    process.env.JWT_REFRESH_SECRET = "test_refresh_secret_min_32_chars_!!";
    process.env.JWT_EXPIRES_IN = "15m";
  });

  describe("generateAccessToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateAccessToken(mockUser);
      expect(token).toBeTruthy();
      expect(token.split(".")).toHaveLength(3); // JWT format
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify and decode a valid token", () => {
      const token = generateAccessToken(mockUser);
      const payload = verifyAccessToken(token);

      expect(payload.sub).toBe(mockUser.id);
      expect(payload.email).toBe(mockUser.email);
      expect(payload.role).toBe(mockUser.role);
    });

    it("should throw on invalid token", () => {
      expect(() => verifyAccessToken("invalid.token.here")).toThrow();
    });

    it("should throw on expired token", () => {
      // Create token with past expiration
      const jwt = require("jsonwebtoken");
      const expiredToken = jwt.sign(
        { sub: "user-1", email: "test@test.com", role: "USER" },
        process.env.JWT_SECRET,
        { expiresIn: "-1s" }
      );
      expect(() => verifyAccessToken(expiredToken)).toThrow("jwt expired");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a unique UUID refresh token", () => {
      const token1 = generateRefreshToken();
      const token2 = generateRefreshToken();

      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2);
      // UUID format
      expect(token1).toMatch(/^[0-9a-f-]{36}$/);
    });
  });
});
