import { Candidate } from "../../models/Candidate.model";
import { ApiError } from "../../utils/ApiError";
import { CreateCandidateInput, UpdateCandidateStatusInput } from "./candidates.schema";
import { AiService } from "../ai/ai.service";
import { EmailService } from "../../services/email.service";

export class CandidatesService {
  static async apply(input: CreateCandidateInput, file?: Express.Multer.File) {
    const existingCandidate = await Candidate.findOne({ email: input.email });
    if (existingCandidate) {
      throw new ApiError(409, "Candidate with this email already exists");
    }

    const candidateData = {
      name: input.name,
      email: input.email,
      phone: input.phone,
      positionApplied: input.positionApplied,
      department: input.department || undefined,
      cvFileName: file?.originalname || "",
      cvFilePath: file?.path || "",
      status: "PENDING" as const,
    };

    const candidate = await Candidate.create(candidateData);

    // Await the email send so we can report success/failure to the frontend
    let emailSent = false;
    try {
      await EmailService.sendCandidateApplicationConfirmation({
        to: candidate.email,
        candidateName: candidate.name,
        positionApplied: candidate.positionApplied,
      });
      emailSent = true;
    } catch (error) {
      console.error("Application confirmation email failed for candidate:", candidate.id, error);
    }

    // AI analysis can remain fire-and-forget
    void AiService.analyzeCandidate(candidate.id).catch((error) => {
      console.error("Async AI analysis failed for candidate:", candidate.id, error);
    });

    return { candidate, emailSent };
  }

  static async getCandidates(query: any) {
    const { search, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { positionApplied: { $regex: search, $options: "i" } },
      ];
    }

    const candidates = await Candidate.find(filters).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Candidate.countDocuments(filters);

    return {
      candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getCandidateById(id: string) {
    const candidate = await Candidate.findById(id);
    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }
    return candidate;
  }

  static async updateCandidateStatus(id: string, input: UpdateCandidateStatusInput) {
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { status: input.status },
      { new: true }
    );

    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    return candidate;
  }

  static async deleteCandidates(id: string) {
    const candidate = await Candidate.findByIdAndDelete(id);
    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }
    return candidate;
  }
}
