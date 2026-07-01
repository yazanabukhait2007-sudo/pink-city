import React, { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../utils/api';
import ProductCard from '../components/ProductCard';
import { ShoppingBag, ChevronLeft, MapPin, Phone, Mail, Award, Flame, Zap, ArrowLeft, Layers } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [categoriesRes, productsRes] = await Promise.all([
          categoriesApi.list(),
          productsApi.list()
        ]);
        
        if (categoriesRes.success) {
          setCategories(categoriesRes.categories || []);
        }
        if (productsRes.success) {
          setProducts(productsRes.products ? productsRes.products.slice(0, 4) : []); // display top 4 latest
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12">
      {/* 1. Hero Showcase Banner */}
      <section className="relative rounded-3xl bg-gradient-to-br from-brand-primary via-[#D81B60] to-brand-dark text-white overflow-hidden shadow-xl shadow-brand-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center px-6 py-16 sm:py-20 flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-brand-secondary text-xs font-bold mb-4 tracking-wider">
            <Zap className="w-4 h-4 fill-brand-secondary text-brand-secondary" />
            أقوى العروض الحصرية والأصلية في إربد
          </span>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-4">
            معرض المدينة الوردية للأجهزة الكهربائية
          </h1>
          
          <p className="text-base sm:text-lg text-brand-secondary/90 font-medium max-w-2xl leading-relaxed mb-8">
            وجهتك المفضلة في إربد لاقتناء أحدث الأجهزة المنزلية والكهربائية بأعلى كفاءة وأفضل كفالة، بأسعار تنافسية تناسب تطلعاتك.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('products')}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-primary font-bold rounded-xl shadow-lg hover:bg-brand-secondary/20 hover:text-white transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>تصفح الأجهزة المتاحة</span>
            </button>
            <button
              onClick={() => {
                const contactsEl = document.getElementById('contact-section');
                contactsEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3.5 border-2 border-white/40 hover:border-white font-bold rounded-xl transition-all"
            >
              موقعنا وتواصل معنا
            </button>
          </div>
        </div>
      </section>

      {/* 2. Categorization Section */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">تصفح حسب التصنيفات</h2>
            <p className="text-sm text-gray-400 mt-1">تسهيل عملية البحث عن طريق تصفح أقسام المعرض</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-28" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => onNavigate('products', { categoryId: cat.id })}
                className="group relative cursor-pointer bg-white border border-gray-100 hover:border-brand-primary/20 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center overflow-hidden"
              >
                <div className="w-12 h-12 bg-brand-light rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <Layers className="w-6 h-6 text-brand-primary" />
                  )}
                </div>
                <span className="font-extrabold text-gray-800 group-hover:text-brand-primary transition-colors text-sm">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white border border-dashed border-gray-200 rounded-2xl text-gray-400">
            <p className="text-sm">لم يتم إضافة أي تصنيفات بعد بالمعرض.</p>
          </div>
        )}
      </section>

      {/* 3. Latest Products Showcase */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
              أحدث الأجهزة المضافة حديثاً
            </h2>
            <p className="text-sm text-gray-400 mt-1">تشكيلة مختارة من أرقى العلامات التجارية العالمية في المعرض</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-dark transition-colors"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onViewDetails={(id) => onNavigate('product_details', { id })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-dashed border-gray-200 rounded-3xl text-gray-400 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700 text-sm mb-1">المعرض فارغ حالياً</p>
            <p className="text-xs">يرجى من المدير إضافة أجهزة كهربائية من لوحة التحكم.</p>
          </div>
        )}
      </section>

      {/* 4. Contact and Location Info ("اربد - شارع الهاشمي") */}
      <section id="contact-section" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-wide bg-brand-light px-3 py-1.5 rounded-full">عنواننا وموقعنا</span>
              <h2 className="text-3xl font-black text-gray-900 mt-3">تفضل بزيارة معرضنا</h2>
              <p className="text-sm text-gray-500 mt-2">
                ندعوكم لزيارة معرضنا في قلب مدينة إربد لمعاينة الأجهزة والاستفادة من استشارات الفنيين مجاناً.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-xl text-brand-primary shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">العنوان الرئيسي المعزز</h4>
                  <p className="text-sm text-gray-500">إربد - شارع الهاشمي، بالقرب من دوار وسط البلد، إربد، الأردن</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-xl text-brand-primary shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">أرقام الهواتف والدعم</h4>
                  <p className="text-sm text-gray-500" dir="ltr">+962 7 9000 0000</p>
                  <p className="text-xs text-gray-400">متاح لخدمتكم 24 ساعة عبر الواتساب</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-light rounded-xl text-brand-primary shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">البريد الإلكتروني والمراسلات</h4>
                  <p className="text-sm text-gray-500">support@pinkcity-jo.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-64 sm:h-96 w-full rounded-2xl bg-slate-50 border border-gray-100 overflow-hidden relative flex flex-col justify-center items-center text-center p-8">
            <div className="p-4 rounded-full bg-brand-light text-brand-primary mb-3">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="font-black text-gray-800 text-lg mb-1">موقعنا الجغرافي على الخريطة في إربد</h3>
            <p className="text-sm text-gray-500 max-w-sm mb-4">
              شارع الهاشمي - وسط البلد، إربد. يسهل الوصول إلينا وبجانبنا تتوفر مواقف سيارات مريحة.
            </p>
            {/* Elegant visual simulation of maps */}
            <div className="absolute inset-x-4 bottom-4 h-1/3 bg-white/80 backdrop-blur-md rounded-xl border border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary text-white rounded-lg flex items-center justify-center font-bold">W</div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">معرض المدينة الوردية</p>
                  <p className="text-[10px] text-gray-400">إربد، شارع الهاشمي</p>
                </div>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-brand-primary hover:bg-brand-dark text-white rounded-lg font-bold text-[10px] transition-all"
              >
                افتح الخريطة
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
