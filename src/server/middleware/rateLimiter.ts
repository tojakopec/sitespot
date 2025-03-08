import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  // change this when done debugging etc.
  max: 9,
  message: {
    error: "Too many login attempts! Please try again after 10 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
