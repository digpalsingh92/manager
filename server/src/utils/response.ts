import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: Record<string, any>
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== undefined && { data }),
    ...(meta && { meta }),
  };

  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): void => {
  sendResponse(res, statusCode, message, data, { pagination });
};
