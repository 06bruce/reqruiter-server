import { Request, Response, NextFunction } from "express";
import { AiService } from "./ai.service";

export class AiController {
  static async analyzeCandidateHandler(req: Request, res: Response, next: NextFunction) {
    try {
      const { candidateId } = req.params;
      const result = await AiService.analyzeCandidate(candidateId);
      res.status(200).json({
        success: true,
        message: "Candidate analysis completed",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
