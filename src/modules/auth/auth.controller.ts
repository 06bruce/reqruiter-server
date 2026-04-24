import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import { SignupInput, LoginInput } from "./auth.schema";

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as SignupInput;
      const result = await AuthService.signup(data);
      res.status(201).json({
        success: true,
        message: "Recruiter registered successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as LoginInput;
      const result = await AuthService.login(data);
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
