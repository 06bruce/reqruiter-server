import { Request, Response, NextFunction } from "express";
import { CandidatesService } from "./candidates.service";
import { CreateCandidateInput, UpdateCandidateStatusInput } from "./candidates.schema";

export class CandidatesController {
  static async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateCandidateInput;
      const { candidate, emailSent } = await CandidatesService.apply(data, req.file);
      res.status(201).json({
        success: true,
        message: emailSent
          ? "Application submitted and confirmation email sent"
          : "Application submitted but confirmation email could not be sent",
        data: candidate,
        emailSent,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CandidatesService.getCandidates(req.query);
      res.status(200).json({
        success: true,
        message: "Candidates retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await CandidatesService.getCandidateById(id);
      res.status(200).json({
        success: true,
        message: "Candidate retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateCandidateStatusInput;
      const result = await CandidatesService.updateCandidateStatus(id, data);
      res.status(200).json({
        success: true,
        message: "Candidate status updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await CandidatesService.deleteCandidates(id);
      res.status(200).json({
        success: true,
        message: "Candidate deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
