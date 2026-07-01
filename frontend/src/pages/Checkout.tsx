import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { ClipboardCheck, Truck, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, CreditCard, ShoppingCart } from 'lucide-react';

interface CheckoutProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ onNavigate }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [city, setCity] = useState('إربد');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  
  // Statuses
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<number | null>(null);

  const deliveryFee = cartTotal > 150 ? 0 : 5;
  const totalAmount = cartTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) {
      showError('يرجى ملء جميع الحقول الإلزامية لخدمتكم بشكل صحيح.');
      return;
    }

    setSubmitting(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await ordersApi.create({
        items,
        address: `${city} - ${address}`,
        phone: customerPhone,
        notes: notes ? `المستلم: ${customerName} - ${notes}` : `المستلم: ${customerName}`,
      });

      if (res.success && res.order) {
        setOrderSuccessId(res.order.id);
        clearCart();
        showSuccess('تم تسجيل طلبك بنجاح! شكراً لثقتك بنا.');
      } else {
        throw new Error(res.error || 'فشل في إرسال طلبك. يرجى المحاولة مرة أخرى.');
      }
    } catch (err: any) {
      showError(err.message || 'حدث خطأ غير متوقع أثناء إرسال طلبك.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order was successfully submitted, show Success Confirmation Layout
  if (orderSuccessId) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 text-center shadow-md space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-100 animate-bounce">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900">تم استلام طلبك بنجاح!</h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            شكراً لتسوقك من معرضنا. تم تدوين طلبك في النظام وبدأ فريق مبيعات المدينة الوردية بتجهيز الأجهزة الخاصة بك.
          </p>
        </div>

        <div className="p-6 bg-slate-50 border border-gray-100 rounded-2xl inline-block max-w-full">
          <p className="text-xs text-gray-400 font-bold mb-1">رقم الطلب الخاص بك للتتبع</p>
          <p className="text-2xl font-black text-pink-600 tracking-wider">#{orderSuccessId}</p>
          <p className="text-[10px] text-gray-400 mt-2">يرجى حفظ هذا الرقم للاستعلام وتتبع حالة الشحن والتسليم</p>
        </div>

        <div className="space-y-3.5 pt-4">
          <button
            onClick={() => onNavigate('order-tracking', { orderId: orderSuccessId })}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>انتقل لتتبع حالة الطلب فوراً</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full py-3.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12 px-4 bg-white border border-gray-100 rounded-2xl shadow-sm" style={{ direction: 'rtl' }}>
        <ShoppingCart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-gray-950 text-base mb-1">السلة فارغة حالياً</h3>
        <p className="text-gray-500 text-xs sm:text-sm mb-6">لا توجد منتجات في سلتك لإتمام الدفع والشحن.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl"
        >
          اذهب لمعرض الأجهزة
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Back button */}
      <button
        onClick={() => onNavigate('cart')}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة لسلة الشراء</span>
      </button>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
        {/* Left 3 cols: Delivery and Contact Form */}
        <div className="md:col-span-3 bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-50 pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-pink-500" />
            <span>معلومات الشحن وعنوان التوصيل</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 text-right">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500">اسم المستلم بالكامل <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="أدخل الاسم الرباعي للمستلم..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500">رقم الهاتف للتواصل وتأكيد الشحن <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                placeholder="مثال: 079XXXXXXXX..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none font-mono text-left"
                dir="ltr"
              />
            </div>

            {/* City Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500">المحافظة / المدينة <span className="text-red-500">*</span></label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
                >
                  <option value="إربد">إربد (الموقع الرئيسي)</option>
                  <option value="عمان">عمان</option>
                  <option value="الزرقاء">الزرقاء</option>
                  <option value="المفرق">المفرق</option>
                  <option value="جرش">جرش</option>
                  <option value="عجلون">عجلون</option>
                  <option value="البلقاء">البلقاء</option>
                  <option value="مادبا">مادبا</option>
                  <option value="الكرك">الكرك</option>
                  <option value="الطفيلة">الطفيلة</option>
                  <option value="معان">معان</option>
                  <option value="العقبة">العقبة</option>
                </select>
              </div>

              {/* Delivery Speed / Policy details */}
              <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center gap-2">
                <Truck className="w-5 h-5 text-pink-500 shrink-0" />
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-extrabold">مدة التوصيل والتركيب</p>
                  <p className="text-[11px] font-bold text-gray-700 mt-0.5">خلال 24-48 ساعة عمل كحد أقصى</p>
                </div>
              </div>
            </div>

            {/* Detailed Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500">العنوان بالتفصيل (اسم الشارع، رقم العمارة، بجانب علامة معروفة) <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={3}
                placeholder="مثال: إربد، شارع الهاشمي، عمارة رقم 14، الطابق الثاني، فوق صيدلية..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Optional Delivery/Order notes */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-500">ملاحظات إضافية للطلب أو الشحن (اختياري)</label>
              <textarea
                rows={2}
                placeholder="مثال: يرجى الاتصال قبل التوصيل بنصف ساعة للتأكد من وجود أحد بالمنزل..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>

            {/* Payment Method details */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
              <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-700 mt-0.5 shrink-0">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div className="text-right">
                <p className="font-extrabold text-emerald-900 text-xs sm:text-sm">طريقة الدفع: الدفع نقدًا عند الاستلام (COD)</p>
                <p className="text-[10px] sm:text-xs text-emerald-700 font-medium leading-relaxed mt-1">
                  نوفر لك ميزة المعاينة وفحص كافة الأجهزة الكهربائية في منزلك والتأكد من سلامتها ومطابقتها للمواصفات وكفالتها قبل تسليم الثمن النقدي لمندوب التوصيل لثقة تامة وأمان 100%.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-black text-sm sm:text-base py-4 rounded-xl shadow-lg transition-all text-white ${
                submitting
                  ? 'bg-gray-300 cursor-wait'
                  : 'bg-pink-600 hover:bg-pink-700 hover:scale-101 shadow-pink-100'
              }`}
            >
              {submitting ? 'جاري إرسال وتدوين طلبك في النظام...' : `تأكيد وإتمام الشراء بمبلغ (${totalAmount.toLocaleString()} دينار)`}
            </button>
          </form>
        </div>

        {/* Right 2 cols: Small Sticky Order items preview panel */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-5">
          <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3">ملخص طلبك</h3>

          {/* Cart items list preview */}
          <div className="divide-y divide-gray-50 max-h-[220px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item.product.id} className="py-2.5 flex justify-between gap-3 text-right">
                <div className="flex-grow">
                  <p className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1">{item.product.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 font-bold font-mono">
                    الكمية: {item.quantity} × {item.product.price.toLocaleString()} دينار
                  </p>
                </div>
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-10 h-10 rounded-lg object-cover bg-slate-50 border shrink-0"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          <hr className="border-gray-50" />

          {/* Calculation */}
          <div className="space-y-2.5 text-xs font-bold text-gray-500">
            <div className="flex justify-between">
              <span>إجمالي السلع</span>
              <span className="text-gray-900">{cartTotal.toLocaleString()} دينار</span>
            </div>
            <div className="flex justify-between">
              <span>التوصيل والشحن</span>
              {deliveryFee === 0 ? (
                <span className="text-emerald-600">مجاني</span>
              ) : (
                <span className="text-gray-900">{deliveryFee} دينار</span>
              )}
            </div>
            <hr className="border-gray-50 my-2" />
            <div className="flex justify-between items-center text-sm font-black text-gray-950">
              <span>المجموع الكلي</span>
              <span className="text-base text-pink-600">{totalAmount.toLocaleString()} دينار</span>
            </div>
          </div>

          {/* Guarantee info */}
          <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="text-right">
              <p className="text-[9px] text-gray-400 font-extrabold">ضمان الأجهزة</p>
              <p className="text-[10px] font-bold text-gray-700 leading-relaxed mt-0.5">مشمول بكفالة الموزع والوكيل الحصرية لمدينة إربد والأردن.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
