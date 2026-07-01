import React, { useEffect, useState } from 'react';
import { categoriesApi } from '../utils/api';
import { Sparkles, ArrowLeft, Search, Truck, ShieldCheck, HeartHandshake, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string, params?: any) => void;
}

interface Category {
  id: number;
  name: string;
  imageUrl: string;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesApi.list();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error('Failed to load categories on home:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-16" style={{ direction: 'rtl' }}>
      {/* 1. Hero Promo Section */}
      <section className="relative rounded-3xl bg-radial from-pink-500 to-pink-700 text-white overflow-hidden py-16 px-6 sm:px-12 md:py-20 shadow-xl">
        {/* Pattern backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-400/20 via-transparent to-black/10 mix-blend-overlay" />
        
        <div className="relative max-w-4xl mx-auto text-center z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-pink-100 font-bold text-xs mb-6 border border-white/10 shadow-inner">
            <Sparkles className="w-4 h-4 fill-pink-100" />
            <span>معرض المدينة الوردية للأجهزة الكهربائية في إربد</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-none mb-6">
            بيتك أجمل مع أحدث الأجهزة الكهربائية وبأفضل الأسعار
          </h1>
          
          <p className="text-pink-100 text-sm sm:text-lg max-w-2xl leading-relaxed mb-10 font-medium">
            تسوّق الآن من تشكيلة واسعة من الشاشات الذكية، الثلاجات، الغسالات، ومستلزمات المطبخ من كبرى الماركات العالمية مع كفالة مصنعية حقيقية وتوصيل سريع لباب منزلك.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
            <button
              onClick={() => onNavigate('products')}
              className="bg-white text-pink-600 hover:bg-pink-50 font-extrabold text-base px-8 py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2.5 hover:scale-103 group"
            >
              <span>ابدأ التسوق الآن</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('order-tracking')}
              className="bg-pink-600/30 text-white border-2 border-white/30 hover:border-white/60 hover:bg-pink-600/50 font-bold text-sm sm:text-base px-6 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>تتبع حالة طلبك</span>
              <Search className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Top Banner / Fast Quick Links */}
      <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right">
            <h3 className="font-extrabold text-gray-900 text-lg mb-1">هل تبحث عن جهاز محدد؟</h3>
            <p className="text-sm text-gray-500 font-medium">ابحث في دليل معرض الأجهزة الذكي واعثر على أدق التفاصيل والمواقع في المعرض فوراً.</p>
          </div>
          <button
            onClick={() => onNavigate('products')}
            className="w-full md:w-auto px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 font-bold text-sm rounded-xl transition-all shrink-0 flex items-center justify-center gap-2"
          >
            <span>انتقل إلى دليل الأجهزة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 3. Shop by Categories */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-gray-100 pb-4">
          <div className="text-right">
            <h2 className="text-2xl font-black text-gray-900 mb-1">تسوّق حسب التصنيف</h2>
            <p className="text-sm text-gray-500 font-medium">تصفح مجموعاتنا المختارة من الأجهزة الكهربائية والمنزلية الفاخرة</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-2xl h-44" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onNavigate('products', { categoryId: category.id })}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-pink-200 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center p-4 text-center"
              >
                <div className="relative w-24 h-24 rounded-full bg-pink-50 flex items-center justify-center overflow-hidden mb-4 group-hover:scale-105 transition-transform">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <h3 className="font-bold text-gray-800 text-sm sm:text-base group-hover:text-pink-600 transition-colors">
                  {category.name}
                </h3>
                <span className="text-[10px] text-pink-500 font-extrabold mt-1.5 group-hover:underline flex items-center gap-1">
                  <span>تصفح الأجهزة</span>
                  <ArrowLeft className="w-3 h-3" />
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Why Buy From Us Info block */}
      <section className="bg-slate-100/50 rounded-3xl py-12 px-6 sm:px-12 border border-slate-200/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-black text-gray-900 mb-2">لماذا معرض المدينة الوردية؟</h2>
            <p className="text-sm text-gray-500">نهتم بأدق تفاصيل تجربتكم، ونقدم أعلى معايير الجودة والخدمة في الأردن</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl mb-4 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-2">توصيل سريع وبأمان</h4>
              <p className="text-xs text-gray-500 leading-relaxed">توصيل لجميع مناطق إربد والمحافظات لضمان وصول أجهزتكم بأفضل حالة دون أي عناء.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl mb-4 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-2">كفالة أصلية ومعتمدة</h4>
              <p className="text-xs text-gray-500 leading-relaxed">جميع أجهزتنا تأتي بكفالة الوكيل المعتمدة في الأردن مع دعم فني متواصل ما بعد البيع.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col items-center text-center">
              <div className="p-3 bg-pink-50 text-pink-600 rounded-xl mb-4 shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-800 text-base mb-2">أنظمة دفع وتسهيلات</h4>
              <p className="text-xs text-gray-500 leading-relaxed">نقدم تسهيلات نقدية وأسعار حصرية منافسة لتلبي احتياجات كل بيت أردني بكل يسر وسهولة.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
