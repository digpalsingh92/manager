import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler to automatically catch errors
 * and forward them to the Express error-handling middleware.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
