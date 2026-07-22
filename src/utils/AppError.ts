import { ValidationErrorDetail } from '../types';

export class AppError extends Error {
  statusCode: number;
  details: ValidationErrorDetail[] | null;
  isOperational: boolean;

  constructor(message: string, statusCode = 500, details: ValidationErrorDetail[] | null = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}
