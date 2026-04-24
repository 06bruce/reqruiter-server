import { Request, Response, NextFunction } from "express";
import { VacanciesService } from "./vacancies.service";
import { CreateVacancyInput, UpdateVacancyInput } from "./vacancies.schema";

export class VacanciesController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateVacancyInput;
      const result = await VacanciesService.createVacancy(data);
      res.status(201).json({
        success: true,
        message: "Vacancy created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await VacanciesService.getVacancies();
      res.status(200).json({
        success: true,
        message: "Vacancies retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await VacanciesService.getVacancyById(id);
      res.status(200).json({
        success: true,
        message: "Vacancy retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateVacancyInput;
      const result = await VacanciesService.updateVacancy(id, data);
      res.status(200).json({
        success: true,
        message: "Vacancy updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await VacanciesService.deleteVacancy(id);
      res.status(200).json({
        success: true,
        message: "Vacancy deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
