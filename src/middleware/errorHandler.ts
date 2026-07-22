import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import { MongoError } from '../types';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

export function errorHandler(
  err: AppError & MongoError & { name?: string; errors?: Record<string, { path: string; message: string }> },
  _req: Request,
  res: Response,
  _next: NextFunction
): Response | void {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: { message: 'Invalid id format' },
    });
  }

  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      error: { message: 'Validation failed', details },
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      error: { message: `Duplicate value for ${field}` },
    });
  }

  logger.error(`${err.message}\n${err.stack}`);
  return res.status(500).json({
    error: { message: 'Internal server error' },
  });
}
