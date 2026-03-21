import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../../utils/logger';
import { t } from '../../lib/i18n';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function errorHandler(error: Error, req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: t(req, 'validation.failed'),
      details: error.flatten()
    });
  }

  if (error instanceof AppError) {
    logger.warn({ code: error.code, details: error.details }, error.message);
    return res.status(error.statusCode).json({
      error: error.code,
      message: error.message,
      details: error.details
    });
  }

  logger.error({ error }, 'Unhandled application error');
  return res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: t(req, 'common.internal')
  });
}
