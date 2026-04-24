import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { signupSchema, loginSchema, refreshTokenSchema } from "./auth.schema";
import { strictAuthLimiter, refreshLimiter, logoutLimiter } from "../../middleware/rateLimiter";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Public routes
router.post(
  "/signup",
  strictAuthLimiter,
  validate({ body: signupSchema }),
  AuthController.signup
);

router.post(
  "/login",
  strictAuthLimiter,
  validate({ body: loginSchema }),
  AuthController.login
);

router.post(
  "/refresh",
  refreshLimiter,
  validate({ body: refreshTokenSchema }),
  AuthController.refresh
);

// Protected routes
router.post(
  "/logout",
  authenticate,
  logoutLimiter,
  validate({ body: refreshTokenSchema }),
  AuthController.logout
);

export default router;
