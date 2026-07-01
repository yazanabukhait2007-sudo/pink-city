import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../utils/api';
import { MapPin, Phone, MessageSquare, ClipboardCheck, ShoppingBag, ArrowRight, Loader } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if not logged in or cart is empty
  useEffect(() => {
    if (!user) {
      showToast('يرجى تسجيل الدخول أولاً لإتمام الطلب.', 'info');
      onNavigate('login', { redirect: 'checkout' });
    } else if (cartItems.length === 0) {
      showToast('سلة المشتريات فارغة.', 'info');
      onNavigate('products');
    }
  }, [user, cartItems]);

  if (!user || cartItems.length === 0) return null;

  const total = getCartTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      showToast('يرجى كتابة عنوان التوصيل بالتفصيل.', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('يرجى كتابة رقم الهاتف للتواصل معك.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        address,
        phone,
        notes: notes.trim() || undefined
      };

      const res = await ordersApi.create(payload);

      if (res.success && res.order) {
        showToast('تم إرسال طلبك بنجاح! شكراً لثقتك بمعرض المدينة الوردية.', 'success');
        clearCart(); // empty cart
        onNavigate('order_tracking', { id: res.order.id }); // redirect to tracking page
      } else {
        showToast(res.message || 'فشل إتمام الطلب، يرجى المحاولة لاحقاً.', 'error');
      }
    } catch (err: any) {
      console.error("Error creating order:", err);
      showToast(err.message || 'حدث خطأ غير متوقع أثناء إتمام الطلب.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">تأكيد وإتمام الطلب</h1>
        <p className="text-sm text-gray-500 mt-1">يرجى تعبئة بيانات التوصيل لمراجعتها وإرسال الأجهزة لمنزلك فوراً.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-4 flex items-center gap-2">
            <ClipboardCheck className="w-5.5 h-5.5 text-brand-primary" />
            بيانات الشحن والاتصال
          </h3>

          <div className="space-y-5">
            {/* Customer name (disabled) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2">اسم المشتري (من حسابك)</label>
              <input
                type="text"
                disabled
                value={user.name}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-500 text-right cursor-not-allowed"
              />
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">رقم الهاتف للتواصل *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="مثال: 0791234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-semibold"
                />
                <Phone className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">سنقوم بالاتصال بك على هذا الرقم لتأكيد الموعد قبل التوصيل.</p>
            </div>

            {/* Address input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">عنوان التوصيل بالتفصيل *</label>
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  placeholder="مثال: إربد، شارع جامعة اليرموك، عمارة رقم 14، الطابق الثاني شقة 5..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-medium leading-relaxed"
                />
                <MapPin className="absolute right-4 top-4.5 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">ملاحظات خاصة بالتوصيل أو التركيب (اختياري)</label>
              <div className="relative">
                <textarea
                  rows={2}
                  placeholder="مثال: يرجى التوصيل بعد الساعة 4 عصراً، أو الاتصال برقم آخر في حال عدم الرد..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-medium leading-relaxed"
                />
                <MessageSquare className="absolute right-4 top-4.5 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => onNavigate('cart')}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              <span>تعديل السلة</span>
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 bg-brand-primary hover:bg-brand-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg transition-all text-sm flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-4.5 h-4.5 animate-spin" />
                  <span>جاري إرسال طلبك...</span>
                </>
              ) : (
                <span>تأكيد الطلب وشراء الأجهزة</span>
              )}
            </button>
          </div>
        </form>

        {/* Order review summary (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
          <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-4">مراجعة أجهزة طلبك</h3>

          {/* Mini product list */}
          <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center gap-3">
                <div className="w-11 h-11 bg-slate-50 border border-gray-100 rounded-lg flex items-center justify-center p-1 overflow-hidden shrink-0">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} className="object-contain max-h-full max-w-full" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-brand-primary/10" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-xs font-extrabold text-gray-800 truncate">{item.product.name}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">الكمية: {item.quantity} × {item.product.price} د.أ</p>
                </div>
                <span className="text-xs font-bold text-gray-900 shrink-0">
                  {(parseFloat(item.product.price as string) * item.quantity).toFixed(2)} د.أ
                </span>
              </div>
            ))}
          </div>

          {/* Pricing summary */}
          <div className="border-t border-gray-50 pt-4 space-y-3.5 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>المجموع الفرعي للقطع</span>
              <span className="font-bold text-gray-800">{total.toFixed(2)} د.أ</span>
            </div>
            <div className="flex justify-between">
              <span>التوصيل والتركيب المنزلي</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded">مجاني بالكامل</span>
            </div>
            <div className="flex justify-between border-t border-gray-50 pt-3 text-sm text-gray-900">
              <span className="font-bold">المجموع الإجمالي</span>
              <span className="font-black text-brand-primary text-base">{total.toFixed(2)} د.أ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
