import { Request, Response, NextFunction } from "express";
import { DashboardService } from "./dashboard.service";

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DashboardService.getStats();
      res.status(200).json({
        success: true,
        message: "Stats retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTopCandidates(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
      const result = await DashboardService.getTopCandidates(limit);
      res.status(200).json({
        success: true,
        message: "Top candidates retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DashboardService.getChartData();
      res.status(200).json({
        success: true,
        message: "Chart data retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
