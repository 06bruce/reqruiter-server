import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  employeeCount: z.number().min(0, "Employee count must be non-negative"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

export const updateDepartmentSchema = z.object({
  employeeCount: z.number().optional().refine((val) => val === undefined || val >= 0, {
    message: "Employee count must be non-negative",
  }),
  capacity: z.number().optional().refine((val) => val === undefined || val >= 1, {
    message: "Capacity must be at least 1",
  }),
  status: z.enum(["FULFILLED", "PENDING"]).optional(),
});

export const departmentIdParamSchema = z.object({
  id: objectIdSchema,
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
