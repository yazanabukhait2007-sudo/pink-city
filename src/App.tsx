import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AccountSettings from './pages/AccountSettings';

function AppContent() {
  const { loading: authLoading } = useAuth();
  
  // Custom router state
  const [currentRoute, setCurrentRoute] = useState<string>('home');
  const [routeParams, setRouteParams] = useState<any>({});
  const [dbMissing, setDbMissing] = useState(false);

  // Check if database is configured
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data && data.databaseConfigured === false) {
          setDbMissing(true);
        }
      })
      .catch(err => {
        console.error('Error checking database configuration status:', err);
      });
  }, []);

  // Parse location hash on load and hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#home';
      
      // Basic custom path routing: #products, #product_details?id=12, #order_tracking?id=5
      if (hash.startsWith('#')) {
        const pathPart = hash.slice(1);
        const [path, queryStr] = pathPart.split('?');
        
        const params: any = {};
        if (queryStr) {
          const searchParams = new URLSearchParams(queryStr);
          searchParams.forEach((val, key) => {
            params[key] = isNaN(Number(val)) ? val : Number(val);
          });
        }
        
        setCurrentRoute(path || 'home');
        setRouteParams(params);
        
        // Scroll to top on navigation
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // trigger first parse

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Custom navigate handler
  const navigate = (view: string, params: any = {}) => {
    let hash = `#${view}`;
    if (Object.keys(params).length > 0) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        query.append(key, String(val));
      });
      hash += `?${query.toString()}`;
    }
    window.location.hash = hash;
  };

  const renderActivePage = () => {
    if (authLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-bold">جاري تحميل الجلسة والاتصال بخدمة معرض المدينة الوردية...</p>
        </div>
      );
    }

    switch (currentRoute) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'products':
        return <Products initialCategoryId={routeParams.categoryId} onNavigate={navigate} />;
      case 'product_details':
        return <ProductDetails productId={routeParams.id} onNavigate={navigate} />;
      case 'cart':
        return <Cart onNavigate={navigate} />;
      case 'checkout':
        return <Checkout onNavigate={navigate} />;
      case 'order_tracking':
        return <OrderTracking orderId={routeParams.id} onNavigate={navigate} />;
      case 'login':
        return <Login redirect={routeParams.redirect} onNavigate={navigate} />;
      case 'signup':
        return <Signup redirect={routeParams.redirect} onNavigate={navigate} />;
      case 'account':
        return <AccountSettings onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <Layout currentView={currentRoute} onNavigate={navigate}>
      {dbMissing && (
        <div className="mb-6 p-5 bg-amber-50 border-2 border-amber-200 text-amber-900 rounded-2xl shadow-sm text-right flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans">
          <div className="space-y-1 max-w-3xl">
            <h4 className="font-extrabold text-amber-800 text-base flex items-center gap-2">
              ⚠️ تنبيه: قاعدة بيانات PostgreSQL غير متصلة في بيئة المعاينة
            </h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              لقد قمنا بضبط الكود البرمجي ليدعم قاعدة بيانات <strong>PostgreSQL</strong> الخاصة بك على <strong>Railway</strong> بناءً على طلبك. 
              ولكن لتشغيل هذه المعاينة التفاعلية وعرض البيانات بشكل صحيح، يرجى إضافة متغير البيئة <strong>DATABASE_URL</strong> الخاص بك من Railway في قائمة <strong>Settings (الإعدادات) &gt; Secrets</strong> في شريط الأدوات الجانبي لمنصة AI Studio.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-block px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg border border-amber-300">
              بانتظار الربط...
            </span>
          </div>
        </div>
      )}
      {renderActivePage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
