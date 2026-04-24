import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import { errorHandler } from "../middleware/errorHandler";
import { env } from "./env";

// Import route modules
import authRoutes from "../modules/auth/auth.routes";
import candidatesRoutes from "../modules/candidates/candidates.routes";
import departmentsRoutes from "../modules/departments/departments.routes";
import vacanciesRoutes from "../modules/vacancies/vacancies.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import aiRoutes from "../modules/ai/ai.routes";

export const createApp = (): Application => {
  const app = express();

  // Security & Body Parsing Middleware
  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));
  app.use(express.urlencoded({ limit: "10kb", extended: true }));
  app.use(mongoSanitize());

  // CORS Configuration
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/candidates", candidatesRoutes);
  app.use("/api/departments", departmentsRoutes);
  app.use("/api/vacancies", vacanciesRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/ai", aiRoutes);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: "Route not found",
      path: req.originalUrl,
    });
  });

  // Global Error Handler (must be last)
  app.use(errorHandler);

  return app;
};
