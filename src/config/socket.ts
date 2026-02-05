import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import logger from "../utils/logger";
import { getSupabase } from "./supabase";
import Caregiver from "../models/Caregiver";

let io: Server;

export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      // Verify token with Supabase
      const supabase = getSupabase();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        return next(new Error("Invalid token"));
      }

      // Get caregiver from MongoDB
      const caregiver = await Caregiver.findOne({ supabaseUserId: user.id });

      if (!caregiver) {
        return next(new Error("Caregiver not found"));
      }

      // Attach caregiver info to socket
      socket.data.caregiverId = caregiver.id;
      socket.data.caregiverEmail = caregiver.email;

      next();
    } catch (err) {
      logger.error(`Socket auth error: ${err}`);
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const caregiverId = socket.data.caregiverId;
    logger.info(`Socket connected: ${socket.id} (caregiver: ${caregiverId})`);

    // Join caregiver's personal room for targeted events
    socket.join(`caregiver:${caregiverId}`);

    socket.on("disconnect", (reason) => {
      logger.info(`Socket disconnected: ${socket.id} - ${reason}`);
    });

    socket.on("error", (err) => {
      logger.error(`Socket error: ${err}`);
    });
  });

  logger.info("Socket.IO initialized");
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized. Call initSocketIO first.");
  }
  return io;
};

// Emit event to a specific caregiver's room
export const emitToCaregiver = (
  caregiverId: string,
  event: string,
  data: unknown
): void => {
  if (io) {
    io.to(`caregiver:${caregiverId}`).emit(event, data);
  }
};

// Emit event to all connected clients (admin broadcast)
export const emitToAll = (event: string, data: unknown): void => {
  if (io) {
    io.emit(event, data);
  }
};

export default { initSocketIO, getIO, emitToCaregiver, emitToAll };
