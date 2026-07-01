import React from 'react';
import { useCart, Product } from '../context/CartContext';
import { ShoppingCart, Tag, MapPin, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  
  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= product.minQuantity;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-pink-200 hover:shadow-md transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Product Image */}
      <div className="relative pt-[70%] bg-slate-50 overflow-hidden shrink-0">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        
        {/* Quantity status badge */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="text-[10px] font-black bg-rose-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              نفد من المخزن
            </span>
          ) : isLowStock ? (
            <span className="text-[10px] font-black bg-amber-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              كمية محدودة جداً ({product.quantity})
            </span>
          ) : (
            <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-1 rounded-full shadow-sm">
              متوفر في المعرض ({product.quantity})
            </span>
          )}
        </div>

        {/* Action icons overlay on hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => onViewDetails(product.id)}
            className="p-3 bg-white text-gray-800 rounded-full hover:bg-pink-500 hover:text-white hover:scale-110 transition-all shadow-md"
            title="عرض التفاصيل"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 font-mono">
            <Tag className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span>SKU: {product.sku}</span>
          </div>

          <h3
            onClick={() => onViewDetails(product.id)}
            className="font-bold text-gray-900 line-clamp-1 group-hover:text-pink-600 transition-colors cursor-pointer text-base mb-2"
          >
            {product.name}
          </h3>

          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        <div>
          {product.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-4 bg-gray-50 py-1 px-2 rounded-lg w-max max-w-full">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span className="truncate">الموقع: {product.location}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-50">
            {/* Pricing block */}
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-gray-400 font-semibold mb-0.5">السعر النقدي</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">{product.price.toLocaleString()}</span>
                <span className="text-[10px] text-pink-500 font-bold">دينار</span>
              </div>
            </div>

            {/* Quick Add To Cart Button */}
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`p-3.5 rounded-xl text-white transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                  : 'bg-pink-600 hover:bg-pink-700 hover:scale-103 shadow-md hover:shadow-pink-100'
              }`}
              title="إضافة للسلة"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
