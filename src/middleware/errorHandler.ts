import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error(`Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  const code = err.code || 'INTERNAL_ERROR';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
    },
  });
};

// Custom error class for application errors
export class ApiError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, 400, 'BAD_REQUEST');
  }

  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, 403, 'FORBIDDEN');
  }

  static notFound(message: string = 'Not found'): ApiError {
    return new ApiError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409, 'CONFLICT');
  }

  static internal(message: string = 'Internal server error'): ApiError {
    return new ApiError(message, 500, 'INTERNAL_ERROR');
  }
}

export default errorHandler;
