import { Schema, model, Document, Types } from 'mongoose';

export interface IJobVacancy extends Document {
  title: string;
  company: string;
  salaryMin: number;
  salaryMax: number;
  departmentId: Types.ObjectId;
  experience: string;
  applicantCount: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobVacancySchema = new Schema<IJobVacancy>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    salaryMin: { type: Number, required: true, min: 0 },
    salaryMax: { type: Number, required: true, min: 0 },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    experience: { type: String, required: true, trim: true },
    applicantCount: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String },
  },
  { timestamps: true },
);

jobVacancySchema.index({ departmentId: 1 });

export const JobVacancy = model<IJobVacancy>('JobVacancy', jobVacancySchema);
