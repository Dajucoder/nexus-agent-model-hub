import rateLimit from "express-rate-limit";
import { config } from "../../config";

export const rateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

export const agentRateLimiter = rateLimit({
  windowMs: config.agentRateLimitWindowMs,
  max: config.agentRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});
