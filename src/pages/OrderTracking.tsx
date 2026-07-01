import React, { useState, useEffect } from 'react';
import { ordersApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { PackageCheck, MapPin, Phone, Calendar, Clock, ShoppingBag, Truck, Check, RefreshCw } from 'lucide-react';

interface OrderTrackingProps {
  orderId: number;
  onNavigate: (view: string, params?: any) => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await ordersApi.get(orderId);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        showToast('تعذر العثور على الطلب المطلوب.', 'error');
        onNavigate('home');
      }
    } catch (err: any) {
      console.error("Error loading order:", err);
      showToast(err.message || 'حدث خطأ أثناء جلب تفاصيل الطلب.', 'error');
      onNavigate('home');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm animate-pulse space-y-4 max-w-xl mx-auto">
        <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
        <p className="text-sm text-gray-500 font-bold">جاري تحميل وتتبع حالة طلبك...</p>
      </div>
    );
  }

  if (!order) return null;

  // Status mapping
  const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
  const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    shipped: 'جاري التوصيل',
    delivered: 'تم التسليم'
  };
  const statusDescriptions: Record<string, string> = {
    pending: 'تم استلام طلبك وبانتظار تأكيد خدمة العملاء هاتفياً.',
    confirmed: 'تم مراجعة وتأكيد طلبك وتجهيز الأجهزة من المستودع للتوصيل.',
    shipped: 'خرج السائق لتوصيل طلبك إلى عنوانك المسجل الآن.',
    delivered: 'تم تسليم وتركيب الأجهزة الكهربائية بنجاح. شكراً لطلبك!'
  };

  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Page Title & Back */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-right">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">تتبع الطلب #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-1">تتبع رحلة أجهزتك الكهربائية من معرضنا وحتى باب منزلك.</p>
        </div>
        <button
          onClick={() => onNavigate('account')}
          className="px-4 py-2 bg-white border border-gray-200 hover:border-brand-primary/20 text-gray-700 hover:text-brand-primary rounded-xl font-bold text-xs transition-all"
        >
          سجل طلباتي السابقة
        </button>
      </div>

      {/* Main Status Showcase Container */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-8">
        {/* Visual Progress Bar (pending -> confirmed -> shipped -> delivered) */}
        <div className="relative py-4">
          {/* Horizontal Connector Line for Desktop */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-500"
              style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
            />
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {statuses.map((status, index) => {
              const isCompleted = index < currentStatusIndex;
              const isActive = index === currentStatusIndex;
              const isPending = index > currentStatusIndex;

              return (
                <div key={status} className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 text-right md:text-center relative">
                  {/* Circle Indicator */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shrink-0 z-10 ${
                      isActive
                        ? 'bg-brand-primary border-brand-secondary text-white ring-4 ring-brand-primary/10 shadow-lg'
                        : isCompleted
                        ? 'bg-brand-primary border-brand-primary text-white'
                        : 'bg-white border-gray-100 text-gray-300'
                    }`}
                  >
                    {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : <span>{index + 1}</span>}
                  </div>

                  {/* Labels and description */}
                  <div className="flex flex-col">
                    <span
                      className={`text-sm font-extrabold ${
                        isActive
                          ? 'text-brand-primary'
                          : isCompleted
                          ? 'text-gray-800'
                          : 'text-gray-400'
                      }`}
                    >
                      {statusLabels[status]}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 md:hidden max-w-xs">
                      {statusDescriptions[status]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card of Current Status */}
        <div className="bg-brand-light/40 border border-brand-secondary/20 p-5 rounded-2xl flex items-start gap-4">
          <div className="p-3 bg-brand-primary text-white rounded-xl shadow-md shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-gray-900 text-sm">
              الحالة الحالية: <span className="text-brand-primary">{statusLabels[order.status]}</span>
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
              {statusDescriptions[order.status]}
            </p>
          </div>
        </div>

        {/* Order Details & Summary Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-100">
          {/* Shipping addresses details */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base">تفاصيل التوصيل</h3>
            <ul className="space-y-3.5 text-xs text-gray-600">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-brand-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800">عنوان المستلم بالتفصيل:</p>
                  <p className="mt-1 leading-relaxed">{order.address}</p>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 inline ml-1.5">هاتف التواصل:</p>
                  <span dir="ltr">{order.phone}</span>
                </div>
              </li>
              <li className="flex items-center gap-2.5">
                <Calendar className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 inline ml-1.5">تاريخ تسجيل الطلب:</p>
                  <span>{new Date(order.createdAt).toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </li>
              {order.notes && (
                <li className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  <p className="font-bold text-gray-800 shrink-0">ملاحظاتك:</p>
                  <p className="mr-1.5 leading-relaxed">{order.notes}</p>
                </li>
              )}
            </ul>
          </div>

          {/* Items checklist */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-base">ملخص الأجهزة والأثمان</h3>
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-2xl p-4 bg-slate-50/50">
              {order.items?.map((item: any) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-gray-800">{item.product?.name}</span>
                    <span className="text-gray-400 mr-2">({item.quantity} قطع)</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(parseFloat(item.price as string) * item.quantity).toFixed(2)} د.أ
                  </span>
                </div>
              ))}
              
              <div className="pt-3 mt-3 flex justify-between items-center text-sm border-t border-gray-200">
                <span className="font-bold text-gray-800">الإجمالي النهائي المدفوع</span>
                <span className="font-black text-brand-primary text-base">
                  {parseFloat(order.totalAmount as string).toFixed(2)} دينار أردني
                </span>
              </div>
            </div>
            
            <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3.5 rounded-xl text-center text-xs font-bold">
              توصيل وتركيب مجاني مكفول من معرضنا بشارع الهاشمي
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
