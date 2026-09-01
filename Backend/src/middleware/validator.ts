import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/responseWrapper';

export function validateRequiredFields(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing: string[] = [];
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missing.push(field);
      }
    }
    if (missing.length > 0) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }
    next();
  };
}

export function validateDateParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const val = req.params[paramName] || req.query[paramName] || req.body[paramName];
    if (val && !/^\d{4}-\d{2}-\d{2}$/.test(String(val))) {
      return errorResponse(res, `Invalid date format for ${paramName}. Expected YYYY-MM-DD`, 400);
    }
    next();
  };
}
