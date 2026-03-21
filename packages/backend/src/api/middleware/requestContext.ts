import type { NextFunction, Request, Response } from 'express';
import { resolveLocale } from '../../lib/i18n';

export function requestContext(req: Request, _res: Response, next: NextFunction) {
  req.locale = resolveLocale(req);
  next();
}
