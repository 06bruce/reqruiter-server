import { Schema, model, Document } from 'mongoose';

export type DepartmentStatus = 'FULFILLED' | 'PENDING';

export interface IDepartment extends Document {
  name: string;
  employeeCount: number;
  capacity: number;
  status: DepartmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    employeeCount: { type: Number, required: true, min: 0, default: 0 },
    capacity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ['FULFILLED', 'PENDING'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);

// Auto-compute status before every save
departmentSchema.pre('save', function (next) {
  this.status = this.employeeCount >= this.capacity ? 'FULFILLED' : 'PENDING';
  next();
});

export const Department = model<IDepartment>('Department', departmentSchema);
