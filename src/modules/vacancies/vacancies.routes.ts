import { Router } from "express";
import { VacanciesController } from "./vacancies.controller";
import { validate } from "../../middleware/validate";
import { createVacancySchema, updateVacancySchema, vacancyIdParamSchema } from "./vacancies.schema";
import { authenticate } from "../../middleware/auth";
import { deleteLimiter, standardLimiter, updateLimiter, writeLimiter } from "../../middleware/rateLimiter";

const router = Router();

// All vacancy routes are protected
router.use(authenticate);

router.get(
  "/",
  standardLimiter,
  VacanciesController.get
);

router.post(
  "/",
  writeLimiter,
  validate({ body: createVacancySchema }),
  VacanciesController.create
);

router.get(
  "/:id",
  standardLimiter,
  validate({ params: vacancyIdParamSchema }),
  VacanciesController.getById
);

router.patch(
  "/:id",
  updateLimiter,
  validate({ params: vacancyIdParamSchema, body: updateVacancySchema }),
  VacanciesController.update
);

router.delete(
  "/:id",
  deleteLimiter,
  validate({ params: vacancyIdParamSchema }),
  VacanciesController.delete
);

export default router;
