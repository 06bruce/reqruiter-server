import { Request, Response, NextFunction } from "express";
import { DepartmentsService } from "./departments.service";
import { CreateDepartmentInput, UpdateDepartmentInput } from "./departments.schema";

export class DepartmentsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateDepartmentInput;
      const result = await DepartmentsService.createDepartment(data);
      res.status(201).json({
        success: true,
        message: "Department created successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await DepartmentsService.getDepartments();
      res.status(200).json({
        success: true,
        message: "Departments retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await DepartmentsService.getDepartmentById(id);
      res.status(200).json({
        success: true,
        message: "Department retrieved successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body as UpdateDepartmentInput;
      const result = await DepartmentsService.updateDepartment(id, data);
      res.status(200).json({
        success: true,
        message: "Department updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await DepartmentsService.deleteDepartment(id);
      res.status(200).json({
        success: true,
        message: "Department deleted successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
