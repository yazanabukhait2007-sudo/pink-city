import React, { useState, useEffect } from 'react';
import { ordersApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Search, MapPin, Phone, User, Calendar, ClipboardList, CheckCircle2, CircleDot, AlertTriangle, ArrowLeft } from 'lucide-react';

interface OrderTrackingProps {
  initialOrderId?: number;
  onNavigate: (view: string, params?: any) => void;
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    name: string;
    imageUrl: string;
    sku: string;
  };
}

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  city: string;
  address: string;
  notes?: string;
  status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ initialOrderId, onNavigate }) => {
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId ? initialOrderId.toString() : '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { showError } = useToast();

  const fetchOrderDetails = async (id: number) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await ordersApi.get(id);
      if (res.success && res.order) {
        setOrder(res.order);
      } else {
        setOrder(null);
        showError('لم نجد أي طلب مسجل بهذا الرقم. يرجى التأكد من رقم الطلب.');
      }
    } catch (err) {
      console.error('Failed to track order:', err);
      setOrder(null);
      showError('عذراً، حدث خطأ في تتبع الطلب.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      fetchOrderDetails(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(orderIdInput.trim());
    if (isNaN(id)) {
      showError('يرجى إدخال رقم طلب صحيح (رقم فقط)');
      return;
    }
    fetchOrderDetails(id);
  };

  // Status mapping to localized labels & styling
  const getStatusStepInfo = (status: Order['status']) => {
    const lowerStatus = status.toLowerCase();
    const steps = [
      { key: 'pending', label: 'قيد المراجعة', desc: 'تم استلام الطلب وتجري مراجعته من فريق المبيعات' },
      { key: 'confirmed', label: 'جاري التجهيز', desc: 'يتم الآن فحص وتجهيز الأجهزة وتعبئتها من مستودعاتنا' },
      { key: 'shipped', label: 'جاري التوصيل', desc: 'تم تسليم الأجهزة للمندوب وهي في طريقها إليك الآن' },
      { key: 'delivered', label: 'تم التسليم', desc: 'تم تسليم الأجهزة بنجاح والتأكد منها واستلام الثمن' },
    ];

    if (lowerStatus === 'cancelled') {
      return {
        isCancelled: true,
        steps: [{ key: 'cancelled', label: 'تم إلغاء الطلب', desc: 'تم إلغاء هذا الطلب من قبل المشتري أو الإدارة', isCompleted: false, isActive: true, isPending: false }],
      };
    }

    // Find index of current status
    const currentIndex = steps.findIndex((step) => step.key === lowerStatus);
    
    return {
      isCancelled: false,
      steps: steps.map((step, idx) => ({
        ...step,
        isCompleted: idx < currentIndex,
        isActive: idx === currentIndex,
        isPending: idx > currentIndex,
      })),
    };
  };

  const stepInfo = order ? getStatusStepInfo(order.status) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Search Bar section */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5 text-center">
        <div className="max-w-md mx-auto space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-gray-950">تتبع حالة طلبك بالتفصيل</h1>
          <p className="text-xs sm:text-sm text-gray-500">أدخل رقم طلبك الكهربائي لمعرفة موعد تسليمه والتقدم الفعلي للشحن</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
          <input
            type="text"
            required
            placeholder="مثال: 10025..."
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            className="flex-grow pl-4 pr-5 py-3 border border-gray-200 rounded-xl text-sm font-black text-gray-700 bg-white focus:border-pink-500 focus:outline-none text-left font-mono"
            dir="ltr"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white text-sm font-extrabold rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'جاري التتبع...' : 'تتبع الآن'}</span>
          </button>
        </form>
      </div>

      {/* Result Display section */}
      {loading ? (
        <div className="animate-pulse bg-white border border-gray-100 rounded-3xl p-8 space-y-6">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4" />
          <div className="h-12 bg-gray-200 rounded-lg" />
          <div className="h-32 bg-gray-200 rounded-lg" />
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Order Meta details banner */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-right">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-extrabold">رقم الطلب</p>
              <p className="font-extrabold text-lg text-pink-600">#{order.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-extrabold">تاريخ الطلب والتدوين</p>
              <p className="font-bold text-gray-800 text-sm sm:text-base flex items-center gap-1.5 justify-end">
                <Calendar className="w-4 h-4 text-pink-500" />
                <span>{new Date(order.createdAt).toLocaleDateString('ar-JO', { dateStyle: 'long' })}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 font-extrabold">إجمالي الفاتورة الصافية</p>
              <p className="font-black text-lg text-gray-950">{order.totalAmount.toLocaleString()} <span className="text-xs text-pink-500 font-bold">دينار</span></p>
            </div>
          </div>

          {/* Stepper Status Progression */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3">حالة تقدم الشحن</h3>

            {stepInfo?.isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-900">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
                <div className="text-right">
                  <p className="font-bold text-sm">تم إلغاء هذا الطلب</p>
                  <p className="text-xs text-red-600 leading-relaxed mt-0.5">{stepInfo.steps[0].desc}</p>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col gap-6 pl-2 pr-6 border-r border-gray-100">
                {stepInfo?.steps.map((step, idx) => (
                  <div key={step.key} className="relative flex items-start gap-4">
                    {/* Circle icon placement */}
                    <div className="absolute right-0 top-1 translate-x-[25px] z-10 shrink-0">
                      {step.isCompleted ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      ) : step.isActive ? (
                        <div className="w-6 h-6 rounded-full bg-pink-500 border-4 border-white flex items-center justify-center text-white animate-pulse">
                          <CircleDot className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-4 border-white" />
                      )}
                    </div>

                    <div className="text-right">
                      <h4 className={`font-black text-sm sm:text-base ${
                        step.isActive ? 'text-pink-600' : step.isCompleted ? 'text-emerald-600' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1 sm:max-w-md leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery destination details & ordered items list summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Delivery address details */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 text-right">
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-50 pb-2.5">وجهة ومعلومات التسليم</h3>
              
              <ul className="space-y-3.5 text-xs sm:text-sm">
                <li className="flex items-center gap-2.5 justify-end">
                  <span className="font-bold text-gray-700">{order.customerName}</span>
                  <User className="w-4 h-4 text-gray-400 shrink-0" />
                </li>
                <li className="flex items-center gap-2.5 justify-end">
                  <span className="font-mono font-bold text-gray-700" dir="ltr">{order.customerPhone}</span>
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                </li>
                <li className="flex items-start gap-2.5 justify-end">
                  <span className="text-gray-600 leading-relaxed text-right">{order.city} - {order.address}</span>
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                </li>
              </ul>
              {order.notes && (
                <div className="p-3 bg-pink-50/50 border border-pink-100/30 rounded-xl mt-2">
                  <p className="text-[10px] text-pink-500 font-extrabold">ملاحظات التوصيل المدونة:</p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Ordered items preview list */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-900 text-sm border-b border-gray-50 pb-2.5 text-right">قائمة الأجهزة في الفاتورة</h3>

              <div className="divide-y divide-gray-50">
                {order.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-right">
                    <div className="flex-grow">
                      <p className="font-bold text-gray-800 text-xs sm:text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5 font-mono">
                        الكمية: {item.quantity} × {item.price.toLocaleString()} دينار
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
            </div>
          </div>
        </div>
      ) : searched ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center flex flex-col items-center max-w-md mx-auto">
          <div className="p-3.5 bg-rose-50 text-rose-500 rounded-full mb-4">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-extrabold text-gray-900 text-base mb-1.5">تعذر العثور على طلبك</h3>
          <p className="text-gray-500 text-xs sm:text-sm max-w-xs mt-1 leading-relaxed">
            تأكد من رقم المعرف المدخل بشكل صحيح (على سبيل المثال: 10001). في حال بقاء المشكلة، تواصل مع خدمة العملاء للمعرض لمساعدتك الفورية.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default OrderTracking;
