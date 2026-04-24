import { createApp } from "./config/app";
import { connectDB } from "./config/database";
import { env } from "./config/env";

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("✓ Connected to MongoDB");

    // Create and start Express app
    const app = createApp();
    const PORT = env.PORT;

    const server = app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${env.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
