import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartItem from '../components/CartItem';
import { ShoppingBag, CreditCard, ArrowRight, Trash2, ShieldCheck, Truck } from 'lucide-react';

interface CartProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { cartItems, getCartTotal, clearCart, getCartCount } = useCart();
  const { user } = useAuth();

  const total = getCartTotal();
  const count = getCartCount();

  const handleCheckoutClick = () => {
    if (!user) {
      onNavigate('login', { redirect: 'checkout' });
    } else {
      onNavigate('checkout');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">سلة المشتريات</h1>
        <p className="text-sm text-gray-500 mt-1">تأكد من الأجهزة الكهربائية المضافة لتأكيد طلبك.</p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Item List List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <span className="text-sm font-bold text-gray-700">عدد الأجهزة في السلة: {count} أجهزة</span>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>تفريغ السلة بالكامل</span>
              </button>
            </div>

            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>

            {/* Back to Products */}
            <button
              onClick={() => onNavigate('products')}
              className="flex items-center gap-2 text-sm font-bold text-brand-primary hover:text-brand-dark transition-all mt-4"
            >
              <ArrowRight className="w-4.5 h-4.5" />
              <span>متابعة التسوق وإضافة المزيد من الأجهزة</span>
            </button>
          </div>

          {/* Checkout Invoice Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-4">ملخص الفاتورة المبدئية</h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي للأجهزة</span>
                <span className="font-bold text-gray-800">{total.toFixed(2)} د.أ</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>خدمة التوصيل والتركيب (إربد)</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg text-xs">مجاناً</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>الضرائب المشمولة (16%)</span>
                <span className="font-medium text-gray-600">مشمولة بالسعر</span>
              </div>
              
              <div className="border-t border-gray-50 pt-4 flex justify-between text-gray-900">
                <span className="font-bold text-base">الإجمالي النهائي للطلب</span>
                <span className="font-black text-xl text-brand-primary">{total.toFixed(2)} د.أ</span>
              </div>
            </div>

            {/* Security and Trust Icons */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 space-y-3.5 text-xs text-gray-500">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>الطلب يتم توصيله سريعاً وبحالة ممتازة</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>جميع الأجهزة مشمولة بالضمان والتشغيل الأولي</span>
              </div>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-4 bg-brand-primary hover:bg-brand-dark text-white font-extrabold rounded-2xl shadow-lg shadow-brand-primary/10 hover:shadow-brand-primary/25 transition-all text-sm"
            >
              <CreditCard className="w-5 h-5" />
              <span>{user ? 'إتمام ومتابعة الطلب' : 'سجل دخول لإتمام الطلب'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-24 bg-white border border-gray-100 rounded-3xl shadow-sm text-gray-400 max-w-lg mx-auto">
          <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4 stroke-[1.2]" />
          <h3 className="font-extrabold text-gray-700 text-xl mb-1.5">السلة فارغة حالياً</h3>
          <p className="text-sm px-8 leading-relaxed mb-8">
            لم تقم بإضافة أي أجهزة كهربائية إلى السلة بعد. تفضل بتصفح منتجات معرض المدينة الوردية الرائعة واختر ما يناسبك!
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="px-8 py-3.5 bg-brand-primary hover:bg-brand-dark text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-brand-primary/15"
          >
            تصفح معرض الأجهزة الكهربائية الآن
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
