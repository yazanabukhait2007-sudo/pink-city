import React from 'react';
import { CartItem as CartItemType, useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, Tag } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-pink-100 transition-all">
      {/* Product Image and Meta */}
      <div className="flex items-center gap-4 flex-1">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover bg-slate-50 border shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="text-right">
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono mb-1">
            <Tag className="w-3 h-3 text-pink-500 shrink-0" />
            <span>SKU: {product.sku}</span>
          </div>
          <h4 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1">{product.name}</h4>
          <p className="text-xs text-gray-400 mt-1">سعر القطعة: {product.price.toLocaleString()} دينار</p>
        </div>
      </div>

      {/* Quantity adjustment & Subtotal calculation */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
        {/* Quantity control button group */}
        <div className="flex items-center border border-gray-200 rounded-xl bg-slate-50/50 overflow-hidden shrink-0">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="p-2 hover:bg-white text-gray-500 hover:text-pink-600 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 font-extrabold text-sm text-gray-800 w-10 text-center select-none font-sans">
            {quantity}
          </span>
          <button
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className="p-2 hover:bg-white text-gray-500 hover:text-pink-600 transition-colors"
            disabled={quantity >= product.quantity}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Subtotal calculation */}
        <div className="text-left flex flex-col items-end min-w-[100px]">
          <span className="text-[10px] text-gray-400 font-semibold mb-0.5">المجموع</span>
          <p className="font-extrabold text-base text-gray-900 tracking-tight">
            {(product.price * quantity).toLocaleString()} <span className="text-[10px] text-pink-500 font-bold">دينار</span>
          </p>
        </div>

        {/* Delete button */}
        <button
          onClick={() => removeFromCart(product.id)}
          className="p-2.5 rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shrink-0"
          title="إزالة من السلة"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
