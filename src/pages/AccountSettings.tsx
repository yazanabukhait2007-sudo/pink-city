import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersApi } from '../utils/api';
import { 
  User, 
  Phone, 
  Mail, 
  ShieldAlert, 
  ReceiptText, 
  Calendar, 
  Compass, 
  RefreshCw, 
  PackageCheck, 
  AlertCircle,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';

interface AccountSettingsProps {
  onNavigate: (view: string, params?: any) => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Management State
  const isAdminOrEmployee = user?.role === 'admin' || user?.role === 'employee';
  const [viewMode, setViewMode] = useState<'clientOrders' | 'myOrders'>(
    isAdminOrEmployee ? 'clientOrders' : 'myOrders'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      showToast('يرجى تسجيل الدخول لعرض حسابك.', 'info');
      onNavigate('login');
      return;
    }

    async function loadOrders() {
      try {
        setLoadingOrders(true);
        const res = viewMode === 'clientOrders' && isAdminOrEmployee
          ? await ordersApi.list()
          : await ordersApi.myOrders();
          
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err: any) {
        console.error("Error loading orders:", err);
        showToast(err.message || 'حدث خطأ أثناء تحميل سجل الطلبات.', 'error');
      } finally {
        setLoadingOrders(false);
      }
    }
    loadOrders();
  }, [user, viewMode, isAdminOrEmployee]);

  if (!user) return null;

  // Update order status handler
  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const res = await ordersApi.updateStatus(orderId, newStatus);
      if (res.success) {
        showToast(`تم تحديث حالة الطلب #${orderId} بنجاح إلى: ${getStatusLabel(newStatus)}`, 'success');
        setOrders(prevOrders => 
          prevOrders.map(ord => ord.id === orderId ? { ...ord, status: newStatus } : ord)
        );
      }
    } catch (err: any) {
      console.error("Error updating order status:", err);
      showToast(err.message || 'حدث خطأ أثناء تحديث حالة الطلب.', 'error');
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            قيد الانتظار
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            تم التأكيد
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 border border-pink-200 animate-pulse">
            جاري التوصيل
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            تم التسليم
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            ملغي
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'confirmed': return 'تم التأكيد';
      case 'shipped': return 'جاري التوصيل';
      case 'delivered': return 'تم التسليم';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  // Statistics calculation for admin overview
  const stats = useMemo(() => {
    if (!isAdminOrEmployee || viewMode !== 'clientOrders') return null;
    
    const totalOrdersCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const activeCount = orders.filter(o => o.status === 'confirmed' || o.status === 'shipped').length;
    const completedCount = orders.filter(o => o.status === 'delivered').length;
    
    const totalSales = orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
      .reduce((sum, o) => sum + parseFloat(o.totalPrice || o.totalAmount || 0), 0);
      
    return {
      totalOrdersCount,
      pendingCount,
      activeCount,
      completedCount,
      totalSales
    };
  }, [orders, viewMode, isAdminOrEmployee]);

  // Client-side filtering & searching
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      // 1. Filter by Status
      if (statusFilter !== 'all' && ord.status !== statusFilter) {
        return false;
      }
      
      // 2. Filter by Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const orderIdMatch = String(ord.id).includes(query);
        const customerNameMatch = ord.user?.name?.toLowerCase().includes(query);
        const customerPhoneMatch = ord.phone?.includes(query) || ord.user?.phone?.includes(query);
        const addressMatch = ord.address?.toLowerCase().includes(query);
        
        return orderIdMatch || customerNameMatch || customerPhoneMatch || addressMatch;
      }
      
      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="text-right flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">حسابي الشخصي</h1>
          <p className="text-sm text-gray-500 mt-1">مرحباً {user.name}، تصفح بيانات حسابك وتتبع طلباتك السابقة.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-xs font-bold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-xl transition-all"
        >
          تسجيل الخروج
        </button>
      </div>

      {/* Admin Statistics Section */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-right">
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 block">إجمالي المبيعات المؤكدة</span>
            <div className="flex items-center gap-2 justify-end">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
              <span className="font-black text-lg text-emerald-600">
                {stats.totalSales.toFixed(2)} د.أ
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 block">طلبات قيد الانتظار</span>
            <div className="flex items-center gap-2 justify-end">
              <Clock className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <span className="font-black text-lg text-amber-600">
                {stats.pendingCount} طلبات
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 block">جاري التجهيز والتوصيل</span>
            <div className="flex items-center gap-2 justify-end">
              <RefreshCw className="w-4.5 h-4.5 text-blue-500" />
              <span className="font-black text-lg text-blue-600">
                {stats.activeCount} طلبات
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 block">إجمالي الطلبات المستلمة</span>
            <div className="flex items-center gap-2 justify-end">
              <CheckCircle2 className="w-4.5 h-4.5 text-brand-primary" />
              <span className="font-black text-lg text-gray-800">
                {stats.totalOrdersCount}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* User profile cards (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-primary" />
              البيانات الشخصية
            </h3>

            <div className="space-y-4 text-sm text-right">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 mb-1">الاسم الكامل</span>
                <span className="font-extrabold text-gray-800">{user.name}</span>
              </div>
              
              {user.email && (
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 mb-1">البريد الإلكتروني</span>
                  <span className="font-semibold text-gray-600">{user.email}</span>
                </div>
              )}

              {user.phone && (
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 mb-1">رقم الهاتف للتواصل</span>
                  <span className="font-semibold text-gray-600" dir="ltr">{user.phone}</span>
                </div>
              )}

              <div>
                <span className="block text-[10px] font-bold text-gray-400 mb-1">رتبة الحساب</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold bg-brand-light text-brand-primary border border-brand-secondary/30">
                  {user.role === 'admin' ? 'مدير المعرض' : user.role === 'employee' ? 'موظف المعرض' : 'عميل زبون'}
                </span>
              </div>
            </div>
          </div>

          {/* Exhibition Support card */}
          <div className="bg-slate-900 text-gray-400 rounded-3xl p-6 border border-gray-800 space-y-4 text-right">
            <h4 className="text-white font-extrabold text-sm flex items-center gap-2 justify-end">
              <ShieldAlert className="w-5 h-5 text-brand-primary" />
              دعم ومساعدة الإدارة
            </h4>
            <p className="text-xs leading-relaxed">
              يسعد موظفو معرض المدينة الوردية في إربد - شارع الهاشمي بخدمتكم وتعديل أو إلغاء الطلبات طيلة ساعات الدوام الرسمي.
            </p>
            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-white font-bold">
              <span>هاتف المعرض الدائم:</span>
              <span dir="ltr" className="text-brand-secondary">+962 7 9000 0000</span>
            </div>
          </div>
        </div>

        {/* History of orders (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Header & Tabs */}
          <div className="border-b border-gray-100 pb-4 space-y-4 text-right">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 justify-end">
                <ReceiptText className="w-5.5 h-5.5 text-brand-primary" />
                <span>إدارة طلبات المعرض الكهربائية</span>
              </h3>
              
              {/* Tabs Toggle if Admin/Employee */}
              {isAdminOrEmployee && (
                <div className="inline-flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('clientOrders')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === 'clientOrders'
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    طلبات العملاء الواردة
                  </button>
                  <button
                    onClick={() => setViewMode('myOrders')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      viewMode === 'myOrders'
                        ? 'bg-white text-brand-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    طلباتي الشخصية
                  </button>
                </div>
              )}
            </div>

            {/* Filter and Search controls for Administrator/Employee */}
            {viewMode === 'clientOrders' && isAdminOrEmployee && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-8 relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث برقم الطلب، اسم العميل، هاتفه أو عنوانه..."
                    className="w-full text-xs bg-slate-50 border border-gray-200 text-gray-800 rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all text-right"
                  />
                </div>
                
                <div className="sm:col-span-4 relative">
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <Filter className="w-4 h-4" />
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-gray-200 text-gray-700 rounded-xl pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer text-right appearance-none font-bold"
                  >
                    <option value="all">كل الحالات الواردة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="confirmed">تم التأكيد</option>
                    <option value="shipped">جاري التوصيل</option>
                    <option value="delivered">تم التسليم</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {loadingOrders ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <RefreshCw className="w-6 h-6 text-brand-primary animate-spin" />
              <p className="text-xs text-gray-400 font-bold">جاري جلب قائمة طلبات المعرض من قاعدة البيانات...</p>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredOrders.map((ord) => {
                const totalAmount = parseFloat(ord.totalPrice || ord.totalAmount || 0);
                return (
                  <div key={ord.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5 text-right">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 justify-start flex-wrap">
                        <span className="font-extrabold text-gray-900 text-sm">طلب رقم #{ord.id}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 justify-start">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(ord.createdAt).toLocaleDateString('ar-JO')}</span>
                        <span className="text-gray-300">|</span>
                        <span>{ord.items?.length || 0} أجهزة كهربائية</span>
                      </p>

                      <p className="text-xs font-semibold text-gray-600 max-w-xl leading-relaxed">
                        العنوان المسجل: {ord.address}
                      </p>

                      {/* Customer Info (Admin only details) */}
                      {viewMode === 'clientOrders' && (
                        <div className="bg-slate-50/70 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1.5 mt-2 max-w-xl">
                          <p className="font-bold text-gray-800">بيانات العميل المشتري:</p>
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span>الاسم: {ord.user?.name || 'مشتري زائر'}</span>
                            <span dir="ltr">الهاتف: {ord.phone || ord.user?.phone || 'غير متوفر'}</span>
                          </div>
                          {ord.notes && (
                            <p className="text-gray-500 border-t border-dashed border-gray-200 pt-1.5 mt-1.5">
                              <strong>ملاحظات العميل:</strong> {ord.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 shrink-0">
                      {/* Pricing block */}
                      <div className="flex flex-col text-right md:text-left">
                        <span className="text-[10px] text-gray-400 text-right md:text-left">القيمة الإجمالية</span>
                        <span className="font-black text-brand-primary text-sm">
                          {totalAmount.toFixed(2)} د.أ
                        </span>
                      </div>

                      {/* Admin Quick Status Dropdown vs Customer Track Button */}
                      {viewMode === 'clientOrders' && isAdminOrEmployee ? (
                        <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-[10px] font-bold text-gray-400">تحديث الحالة:</span>
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                              className="text-xs font-bold bg-slate-50 border border-gray-200 text-gray-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="confirmed">تم التأكيد</option>
                              <option value="shipped">جاري التوصيل</option>
                              <option value="delivered">تم التسليم</option>
                              <option value="cancelled">ملغي</option>
                            </select>
                          </div>
                          <button
                            onClick={() => onNavigate('order_tracking', { id: ord.id })}
                            className="text-[10px] text-gray-400 hover:text-brand-primary font-bold text-left transition-colors"
                          >
                            عرض تفاصيل السلّة والتتبع ←
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onNavigate('order_tracking', { id: ord.id })}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-brand-secondary/10 border border-gray-100 hover:border-brand-primary/20 text-gray-700 hover:text-brand-primary rounded-xl text-xs font-bold transition-all"
                        >
                          <Compass className="w-4 h-4" />
                          <span>تتبع الطلب</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700 mb-1">لا توجد طلبات</p>
              <p className="text-xs max-w-sm mx-auto">
                {viewMode === 'clientOrders' 
                  ? 'لا توجد طلبات عملاء مطابقة للبحث أو الفلترة المحددة في النظام حالياً.' 
                  : 'لم تقم بتسجيل أي طلب أجهزة كهربائية من حسابك الشخصي حتى الآن.'}
              </p>
              {viewMode !== 'clientOrders' && (
                <button
                  onClick={() => onNavigate('products')}
                  className="mt-6 px-6 py-2.5 bg-brand-primary hover:bg-brand-dark text-white rounded-xl text-xs font-bold transition-all"
                >
                  اذهب لمعرض المنتجات
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

