import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

export const createVacancySchema = z.object({
  title: z.string().min(2, "Job title must be at least 2 characters"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  salaryMin: z.number().min(0, "Minimum salary must be non-negative"),
  salaryMax: z.number().min(0, "Maximum salary must be non-negative"),
  departmentId: z.string().min(1, "Department ID is required"),
  experience: z.string().min(1, "Experience requirement is required"),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updateVacancySchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  departmentId: z.string().optional(),
  experience: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const vacancyIdParamSchema = z.object({
  id: objectIdSchema,
});

export type CreateVacancyInput = z.infer<typeof createVacancySchema>;
export type UpdateVacancyInput = z.infer<typeof updateVacancySchema>;
