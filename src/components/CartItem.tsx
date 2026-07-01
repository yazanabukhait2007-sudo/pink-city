import React from 'react';
import { CartItem as ICartItem, useCart } from '../context/CartContext';
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';

interface CartItemProps {
  item: ICartItem;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const product = item.product;
  const quantity = item.quantity;

  const formattedPrice = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  const subtotal = formattedPrice * quantity;
  const stock = product.inventory?.quantity ?? 999;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm gap-4">
      {/* Product Image and Details */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden border border-gray-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-contain max-h-full max-w-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <ShoppingCart className="w-8 h-8 text-brand-primary/10" />
          )}
        </div>
        
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</span>
          {product.barcode && (
            <span className="text-[10px] text-gray-400 font-mono">الباركود: {product.barcode}</span>
          )}
          <span className="text-xs text-brand-primary font-bold mt-1">
            {formattedPrice.toFixed(2)} د.أ
          </span>
        </div>
      </div>

      {/* Quantity & Action Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        {/* Quantity buttons */}
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
          <button
            onClick={() => updateQuantity(product.id, quantity - 1)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-brand-primary hover:bg-white transition-all focus:outline-none"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <span className="px-3.5 font-bold text-gray-800 text-sm w-8 text-center">
            {quantity}
          </span>
          
          <button
            disabled={quantity >= stock}
            onClick={() => updateQuantity(product.id, quantity + 1)}
            className={`p-1.5 rounded-lg text-gray-500 transition-all focus:outline-none ${
              quantity >= stock
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:text-brand-primary hover:bg-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtotal & Delete */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-gray-400 text-right">المجموع</span>
            <span className="font-extrabold text-gray-900 text-sm">
              {subtotal.toFixed(2)} د.أ
            </span>
          </div>

          <button
            onClick={() => removeItem(product.id)}
            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all focus:outline-none"
            title="حذف من السلة"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
