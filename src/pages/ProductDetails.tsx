import React, { useState, useEffect } from 'react';
import { productsApi } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, ShoppingCart, ShieldCheck, Heart, Share2, Package, Tag, Layers, CheckCircle, PackageX, AlertTriangle, ChevronRight, HelpCircle } from 'lucide-react';

interface ProductDetailsProps {
  productId: number;
  onNavigate: (view: string, params?: any) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onNavigate }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await productsApi.get(productId);
        if (res.success && res.product) {
          setProduct(res.product);
        } else {
          showToast('فشل تحميل تفاصيل المنتج المطلوب.', 'error');
          onNavigate('products');
        }
      } catch (err: any) {
        console.error("Error loading product details:", err);
        showToast(err.message || 'حدث خطأ غير متوقع أثناء جلب بيانات المنتج.', 'error');
        onNavigate('products');
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-white border border-gray-100 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded-lg" />
            <div className="h-6 w-1/4 bg-gray-200 rounded-lg" />
            <div className="h-24 w-full bg-gray-200 rounded-lg" />
            <div className="h-12 w-1/2 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const formattedPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const stock = product.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= (product.inventory?.minQuantity ?? 5);

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity((q) => q + 1);
    } else {
      showToast(`عذراً، الكمية المحددة هي الحد الأقصى المتوفر في المخزن حالياً.`, 'info');
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) {
      showToast('هذا المنتج غير متوفر للطلب.', 'error');
      return;
    }
    addItem(product, quantity);
  };

  const getStockLabel = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
          <PackageX className="w-4 h-4" />
          غير متوفر في المخزن حالياً
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
          <AlertTriangle className="w-4 h-4 animate-bounce" />
          كمية محدودة! متبقي {stock} قطع فقط في المعرض
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
        <CheckCircle className="w-4 h-4" />
        متوفر وجاهز للتوصيل الفوري ({stock} قطعة)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('products')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-primary transition-all"
        >
          <ArrowRight className="w-4.5 h-4.5" />
          <span>العودة للمعرض</span>
        </button>

        <span className="text-xs font-medium text-gray-400">
          الرئيسية <ChevronRight className="w-3 h-3 inline mx-1" /> الأجهزة <ChevronRight className="w-3 h-3 inline mx-1" /> {product.name}
        </span>
      </div>

      {/* Main Detail Grid Stage */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Image Viewer */}
          <div className="bg-slate-50 border border-gray-50 rounded-2xl flex items-center justify-center p-8 relative min-h-[300px] sm:min-h-[400px] overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="object-contain max-h-[350px] max-w-full hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 p-8">
                <ShoppingCart className="w-24 h-24 stroke-[1.2] text-brand-primary/10 mb-3" />
                <span className="text-sm font-semibold text-gray-400">لا توجد صورة متوفرة</span>
              </div>
            )}
            
            {/* Guarantee Tag */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border border-gray-100 px-3.5 py-1.5 rounded-xl shadow-sm">
              <ShieldCheck className="w-5 h-5 text-brand-primary" />
              <span className="text-xs font-bold text-gray-700">كفالة أصلية ومعتمدة</span>
            </div>
          </div>

          {/* Product Information Form */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category pill and SKU */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-light text-brand-primary text-xs font-extrabold">
                  <Layers className="w-3.5 h-3.5" />
                  {product.category?.name || 'أجهزة كهربائية'}
                </span>
                {product.sku && (
                  <span className="text-xs text-gray-400 font-mono">الرمز (SKU): {product.sku}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              {/* Stock status indicator */}
              <div className="pt-1">{getStockLabel()}</div>

              {/* Price display */}
              <div className="py-4 border-t border-b border-gray-50 flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold mb-1">سعر المبيع بالمعرض</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-brand-primary">
                      {formattedPrice.toFixed(2)}
                    </span>
                    <span className="text-sm font-bold text-gray-500">دينار أردني</span>
                  </div>
                </div>
              </div>

              {/* Barcode display */}
              {product.barcode && (
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-slate-50 px-3 py-2 rounded-xl border border-gray-100 w-fit">
                  <span className="font-bold">رمز الباركود للمسح السريع:</span>
                  <span className="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-700">
                    {product.barcode}
                  </span>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-800 text-sm">مواصفات الجهاز وتفاصيله:</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-brand-light/20 p-4 rounded-2xl border border-brand-secondary/25">
                  {product.description || 'لم يتم كتابة تفاصيل أو مواصفات مخصصة لهذا الجهاز بعد. لمعرفة المزيد، تفضل بزيارتنا في المعرض بشارع الهاشمي أو تواصل معنا هاتفياً.'}
                </p>
              </div>
            </div>

            {/* Cart Controller Block */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              {/* Quantity selector (disabled if out of stock) */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1 shrink-0 self-center">
                <button
                  disabled={isOutOfStock || quantity <= 1}
                  onClick={handleDecrement}
                  className="p-2 rounded-xl text-gray-500 hover:text-brand-primary hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
                >
                  -
                </button>
                <span className="px-5 font-bold text-gray-800 text-base text-center w-12">
                  {isOutOfStock ? 0 : quantity}
                </span>
                <button
                  disabled={isOutOfStock || quantity >= stock}
                  onClick={handleIncrement}
                  className="p-2 rounded-xl text-gray-500 hover:text-brand-primary hover:bg-white transition-all disabled:opacity-30 disabled:pointer-events-none focus:outline-none"
                >
                  +
                </button>
              </div>

              {/* Action Button */}
              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg text-sm ${
                  isOutOfStock
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                    : 'bg-brand-primary text-white hover:bg-brand-dark shadow-brand-primary/10 hover:shadow-brand-primary/20'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{isOutOfStock ? 'نفد هذا الجهاز من المعرض' : 'إضافة إلى سلة المشتريات'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
