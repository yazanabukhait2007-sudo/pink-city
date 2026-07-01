import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.routes';
import productsRouter from './routes/products.routes';
import ordersRouter from './routes/orders.routes';

const app = express();

// ==========================================
// MIDDLEWARES
// ==========================================

// Enable CORS (Configure to allow frontend origins in production, or permit all for local development)
app.use(cors({
  origin: '*', // In development/container environment, allow any origin to connect
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'سيرفر معرض المدينة الوردية يعمل بشكل ممتاز.',
    databaseConfigured: !!process.env.DATABASE_URL
  });
});

// Interceptor for missing DATABASE_URL to provide a highly informative, friendly response
app.use((req, res, next) => {
  if (!process.env.DATABASE_URL && req.path.startsWith('/api') && req.path !== '/api/health') {
    res.status(400).json({
      success: false,
      isDbConfigMissing: true,
      message: "لم يتم العثور على متغير البيئة DATABASE_URL في بيئة المعاينة الحالية. يرجى إضافة رابط قاعدة بيانات PostgreSQL الخاصة بك (من Railway) في إعدادات (Settings) منصة AI Studio لتفعيل قاعدة البيانات والمعاينة بنجاح."
    });
    return;
  }
  next();
});

// ==========================================
// MOUNT API ROUTES
// ==========================================
app.use('/api/auth', authRouter);
app.use('/api', productsRouter); // Mounts /products and /categories
app.use('/api', ordersRouter);   // Mounts /orders and /users/me/orders

export default app;
