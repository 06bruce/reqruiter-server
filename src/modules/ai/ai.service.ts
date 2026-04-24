import { GoogleGenerativeAI } from "@google/generative-ai";
import { Candidate } from "../../models/Candidate.model";
import { ApiError } from "../../utils/ApiError";
import { env } from "../../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  weaknesses: string[];
  aiSummary: string;
}

export class AiService {
  static async analyzeCandidate(candidateId: string): Promise<AnalysisResult> {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      throw new ApiError(404, "Candidate not found");
    }

    const prompt = `Analyze the following candidate profile and provide a structured JSON response with match score (0-100), strengths, weaknesses, and a brief summary.

Candidate Name: ${candidate.name}
Position Applied: ${candidate.positionApplied}
Email: ${candidate.email}
Phone: ${candidate.phone}
Department: ${candidate.department || "Not specified"}
CV File: ${candidate.cvFileName}

Respond with ONLY a valid JSON object in this format, no markdown or extra text:
{
  "matchScore": <number 0-100>,
  "strengths": [<string>, ...],
  "weaknesses": [<string>, ...],
  "aiSummary": "<string>"
}`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format from Gemini");
      }

      const analysis = JSON.parse(jsonMatch[0]) as AnalysisResult;

      // Validate response structure
      if (
        typeof analysis.matchScore !== "number" ||
        !Array.isArray(analysis.strengths) ||
        !Array.isArray(analysis.weaknesses) ||
        typeof analysis.aiSummary !== "string"
      ) {
        throw new Error("Invalid analysis structure");
      }

      // Update candidate with analysis
      candidate.matchScore = Math.min(100, Math.max(0, analysis.matchScore));
      candidate.strengths = analysis.strengths;
      candidate.weaknesses = analysis.weaknesses;
      candidate.aiSummary = analysis.aiSummary;
      await candidate.save();

      return analysis;
    } catch (error) {
      throw new ApiError(500, "Failed to analyze candidate with AI");
    }
  }
}
