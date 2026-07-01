import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Eye, PackageX, Heart, CheckCircle, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    price: string | number;
    imageUrl: string | null;
    barcode: string | null;
    isActive: boolean;
    category?: { name: string } | null;
    inventory?: {
      quantity: number;
      minQuantity: number;
      location: string | null;
    } | null;
  };
  onViewDetails: (id: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addItem } = useCart();

  const formattedPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const stock = product.inventory?.quantity ?? 0;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= (product.inventory?.minQuantity ?? 5);

  const getStockBadge = () => {
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <PackageX className="w-3.5 h-3.5" />
          غير متوفر
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" />
          كمية محدودة ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5" />
        متوفر ({stock})
      </span>
    );
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-primary/10 transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain max-h-full max-w-full group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-300 p-8">
            <ShoppingCart className="w-16 h-16 stroke-[1.2] text-brand-primary/10 mb-2" />
            <span className="text-xs font-medium text-gray-400">لا توجد صورة</span>
          </div>
        )}

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetails(product.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 font-bold rounded-xl shadow-lg text-xs hover:bg-brand-primary hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Eye className="w-4 h-4" />
            عرض التفاصيل
          </button>
        </div>

        {/* Top Floating Tags */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {getStockBadge()}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-xs text-brand-primary font-bold bg-brand-light/60 px-2.5 py-1 rounded-lg">
            {product.category?.name || 'أجهزة كهربائية'}
          </span>

          {/* Title */}
          <h3
            onClick={() => onViewDetails(product.id)}
            className="mt-3 font-bold text-gray-800 text-base line-clamp-1 hover:text-brand-primary cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Barcode display (if scanner feature needs it) */}
          {product.barcode && (
            <p className="mt-1 text-[11px] text-gray-400 font-mono tracking-wide">
              الباركود: {product.barcode}
            </p>
          )}
        </div>

        {/* Action Tray */}
        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">السعر</span>
            <span className="text-lg font-black text-brand-primary">
              {formattedPrice.toFixed(2)} <span className="text-xs font-normal">دينار</span>
            </span>
          </div>

          {/* Add to Cart button */}
          <button
            disabled={isOutOfStock}
            onClick={() => addItem(product)}
            className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-brand-primary text-white hover:bg-brand-dark shadow-md shadow-brand-primary/10 hover:shadow-brand-primary/20'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isOutOfStock ? 'نفد' : 'أضف'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
