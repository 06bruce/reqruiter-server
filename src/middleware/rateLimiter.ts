/**
 * Rate limiter presets.
 *
 * Presets:
 *  - strictAuthLimiter  : 5 req / 15 min / IP  — login & signup (brute-force protection)
 *  - publicLimiter      : 10 req / 1 hr  / IP  — candidate apply
 *  - refreshLimiter     : 10 req / 15 min / IP — token refresh
 *  - standardLimiter    : 100 req / 15 min / user — general authenticated endpoints
 *  - writeLimiter       : 30–60 req / 15 min / user — mutating endpoints
 *  - deleteLimiter      : 20 req / 15 min / user — delete endpoints
 *  - aiLimiter          : 20 req / 1 hr  / user — Gemini calls (expensive)
 */
import rateLimit, { Options } from 'express-rate-limit';
import { Request } from 'express';

const userKeyGenerator = (req: Request): string =>
  req.user ? `user_${req.user.id}` : req.ip ?? 'unknown';

const makeOptions = (partial: Partial<Options>): Partial<Options> => ({
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  ...partial,
});

export const strictAuthLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 5 }),
);

export const refreshLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 10 }),
);

export const publicLimiter = rateLimit(
  makeOptions({ windowMs: 60 * 60 * 1000, limit: 10 }),
);

export const standardLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 100, keyGenerator: userKeyGenerator }),
);

export const writeLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 30, keyGenerator: userKeyGenerator }),
);

export const updateLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 60, keyGenerator: userKeyGenerator }),
);

export const deleteLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 20, keyGenerator: userKeyGenerator }),
);

export const aiLimiter = rateLimit(
  makeOptions({ windowMs: 60 * 60 * 1000, limit: 20, keyGenerator: userKeyGenerator }),
);

export const logoutLimiter = rateLimit(
  makeOptions({ windowMs: 15 * 60 * 1000, limit: 30, keyGenerator: userKeyGenerator }),
);
