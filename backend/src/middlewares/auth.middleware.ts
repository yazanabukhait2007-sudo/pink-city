import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  id: number;
  role: 'admin' | 'employee' | 'customer';
  email?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
       res.status(401).json({
        success: false,
        message: "لم يتم توفير رمز التحقق (Token) في الترويسة (Authorization Header)."
      });
       return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
       res.status(401).json({
        success: false,
        message: "صيغة رمز التحقق غير صالحة. يجب أن تكون Bearer <token>"
      });
       return;
    }

    const secret = process.env.JWT_SECRET || 'RoseCityElectricGateSecret2026!';
    const decoded = jwt.verify(token, secret) as TokenPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
     res.status(401).json({
      success: false,
      message: "رمز التحقق غير صالح أو منتهي الصلاحية.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
};
