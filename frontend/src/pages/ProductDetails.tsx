import React, { useEffect, useState } from 'react';
import { productsApi } from '../utils/api';
import { useCart, Product } from '../context/CartContext';
import { Tag, MapPin, ShoppingCart, Plus, Minus, ArrowRight, ShieldCheck, Truck, ShieldAlert } from 'lucide-react';

interface ProductDetailsProps {
  productId: number;
  onNavigate: (view: string, params?: any) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productsApi.get(productId);
        if (res.success && res.product) {
          setProduct(res.product);
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center animate-pulse space-y-8" style={{ direction: 'rtl' }}>
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-2xl h-80" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-24 bg-gray-200 rounded-lg" />
            <div className="h-10 bg-gray-200 rounded-lg w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center p-12 bg-white border border-gray-100 rounded-2xl shadow-sm" style={{ direction: 'rtl' }}>
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h3 className="font-extrabold text-gray-900 text-lg mb-2">عذراً، لم نعثر على هذا الجهاز</h3>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">قد يكون الجهاز تم حذفه من النظام أو تم إدخال معرف غير صحيح.</p>
        <button
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-all"
        >
          العودة لمعرض المنتجات
        </button>
      </div>
    );
  }

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= product.minQuantity;

  const handleIncrement = () => {
    if (quantity < product.quantity) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Breadcrumb / Go Back Link */}
      <button
        onClick={() => onNavigate('products')}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>العودة للمعرض</span>
      </button>

      {/* Main product card */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Left Col: Image showcase */}
        <div className="relative pt-[80%] md:pt-0 md:h-[380px] bg-slate-50 border border-gray-100 rounded-2xl overflow-hidden shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Right Col: Details block */}
        <div className="flex flex-col justify-between text-right space-y-6">
          <div className="space-y-4">
            {/* SKU and Category Badges */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-100 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3 text-pink-500" />
                <span>SKU: {product.sku}</span>
              </span>
              {product.barcode && (
                <span className="inline-flex items-center text-[10px] font-semibold text-gray-500 bg-gray-50 border px-2.5 py-1 rounded-full font-mono">
                  Barcode: {product.barcode}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
              {product.name}
            </h1>

            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            {/* Physical Location in exhibition (Store layout navigation feature) */}
            {product.location && (
              <div className="p-3.5 bg-slate-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                <div className="p-2 bg-white rounded-xl text-pink-600 border shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold">موقع عرض السلعة في صالة المعرض</p>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-800 mt-0.5">{product.location}</p>
                </div>
              </div>
            )}

            {/* Price and Stock status details */}
            <div className="flex items-center justify-between gap-4 py-4 border-t border-b border-gray-50">
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold mb-0.5">السعر النقدي الفوري</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-pink-500 font-black">دينار أردني</span>
                </div>
              </div>

              <div className="text-left">
                {isOutOfStock ? (
                  <span className="text-xs font-bold bg-rose-100 text-rose-800 px-3 py-1.5 rounded-full">
                    غير متوفر حالياً
                  </span>
                ) : isLowStock ? (
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full">
                    كمية محدودة جداً ({product.quantity} قطع)
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full">
                    متوفر في المعرض ({product.quantity} قطع)
                  </span>
                )}
              </div>
            </div>

            {/* Shopping Cart Control panel */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50 overflow-hidden shrink-0">
                  <button
                    onClick={handleDecrement}
                    className="p-3 hover:bg-white text-gray-500 hover:text-pink-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 font-black text-sm text-gray-800 w-12 text-center select-none font-sans">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-3 hover:bg-white text-gray-500 hover:text-pink-600 transition-colors"
                    disabled={quantity >= product.quantity}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-grow bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm sm:text-base py-3.5 px-6 rounded-xl shadow-md hover:shadow-pink-100 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>إضافة لسلة التسوق</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust guarantees bento row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
          <div className="text-right">
            <h4 className="font-bold text-gray-900 text-sm">كفالة الوكيل المعتمدة</h4>
            <p className="text-xs text-gray-400 mt-0.5">ضمان حقيقي وصيانة معتمدة لجميع الأجهزة الكهربائية.</p>
          </div>
        </div>
        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-3">
          <Truck className="w-8 h-8 text-pink-600 shrink-0" />
          <div className="text-right">
            <h4 className="font-bold text-gray-900 text-sm">التوصيل والتركيب الفني</h4>
            <p className="text-xs text-gray-400 mt-0.5">خدمة توصيل سريعة مع إمكانية التركيب والتشغيل الفني المباشر.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
