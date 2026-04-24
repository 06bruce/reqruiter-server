import { Candidate } from "../../models/Candidate.model";
import { Department } from "../../models/Department.model";
import { JobVacancy } from "../../models/JobVacancy.model";
import { ApiError } from "../../utils/ApiError";

export class DashboardService {
  static async getStats() {
    const totalCandidates = await Candidate.countDocuments();
    const pendingCandidates = await Candidate.countDocuments({ status: "PENDING" });
    const acceptedCandidates = await Candidate.countDocuments({ status: "ACCEPTED" });
    const rejectedCandidates = await Candidate.countDocuments({ status: "REJECTED" });

    const totalDepartments = await Department.countDocuments();
    const fulfilledDepartments = await Department.countDocuments({ status: "FULFILLED" });

    const totalVacancies = await JobVacancy.countDocuments();

    return {
      candidates: {
        total: totalCandidates,
        pending: pendingCandidates,
        accepted: acceptedCandidates,
        rejected: rejectedCandidates,
      },
      departments: {
        total: totalDepartments,
        fulfilled: fulfilledDepartments,
      },
      vacancies: {
        total: totalVacancies,
      },
    };
  }

  static async getTopCandidates(limit: number = 5) {
    const candidates = await Candidate.find()
      .sort({ matchScore: -1 })
      .limit(limit)
      .lean();

    return candidates;
  }

  static async getChartData() {
    // Bar chart: Candidates by status
    const candidatesByStatus = await Candidate.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Pie chart: Department fulfillment
    const departmentFulfillment = await Department.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    return {
      candidatesByStatus,
      departmentFulfillment,
    };
  }
}
