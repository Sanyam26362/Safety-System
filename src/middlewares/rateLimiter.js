import rateLimit from "express-rate-limit";

export const reportLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    message: "Too many incident reports. Please wait a minute."
  }
});

export const voteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    message: "Too many actions. Slow down."
  }
});
