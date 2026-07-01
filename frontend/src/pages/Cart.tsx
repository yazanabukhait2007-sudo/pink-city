import React from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { ShoppingBag, ArrowLeft, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

interface CartProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Cart: React.FC<CartProps> = ({ onNavigate }) => {
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();

  const deliveryFee = cartTotal > 150 ? 0 : 5; // Free delivery for orders above 150 JD

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4 bg-white border border-gray-100 rounded-3xl shadow-sm animate-fade-in" style={{ direction: 'rtl' }}>
        <div className="p-4 bg-pink-50 text-pink-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2">سلة المشتريات فارغة</h2>
        <p className="text-gray-500 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed mb-8">
          يبدو أنك لم تقم بإضافة أي أجهزة كهربائية بعد. تصفح المعرض الآن واختر ما يناسبك!
        </p>
        <button
          onClick={() => onNavigate('products')}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
        >
          اذهب لمعرض المنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Header with quick clean action */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div className="text-right">
          <h1 className="text-2xl font-black text-gray-900 mb-1">سلة التسوق الخاصة بك</h1>
          <p className="text-sm text-gray-500 font-medium">لديك {cartCount} قطعة في السلة لتجهيزها وتوصيلها</p>
        </div>

        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 border border-gray-100 py-2 px-3.5 rounded-xl"
        >
          <Trash2 className="w-4 h-4" />
          <span>تفريغ السلة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}

          <button
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-pink-600 hover:text-pink-700 transition-colors mt-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للمعرض لإضافة أجهزة أخرى</span>
          </button>
        </div>

        {/* Right: Summary panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3">ملخص الحساب</h3>

          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between items-center text-gray-500">
              <span>إجمالي ثمن الأجهزة</span>
              <span className="font-bold text-gray-900">{cartTotal.toLocaleString()} دينار</span>
            </div>

            <div className="flex justify-between items-center text-gray-500">
              <span>أجور الشحن والتوصيل</span>
              {deliveryFee === 0 ? (
                <span className="font-extrabold text-emerald-600 text-xs bg-emerald-50 px-2 py-0.5 rounded-full">شحن مجاني</span>
              ) : (
                <span className="font-bold text-gray-900">{deliveryFee} دينار</span>
              )}
            </div>

            {deliveryFee > 0 && (
              <p className="text-[10px] text-pink-500 font-bold bg-pink-50 p-2.5 rounded-xl leading-relaxed">
                💡 أضف أجهزة كهربائية بقيمة {(150 - cartTotal).toLocaleString()} دينار إضافية للحصول على شحن مجاني تماماً!
              </p>
            )}

            <hr className="border-gray-50 my-4" />

            <div className="flex justify-between items-center text-base font-black text-gray-950">
              <span>المجموع الكلي الفعلي</span>
              <span className="text-xl sm:text-2xl font-black text-pink-600 tracking-tight">
                {(cartTotal + deliveryFee).toLocaleString()} <span className="text-xs text-pink-500 font-bold">دينار</span>
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm sm:text-base py-4 rounded-2xl shadow-lg hover:shadow-pink-100 transition-all flex items-center justify-center gap-2.5 hover:scale-102 group"
            >
              <span>إكمال عملية الشراء والدفع</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>دفع آمن بالكامل عند الاستلام والتأكد من الأجهزة</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
