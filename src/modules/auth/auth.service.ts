import bcryptjs from "bcryptjs";
import { Recruiter } from "../../models/Recruiter.model";
import { RefreshToken } from "../../models/RefreshToken.model";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt";
import { ApiError } from "../../utils/ApiError";
import { SignupInput, LoginInput } from "./auth.schema";

export class AuthService {
  static async signup(input: SignupInput) {
    const existingRecruiter = await Recruiter.findOne({ email: input.email });
    if (existingRecruiter) {
      throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await bcryptjs.hash(input.password, 12);
    const recruiter = await Recruiter.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
    });

    const accessToken = signAccessToken({
      id: recruiter._id.toString(),
      email: recruiter.email,
      role: recruiter.role,
    });
    const refreshToken = signRefreshToken({ id: recruiter._id.toString() });

    // Store refresh token in DB
    await RefreshToken.create({
      token: refreshToken,
      recruiterId: recruiter._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(input: LoginInput) {
    const recruiter = await Recruiter.findOne({ email: input.email });
    if (!recruiter) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcryptjs.compare(input.password, recruiter.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const accessToken = signAccessToken({
      id: recruiter._id.toString(),
      email: recruiter.email,
      role: recruiter.role,
    });
    const refreshToken = signRefreshToken({ id: recruiter._id.toString() });

    // Store refresh token in DB
    await RefreshToken.create({
      token: refreshToken,
      recruiterId: recruiter._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refresh(refreshTokenString: string) {
    const payload = verifyRefreshToken(refreshTokenString);
    if (!payload) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Check if token exists in DB
    const tokenRecord = await RefreshToken.findOne({ token: refreshTokenString });
    if (!tokenRecord) {
      throw new ApiError(401, "Refresh token revoked");
    }

    const recruiter = await Recruiter.findById(payload.id);
    if (!recruiter) {
      throw new ApiError(404, "Recruiter not found");
    }

    const newAccessToken = signAccessToken({
      id: recruiter._id.toString(),
      email: recruiter.email,
      role: recruiter.role,
    });
    const newRefreshToken = signRefreshToken({ id: recruiter._id.toString() });

    // Invalidate old refresh token and create new one
    await RefreshToken.deleteOne({ token: refreshTokenString });
    await RefreshToken.create({
      token: newRefreshToken,
      recruiterId: recruiter._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: recruiter.role,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(refreshTokenString: string) {
    await RefreshToken.deleteOne({ token: refreshTokenString });
    return { message: "Logged out successfully" };
  }
}
