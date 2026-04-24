import { Router } from "express";
import { AiController } from "./ai.controller";
import { authenticate } from "../../middleware/auth";
import { aiLimiter } from "../../middleware/rateLimiter";
import { validate } from "../../middleware/validate";
import { analyzeCandidateParamSchema } from "../candidates/candidates.schema";

const router = Router();

// All AI routes are protected with strict rate limiting
router.post(
  "/analyze/:candidateId",
  authenticate,
  aiLimiter,
  validate({ params: analyzeCandidateParamSchema }),
  AiController.analyzeCandidateHandler
);

export default router;
