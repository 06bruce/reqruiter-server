import { Router } from "express";
import { CandidatesController } from "./candidates.controller";
import { validate } from "../../middleware/validate";
import {
  createCandidateSchema,
  updateCandidateStatusSchema,
  candidateQuerySchema,
  candidateIdParamSchema,
} from "./candidates.schema";
import { deleteLimiter, publicLimiter, standardLimiter, updateLimiter } from "../../middleware/rateLimiter";
import { authenticate } from "../../middleware/auth";
import { cvUpload } from "../../middleware/upload";

const router = Router();

// Public route - apply for position
router.post(
  "/apply",
  publicLimiter,
  cvUpload,
  validate({ body: createCandidateSchema }),
  CandidatesController.apply
);

// Protected routes
router.get(
  "/",
  authenticate,
  standardLimiter,
  validate({ query: candidateQuerySchema }),
  CandidatesController.get
);

router.get(
  "/:id",
  authenticate,
  standardLimiter,
  validate({ params: candidateIdParamSchema }),
  CandidatesController.getById
);

router.patch(
  "/:id/status",
  authenticate,
  updateLimiter,
  validate({ params: candidateIdParamSchema, body: updateCandidateStatusSchema }),
  CandidatesController.updateStatus
);

router.delete(
  "/:id",
  authenticate,
  deleteLimiter,
  validate({ params: candidateIdParamSchema }),
  CandidatesController.delete
);

export default router;
