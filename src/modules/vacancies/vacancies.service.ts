import { JobVacancy } from "../../models/JobVacancy.model";
import { Department } from "../../models/Department.model";
import { ApiError } from "../../utils/ApiError";
import { CreateVacancyInput, UpdateVacancyInput } from "./vacancies.schema";

export class VacanciesService {
  static async createVacancy(input: CreateVacancyInput) {
    // Validate department exists
    const department = await Department.findById(input.departmentId);
    if (!department) {
      throw new ApiError(404, "Department not found");
    }

    const vacancy = await JobVacancy.create({
      title: input.title,
      company: input.company,
      salaryMin: input.salaryMin,
      salaryMax: input.salaryMax,
      departmentId: input.departmentId,
      experience: input.experience,
      imageUrl: input.imageUrl,
      applicantCount: 0,
    });

    return vacancy;
  }

  static async getVacancies() {
    const vacancies = await JobVacancy.find()
      .populate("departmentId", "name status capacity employeeCount")
      .sort({ createdAt: -1 });
    return vacancies;
  }

  static async getVacancyById(id: string) {
    const vacancy = await JobVacancy.findById(id).populate(
      "departmentId",
      "name status capacity employeeCount"
    );
    if (!vacancy) {
      throw new ApiError(404, "Vacancy not found");
    }
    return vacancy;
  }

  static async updateVacancy(id: string, input: UpdateVacancyInput) {
    // If departmentId is being updated, validate it exists
    if (input.departmentId) {
      const department = await Department.findById(input.departmentId);
      if (!department) {
        throw new ApiError(404, "Department not found");
      }
    }

    const vacancy = await JobVacancy.findByIdAndUpdate(id, input, { new: true }).populate(
      "departmentId",
      "name status capacity employeeCount"
    );

    if (!vacancy) {
      throw new ApiError(404, "Vacancy not found");
    }

    return vacancy;
  }

  static async deleteVacancy(id: string) {
    const vacancy = await JobVacancy.findByIdAndDelete(id);
    if (!vacancy) {
      throw new ApiError(404, "Vacancy not found");
    }
    return vacancy;
  }

  static async incrementApplicantCount(vacancyId: string) {
    const vacancy = await JobVacancy.findByIdAndUpdate(
      vacancyId,
      { $inc: { applicantCount: 1 } },
      { new: true }
    );
    return vacancy;
  }
}
