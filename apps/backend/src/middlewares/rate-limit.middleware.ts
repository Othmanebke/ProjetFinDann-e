import rateLimit from "express-rate-limit";

export const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts, please try again later." },
});

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "AI rate limit exceeded. Please wait before making more requests." },
});
