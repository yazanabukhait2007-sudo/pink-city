import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const adminOnlyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "غير مصرح. يرجى تسجيل الدخول أولاً."
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: "غير مسموح. هذه العملية مخصصة لمدير النظام فقط."
    });
    return;
  }

  next();
};
