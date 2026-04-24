import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, "Invalid ID format");

export const createCandidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\d{10,}$/, "Phone must be at least 10 digits"),
  positionApplied: z.string().min(2, "Position is required"),
  department: z.string().optional(),
});

export const updateCandidateStatusSchema = z.object({
  status: z.enum(
    ["PENDING", "PENDING_INTERVIEW", "ACCEPTED", "REJECTED"],
    { errorMap: () => ({ message: "Invalid status" }) }
  ),
});

export const candidateIdParamSchema = z.object({
  id: objectIdSchema,
});

export const analyzeCandidateParamSchema = z.object({
  candidateId: objectIdSchema,
});

export const candidateQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "PENDING_INTERVIEW", "ACCEPTED", "REJECTED"]).optional(),
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;
export type UpdateCandidateStatusInput = z.infer<typeof updateCandidateStatusSchema>;
export type CandidateQueryInput = z.infer<typeof candidateQuerySchema>;
