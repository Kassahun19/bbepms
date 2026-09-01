import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export function successResponse<T = any>(
  res: Response,
  data: T | null = null,
  message = 'Operation completed successfully',
  statusCode = 200
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data: data as T,
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(payload);
}

export function errorResponse(
  res: Response,
  error: string | Error = 'An error occurred',
  statusCode = 500
): Response {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Internal Server Error';
  const payload: ApiResponse = {
    success: false,
    error: errorMessage,
    timestamp: new Date().toISOString()
  };
  return res.status(statusCode).json(payload);
}
