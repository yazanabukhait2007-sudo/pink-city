import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ordersApi, productsApi, categoriesApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { User, ClipboardList, Package, Layers, Plus, Edit, RefreshCw, Eye, Settings, ShieldAlert, CheckCircle, Barcode, Trash2 } from 'lucide-react';

interface AccountSettingsProps {
  onNavigate: (view: string, params?: any) => void;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  barcode?: string;
  categoryId: number;
  imageUrl: string;
  quantity: number;
  minQuantity: number;
  location?: string;
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

interface Category {
  id: number;
  name: string;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

  // Active control panel tab
  const [activeTab, setActiveTab] = useState<'profile' | 'my-orders' | 'admin-orders' | 'admin-inventory'>('profile');

  // Database lists
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states for adding/editing product
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
    barcode: '',
    categoryId: '',
    imageUrl: '',
    quantity: '',
    minQuantity: '',
    location: '',
  });

  const isStaff = user?.role === 'admin' || user?.role === 'employee';

  useEffect(() => {
    // Set default tab based on user role
    if (isStaff) {
      setActiveTab('admin-orders');
    } else {
      setActiveTab('my-orders');
    }
  }, [user]);

  const loadMyOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.myOrders();
      if (res.success && res.orders) {
        setMyOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load my orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.list();
      if (res.success && res.orders) {
        setAllOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load all orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
      ]);
      if (pRes.success && pRes.products) {
        setProducts(pRes.products);
      }
      if (cRes.success && cRes.categories) {
        setCategories(cRes.categories);
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'my-orders') {
      loadMyOrders();
    } else if (activeTab === 'admin-orders') {
      loadAdminOrders();
    } else if (activeTab === 'admin-inventory') {
      loadInventory();
    }
  }, [activeTab, user]);

  // Handle order status updates (Admin/Employee only)
  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    try {
      const res = await ordersApi.updateStatus(orderId, status);
      if (res.success) {
        showSuccess(`تم تحديث حالة الطلب #${orderId} بنجاح إلى: ${status}`);
        loadAdminOrders();
      } else {
        throw new Error(res.error || 'فشل في تحديث الحالة');
      }
    } catch (err: any) {
      showError(err.message || 'حدث خطأ في تحديث الحالة');
    }
  };

  // Open modal to add product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      sku: '',
      barcode: '',
      categoryId: categories[0]?.id.toString() || '',
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=400',
      quantity: '10',
      minQuantity: '3',
      location: 'مستودع أ',
    });
    setShowProductModal(true);
  };

  // Open modal to edit product
  const handleOpenEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      sku: product.sku,
      barcode: product.barcode || '',
      categoryId: product.categoryId.toString(),
      imageUrl: product.imageUrl,
      quantity: product.quantity.toString(),
      minQuantity: product.minQuantity.toString(),
      location: product.location || '',
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من النظام؟')) return;
    try {
      const res = await productsApi.delete(productId);
      if (res.success) {
        showSuccess('تم حذف المنتج بنجاح من النظام.');
        loadInventory();
      } else {
        throw new Error(res.error || 'فشل الحذف');
      }
    } catch (err: any) {
      showError(err.message || 'حدث خطأ أثناء محاولة حذف المنتج.');
    }
  };

  // Handle submit for add/edit product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, sku, barcode, categoryId, imageUrl, quantity, minQuantity, location } = productForm;
    if (!name || !price || !sku || !categoryId) {
      showError('يرجى ملء الحقول الإلزامية للمنتج (الاسم، السعر، الموديل، القسم)');
      return;
    }

    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        sku,
        barcode: barcode || undefined,
        categoryId: parseInt(categoryId),
        imageUrl,
        quantity: parseInt(quantity) || 0,
        minQuantity: parseInt(minQuantity) || 1,
        location: location || undefined,
      };

      let res;
      if (editingProduct) {
        res = await productsApi.update(editingProduct.id, payload);
      } else {
        res = await productsApi.create(payload);
      }

      if (res.success) {
        showSuccess(editingProduct ? 'تم تحديث بيانات المنتج بنجاح!' : 'تمت إضافة المنتج الجديد للنظام!');
        setShowProductModal(false);
        loadInventory();
      } else {
        throw new Error(res.error || 'فشل الحفظ');
      }
    } catch (err: any) {
      showError(err.message || 'حدث خطأ في عملية حفظ بيانات المنتج.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white border border-gray-100 rounded-3xl shadow-sm" style={{ direction: 'rtl' }}>
        <ShieldAlert className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-black text-gray-900 mb-2">يرجى تسجيل الدخول أولاً</h2>
        <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
          يتطلب الدخول إلى لوحة التحكم الخاصة بك تسجيل الدخول المسبق لحسابك المعتمد.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md transition-all"
        >
          انتقل لتسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* 1. Header Profile Banner */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center md:justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-right">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center border border-pink-100 shrink-0">
            <User className="w-9 h-9" />
          </div>
          <div>
            <div className="flex flex-col md:flex-row items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-gray-900">{user.name}</h1>
              <span className="text-[10px] font-black bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full shrink-0">
                {user.role === 'admin' ? 'مدير النظام' : user.role === 'employee' ? 'موظف مبيعات' : 'عميل المعرض'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{user.email} • {user.phone}</p>
          </div>
        </div>
      </section>

      {/* 2. Menu Navigation Tabs */}
      <div className="flex border-b border-gray-100 gap-1.5 overflow-x-auto pb-1">
        {isStaff && (
          <>
            <button
              onClick={() => setActiveTab('admin-orders')}
              className={`py-3 px-5 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all border-b-2 shrink-0 ${
                activeTab === 'admin-orders'
                  ? 'border-pink-500 text-pink-600 bg-pink-50/50'
                  : 'border-transparent text-gray-500 hover:text-pink-600 hover:bg-gray-50'
              }`}
            >
              <ClipboardList className="w-4 h-4 inline-block ml-2 shrink-0" />
              إدارة طلبات العملاء
            </button>
            <button
              onClick={() => setActiveTab('admin-inventory')}
              className={`py-3 px-5 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all border-b-2 shrink-0 ${
                activeTab === 'admin-inventory'
                  ? 'border-pink-500 text-pink-600 bg-pink-50/50'
                  : 'border-transparent text-gray-500 hover:text-pink-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4 inline-block ml-2 shrink-0" />
              مستودع الأجهزة والمخزون
            </button>
          </>
        )}

        {!isStaff && (
          <button
            onClick={() => setActiveTab('my-orders')}
            className={`py-3 px-5 text-xs sm:text-sm font-extrabold rounded-t-xl transition-all border-b-2 shrink-0 ${
              activeTab === 'my-orders'
                ? 'border-pink-500 text-pink-600 bg-pink-50/50'
                : 'border-transparent text-gray-500 hover:text-pink-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline-block ml-2 shrink-0" />
            طلبياتي السابقة
          </button>
        )}
      </div>

      {/* 3. Main Content Blocks based on tabs */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm">
        {loading && (
          <div className="p-12 text-center animate-pulse text-gray-400 font-bold">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-pink-500" />
            <span>جاري تحميل بيانات لوحة التحكم...</span>
          </div>
        )}

        {/* CUSTOMER TAB: Previous orders list */}
        {!loading && activeTab === 'my-orders' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3 text-right">أرشيف طلبياتك</h3>
            {myOrders.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-8 font-bold">لم تقم بإجراء أي طلبيات شراء بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-extrabold text-[11px] uppercase bg-gray-50/50">
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">تاريخ الطلب</th>
                      <th className="p-3">العنوان</th>
                      <th className="p-3">المجموع الكلي</th>
                      <th className="p-3">الحالة الحالية</th>
                      <th className="p-3 text-center">أكشن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                    {myOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-extrabold text-pink-600">#{ord.id}</td>
                        <td className="p-3 font-mono">{new Date(ord.createdAt).toLocaleDateString('ar-JO')}</td>
                        <td className="p-3 max-w-[200px] truncate">{ord.city} - {ord.address}</td>
                        <td className="p-3 font-extrabold text-gray-950">{ord.totalAmount.toLocaleString()} دينار</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'PREPARING' ? 'bg-indigo-100 text-indigo-800' :
                            ord.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'DELIVERED' ? 'تم التسليم' :
                             ord.status === 'SHIPPED' ? 'جاري التوصيل' :
                             ord.status === 'PREPARING' ? 'جاري التجهيز' :
                             ord.status === 'CANCELLED' ? 'تم الإلغاء' : 'قيد المراجعة'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord.id })}
                            className="text-[10px] sm:text-xs font-black text-pink-600 hover:bg-pink-100 px-3 py-1.5 rounded-lg border border-pink-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 inline-block ml-1 shrink-0" />
                            تتبع مباشر
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB: ALL ORDERS dashboard */}
        {!loading && activeTab === 'admin-orders' && (
          <div className="space-y-6">
            <h3 className="font-extrabold text-gray-900 text-base border-b border-gray-50 pb-3 text-right">إدارة طلبيات المتجر الشاملة</h3>
            {allOrders.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-8 font-bold">لا يوجد طلبيات مسجلة في النظام بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-extrabold text-[11px] uppercase bg-gray-50/50">
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">العميل والمستلم</th>
                      <th className="p-3">تفاصيل الموقع</th>
                      <th className="p-3">إجمالي الفاتورة</th>
                      <th className="p-3">الحالة الحالية</th>
                      <th className="p-3 text-center">تحديث الحالة</th>
                      <th className="p-3 text-center">عرض</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                    {allOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-extrabold text-pink-600">#{ord.id}</td>
                        <td className="p-3">
                          <p className="font-bold text-gray-900">{ord.customerName}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono" dir="ltr">{ord.customerPhone}</p>
                        </td>
                        <td className="p-3">
                          <p className="text-gray-800">{ord.city}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 max-w-[150px] truncate">{ord.address}</p>
                        </td>
                        <td className="p-3 font-extrabold text-gray-950">{ord.totalAmount.toLocaleString()} دينار</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            ord.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            ord.status === 'PREPARING' ? 'bg-indigo-100 text-indigo-800' :
                            ord.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'DELIVERED' ? 'تم التسليم' :
                             ord.status === 'SHIPPED' ? 'جاري التوصيل' :
                             ord.status === 'PREPARING' ? 'جاري التجهيز' :
                             ord.status === 'CANCELLED' ? 'تم الإلغاء' : 'قيد المراجعة'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                            className="px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:border-pink-500"
                          >
                            <option value="PENDING">قيد المراجعة</option>
                            <option value="PREPARING">جاري التجهيز</option>
                            <option value="SHIPPED">جاري التوصيل</option>
                            <option value="DELIVERED">تم التسليم</option>
                            <option value="CANCELLED">تم الإلغاء</option>
                          </select>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => onNavigate('order-tracking', { orderId: ord.id })}
                            className="p-1.5 text-gray-400 hover:text-pink-600 rounded hover:bg-pink-50 transition-colors"
                            title="عرض وتتبع بالتفصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* STAFF TAB: ALL PRODUCTS / INVENTORY dashboard */}
        {!loading && activeTab === 'admin-inventory' && (
          <div className="space-y-6">
            <div className="flex sm:items-center justify-between gap-4 border-b border-gray-50 pb-3 flex-col sm:flex-row">
              <h3 className="font-extrabold text-gray-900 text-base text-right">إدارة الأجهزة والمخزون التفصيلي</h3>
              
              <button
                onClick={handleOpenAddProduct}
                className="bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs sm:text-sm py-2 px-4 rounded-xl flex items-center gap-1.5 shrink-0 shadow-md shadow-pink-100"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة جهاز جديد للنظام</span>
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-center text-xs sm:text-sm text-gray-400 py-8 font-bold">لا يوجد أجهزة مضافة للنظام بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-extrabold text-[11px] bg-gray-50/50">
                      <th className="p-3">صورة الجهاز</th>
                      <th className="p-3">اسم وموديل الجهاز</th>
                      <th className="p-3">السعر النقدي</th>
                      <th className="p-3">القسم</th>
                      <th className="p-3">الموقع التفصيلي</th>
                      <th className="p-3 text-center">المخزون المتوفر</th>
                      <th className="p-3 text-center">تعديل / حذف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-semibold text-gray-700">
                    {products.map((p) => {
                      const isOutOfStock = p.quantity <= 0;
                      const isLowStock = p.quantity > 0 && p.quantity <= p.minQuantity;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 shrink-0">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-11 h-11 rounded-lg object-cover bg-slate-50 border"
                              referrerPolicy="no-referrer"
                            />
                          </td>
                          <td className="p-3">
                            <p className="font-black text-gray-900">{p.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {p.sku}</p>
                          </td>
                          <td className="p-3 font-extrabold text-gray-950">{p.price.toLocaleString()} دينار</td>
                          <td className="p-3">
                            <span className="text-xs bg-slate-100 text-slate-700 py-0.5 px-2.5 rounded-full">
                              {categories.find((c) => c.id === p.categoryId)?.name || `قسم #${p.categoryId}`}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-gray-500">
                            {p.location || <span className="text-gray-300 font-medium">غير محدد</span>}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-black inline-block text-center min-w-[70px] ${
                              isOutOfStock ? 'bg-red-50 text-red-700 border border-red-100' :
                              isLowStock ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            }`}>
                              {p.quantity} قطع
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                title="تعديل الجهاز"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                title="حذف الجهاز نهائياً"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. ADD / EDIT PRODUCT MODAL (Admin/Employee only) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <h3 className="font-extrabold text-gray-900 text-base sm:text-lg border-b border-gray-100 pb-3 text-right">
              {editingProduct ? `تعديل بيانات الجهاز: ${editingProduct.name}` : 'إضافة جهاز كهربائي جديد للنظام'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-right">
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500">اسم وموديل الجهاز <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="مثال: غسالة بوش 9 كيلو فضي..."
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* SKU & Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">رمز الموديل (SKU) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: BOSCH-WASH-9"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">الباركود الرقمي</label>
                  <input
                    type="text"
                    placeholder="رمز الباركود..."
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">السعر النقدي (دينار) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="السعر النقدي بالدينار..."
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">القسم الرئيسي <span className="text-red-500">*</span></label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantity Stock & Min Quantity warning level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">المخزون المتوفر بالمعرض</label>
                  <input
                    type="number"
                    required
                    placeholder="عدد الحبات..."
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">الحد الأدنى للإنذار بالنقص</label>
                  <input
                    type="number"
                    required
                    placeholder="مثال: 3 قطع..."
                    value={productForm.minQuantity}
                    onChange={(e) => setProductForm({ ...productForm, minQuantity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Warehouse Location & Image URL */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">موقع عرض السلعة</label>
                  <input
                    type="text"
                    placeholder="مثال: ممر أ - الرف 3..."
                    value={productForm.location}
                    onChange={(e) => setProductForm({ ...productForm, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500">رابط صورة السلعة</label>
                  <input
                    type="text"
                    required
                    placeholder="رابط الصورة المباشر..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-500">مواصفات وتفاصيل الجهاز الفنية</label>
                <textarea
                  rows={3}
                  placeholder="مواصفات الجهاز، الكفالة، الماركة..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 focus:border-pink-500 focus:outline-none"
                />
              </div>

              {/* Form buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-grow bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow-md"
                >
                  حفظ السلعة في النظام
                </button>
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-sm rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
