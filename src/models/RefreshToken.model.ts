import { Schema, model, Document, Types } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  recruiterId: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true, unique: true },
    recruiterId: { type: Schema.Types.ObjectId, ref: 'Recruiter', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// MongoDB TTL index: the document is auto-deleted after expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
