import { Router } from "express";
import { DepartmentsController } from "./departments.controller";
import { validate } from "../../middleware/validate";
import { createDepartmentSchema, departmentIdParamSchema, updateDepartmentSchema } from "./departments.schema";
import { authenticate } from "../../middleware/auth";
import { deleteLimiter, standardLimiter, updateLimiter, writeLimiter } from "../../middleware/rateLimiter";

const router = Router();

// All department routes are protected
router.use(authenticate);

router.get(
  "/",
  standardLimiter,
  DepartmentsController.get
);

router.post(
  "/",
  writeLimiter,
  validate({ body: createDepartmentSchema }),
  DepartmentsController.create
);

router.get(
  "/:id",
  standardLimiter,
  validate({ params: departmentIdParamSchema }),
  DepartmentsController.getById
);

router.patch(
  "/:id",
  updateLimiter,
  validate({ params: departmentIdParamSchema, body: updateDepartmentSchema }),
  DepartmentsController.update
);

router.delete(
  "/:id",
  deleteLimiter,
  validate({ params: departmentIdParamSchema }),
  DepartmentsController.delete
);

export default router;
