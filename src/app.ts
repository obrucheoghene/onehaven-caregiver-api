import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";

import connectDatabase from "./config/database";
import { initSupabase } from "./config/supabase";
import { initSocketIO } from "./config/socket";
import swaggerSpec from "./config/swagger";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { globalLimiter } from "./middleware/rateLimiter";
import logger from "./utils/logger";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(globalLimiter);

// Swagger documentation
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "OneHaven Caregiver API Documentation",
  }),
);

// Base endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: "Welcome to the OneHaven Caregiver API",
      documentation: `/api/docs`,
    },
  });
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
    },
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
    },
  });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Initialize database connection
    await connectDatabase();

    // Initialize Supabase client
    initSupabase();

    // Initialize Socket.IO
    initSocketIO(httpServer);

    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(
        `API Documentation available at http://localhost:${PORT}/api/docs`,
      );
      logger.info(`Health check available at http://localhost:${PORT}/health`);
      logger.info(`WebSocket server ready for connections`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error}`);
    process.exit(1);
  }
};

startServer();

export default app;
