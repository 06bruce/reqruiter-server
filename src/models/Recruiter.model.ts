import { Schema, model, Document } from 'mongoose';

export type RecruiterRole = 'MANAGING_DIRECTOR' | 'HR_MANAGER';

export interface IRecruiter extends Document {
  name: string;
  email: string;
  password: string;
  role: RecruiterRole;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterSchema = new Schema<IRecruiter>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['MANAGING_DIRECTOR', 'HR_MANAGER'],
      default: 'HR_MANAGER',
    },
  },
  { timestamps: true },
);

// Never expose the hashed password in JSON responses
recruiterSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    return ret;
  },
});

export const Recruiter = model<IRecruiter>('Recruiter', recruiterSchema);
