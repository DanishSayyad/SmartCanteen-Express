import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

type SchemaBundle = {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
};

export const validateRequest =
  (schemas: SchemaBundle) => (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params) as any;
        for (const key in req.params) delete req.params[key];
        Object.assign(req.params, parsedParams);
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query) as any;
        for (const key in req.query) delete req.query[key];
        Object.assign(req.query, parsedQuery);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.issues
        });
      }

      next(error);
    }
  };
