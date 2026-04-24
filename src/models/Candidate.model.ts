import { Schema, model, Document } from 'mongoose';

export type CandidateStatus = 'PENDING' | 'PENDING_INTERVIEW' | 'ACCEPTED' | 'REJECTED';

export interface ICandidate extends Document {
  name: string;
  email: string;
  phone: string;
  positionApplied: string;
  department?: string;
  cvFileName: string;
  cvFilePath: string;
  status: CandidateStatus;
  matchScore?: number;
  strengths: string[];
  weaknesses: string[];
  aiSummary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<ICandidate>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    positionApplied: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    cvFileName: { type: String, required: true },
    cvFilePath: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'PENDING_INTERVIEW', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
    },
    matchScore: { type: Number, min: 0, max: 100 },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    aiSummary: { type: String },
  },
  { timestamps: true },
);

candidateSchema.index({ status: 1 });
candidateSchema.index({ positionApplied: 1 });
candidateSchema.index({ matchScore: -1 });
candidateSchema.index({ name: 'text', email: 'text', positionApplied: 'text' });

export const Candidate = model<ICandidate>('Candidate', candidateSchema);
