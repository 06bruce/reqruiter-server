import { Department } from "../../models/Department.model";
import { ApiError } from "../../utils/ApiError";
import { CreateDepartmentInput, UpdateDepartmentInput } from "./departments.schema";

export class DepartmentsService {
  static async createDepartment(input: CreateDepartmentInput) {
    const existingDepartment = await Department.findOne({ name: input.name });
    if (existingDepartment) {
      throw new ApiError(409, "Department with this name already exists");
    }

    const status = input.employeeCount >= input.capacity ? "FULFILLED" : "PENDING";

    const department = await Department.create({
      name: input.name,
      employeeCount: input.employeeCount,
      capacity: input.capacity,
      status,
    });

    return department;
  }

  static async getDepartments() {
    const departments = await Department.find().sort({ createdAt: -1 });
    return departments;
  }

  static async getDepartmentById(id: string) {
    const department = await Department.findById(id);
    if (!department) {
      throw new ApiError(404, "Department not found");
    }
    return department;
  }

  static async updateDepartment(id: string, input: UpdateDepartmentInput) {
    const department = await Department.findByIdAndUpdate(id, input, { new: true });

    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    // Auto-update status based on employee count
    if (input.employeeCount !== undefined && input.capacity !== undefined) {
      department.status = input.employeeCount >= input.capacity ? "FULFILLED" : "PENDING";
      await department.save();
    }

    return department;
  }

  static async deleteDepartment(id: string) {
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      throw new ApiError(404, "Department not found");
    }
    return department;
  }
}
