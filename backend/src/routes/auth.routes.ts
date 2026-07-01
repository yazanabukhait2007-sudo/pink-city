import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// 1) POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      res.status(400).json({
        success: false,
        message: "يرجى تزويد الاسم وكلمة المرور لإتمام عملية التسجيل."
      });
      return;
    }

    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: "يرجى تقديم البريد الإلكتروني أو رقم الهاتف على الأقل."
      });
      return;
    }

    // Check if email already registered
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: String(email).toLowerCase().trim() }
      });
      if (existingUserByEmail) {
        res.status(400).json({
          success: false,
          message: "البريد الإلكتروني هذا مستخدم بالفعل في النظام."
        });
        return;
      }
    }

    // Check if phone already registered
    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: String(phone).trim() }
      });
      if (existingUserByPhone) {
        res.status(400).json({
          success: false,
          message: "رقم الهاتف هذا مسجل بالفعل في النظام."
        });
        return;
      }
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user - Force role to 'customer' to prevent privilege escalation
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email ? String(email).toLowerCase().trim() : null,
        phone: phone ? String(phone).trim() : null,
        password: hashedPassword,
        role: 'customer' // Always customer by default for security
      }
    });

    // Generate JWT token
    const tokenSecret = process.env.JWT_SECRET || 'RoseCityElectricGateSecret2026!';
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      tokenSecret,
      { expiresIn: '7d' } // Default 7 days
    );

    // Return response without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "تم إنشاء الحساب بنجاح في معرض المدينة الوردية.",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع أثناء عملية التسجيل.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 2) POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = req.body;

    if (!password) {
      res.status(400).json({
        success: false,
        message: "يرجى إدخال كلمة المرور."
      });
      return;
    }

    if (!email && !phone) {
      res.status(400).json({
        success: false,
        message: "يرجى إدخال البريد الإلكتروني أو رقم الهاتف لتسجيل الدخول."
      });
      return;
    }

    let user = null;

    if (email) {
      user = await prisma.user.findUnique({
        where: { email: String(email).toLowerCase().trim() }
      });
    } else if (phone) {
      user = await prisma.user.findUnique({
        where: { phone: String(phone).trim() }
      });
    }

    // Check if user exists
    if (!user) {
      res.status(401).json({
        success: false,
        message: "بيانات الاعتماد غير صحيحة. لا يوجد حساب بهذا الاسم."
      });
      return;
    }

    // Verify password with bcrypt.compare
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(401).json({
        success: false,
        message: "بيانات الاعتماد غير صحيحة. كلمة المرور خاطئة."
      });
      return;
    }

    // Generate JWT token
    const tokenSecret = process.env.JWT_SECRET || 'RoseCityElectricGateSecret2026!';
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      tokenSecret,
      { expiresIn: '7d' }
    );

    // Return response without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح. أهلاً بك في معرض المدينة الوردية.",
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء عملية تسجيل الدخول.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// 3) GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "غير مصرح. لم يتم العثور على رمز التحقق."
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "لم يتم العثور على حساب المستخدم المرتبط برمز التحقق."
      });
      return;
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب بيانات المستخدم الحالية.",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
