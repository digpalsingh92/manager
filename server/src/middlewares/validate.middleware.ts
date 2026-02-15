import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodSchema } from 'zod';

/**
 * Validation middleware using Zod schemas.
 * Validates body, query, and params against a provided schema.
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(result.error);
    }

    // Overwrite with parsed/cleaned data
    const parsed = result.data as any;
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;

    next();
  };
};
