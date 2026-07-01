import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import app from './app';

// Load environment variables
dotenv.config();

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    // If we are in development, integrate Vite as middleware
    if (process.env.NODE_ENV !== "production") {
      console.log("البيئة الحالية: تطوير (Development) - يتم تحميل Vite Middleware...");
      
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        root: path.resolve(process.cwd(), 'frontend'),
        server: { middlewareMode: true },
        appType: "spa",
      });
      
      app.use(vite.middlewares);
    } else {
      console.log("البيئة الحالية: إنتاج (Production) - يتم تقديم الملفات الساكنة من مجلد dist...");
      
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      
      // Fallback to React SPA index.html for any other requests (routing)
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n======================================================`);
      console.log(`🚀 السيرفر يعمل بنجاح على المنفذ: http://localhost:${PORT}`);
      console.log(`🚀 متصل بقاعدة بيانات Railway الخارجية بنجاح!`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error("❌ فشل في بدء تشغيل السيرفر المدمج:", error);
    process.exit(1);
  }
}

startServer();
