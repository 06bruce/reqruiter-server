import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authenticate } from "../../middleware/auth";
import { standardLimiter } from "../../middleware/rateLimiter";

const router = Router();

// All dashboard routes are protected
router.use(authenticate);

router.get(
  "/stats",
  standardLimiter,
  DashboardController.getStats
);

router.get(
  "/top-candidates",
  standardLimiter,
  DashboardController.getTopCandidates
);

router.get(
  "/chart-data",
  standardLimiter,
  DashboardController.getChartData
);

export default router;
