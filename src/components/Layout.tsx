import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Phone, MapPin, Mail, Clock, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Navbar Header */}
      <Navbar currentView={currentView} onNavigate={onNavigate} />

      {/* Main Content Stage */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>

      {/* Trust Badges */}
      <section className="bg-white border-t border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-full bg-brand-light text-brand-primary mb-3">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">توصيل سريع وموثوق</h3>
              <p className="text-sm text-gray-500">نوصل أجهزتك الكهربائية بأمان وسرعة إلى باب منزلك في إربد وكافة المحافظات.</p>
            </div>
            
            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-full bg-brand-light text-brand-primary mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">كفالة وجودة مضمونة</h3>
              <p className="text-sm text-gray-500">جميع أجهزتنا مكفولة ومضمونة المصدر لراحة بالك واستخدام آمن طويل الأجل.</p>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="p-3 rounded-full bg-brand-light text-brand-primary mb-3">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-1">خدمة عملاء ممتازة</h3>
              <p className="text-sm text-gray-500">نحن هنا لخدمتك دائماً، قبل وبعد الشراء للإجابة على جميع استفساراتك.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Store Bio */}
            <div>
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary block" />
                معرض المدينة الوردية
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">
                وجهتكم الأولى في إربد للأجهزة الكهربائية والمنزلية ومستلزماتها. الجودة العالية، السعر المنافس، والخدمة الاستثنائية هي ركائزنا الأساسية دائماً.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">روابط سريعة</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <button onClick={() => onNavigate('home')} className="hover:text-brand-primary transition-colors text-right">الرئيسية</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('products')} className="hover:text-brand-primary transition-colors text-right">معرض المنتجات</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('cart')} className="hover:text-brand-primary transition-colors text-right">سلة التسوق</button>
                </li>
                <li>
                  <button onClick={() => onNavigate('account')} className="hover:text-brand-primary transition-colors text-right">حسابي الشخصي</button>
                </li>
              </ul>
            </div>

            {/* Contact Details */}
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">معلومات الاتصال والموقع</h3>
              <ul className="space-y-3.5 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <span>إربد - شارع الهاشمي، الأردن</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-primary shrink-0" />
                  <span dir="ltr">+962 7 9000 0000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-primary shrink-0" />
                  <span>info@pinkcity-jo.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-300">أوقات الدوام:</p>
                    <p className="text-xs">السبت - الخميس: 9:00 ص - 10:00 م</p>
                    <p className="text-xs">الجمعة: 2:00 م - 10:00 م</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs">
            <p>© {new Date().getFullYear()} معرض المدينة الوردية للأجهزة الكهربائية. جميع الحقوق محفوظة.</p>
            <p className="mt-1 text-gray-600">مصمم بكل فخر في إربد، المملكة الأردنية الهاشمية.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
