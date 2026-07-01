import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export const employeeOnlyMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "غير مصرح. يرجى تسجيل الدخول أولاً."
    });
    return;
  }

  const role = req.user.role;
  if (role !== 'admin' && role !== 'employee') {
    res.status(403).json({
      success: false,
      message: "غير مسموح. هذه العملية مخصصة للموظفين وإدارة النظام فقط."
    });
    return;
  }

  next();
};
