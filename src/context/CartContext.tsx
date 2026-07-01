import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface CartItem {
  product: {
    id: number;
    name: string;
    price: string | number;
    imageUrl: string | null;
    barcode: string | null;
    isActive: boolean;
    inventory?: {
      quantity: number;
      minQuantity: number;
      location: string | null;
    } | null;
  };
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addItem: (product: CartItem['product'], quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { showToast } = useToast();

  // Load cart items from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('pink_city_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Failed to parse saved cart", err);
      }
    }
  }, []);

  // Sync cart items with localStorage on changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('pink_city_cart', JSON.stringify(items));
  };

  const addItem = (product: CartItem['product'], quantity = 1) => {
    const existingItemIndex = cartItems.findIndex((item) => item.product.id === product.id);
    const availableQty = product.inventory?.quantity ?? 999;

    if (availableQty <= 0) {
      showToast('عذراً، هذا المنتج غير متوفر حالياً في المخزن.', 'error');
      return;
    }

    let newItems = [...cartItems];

    if (existingItemIndex > -1) {
      const currentQty = cartItems[existingItemIndex].quantity;
      const newQty = currentQty + quantity;

      if (newQty > availableQty) {
        showToast(`عذراً، لا يمكنك إضافة المزيد. الكمية المتاحة في المخزن هي ${availableQty} فقط.`, 'error');
        newItems[existingItemIndex].quantity = availableQty;
      } else {
        newItems[existingItemIndex].quantity = newQty;
        showToast(`تم زيادة كمية "${product.name}" في السلة.`, 'success');
      }
    } else {
      if (quantity > availableQty) {
        showToast(`عذراً، الكمية المتاحة في المخزن هي ${availableQty} فقط.`, 'error');
        newItems.push({ product, quantity: availableQty });
      } else {
        newItems.push({ product, quantity });
        showToast(`تم إضافة "${product.name}" إلى السلة.`, 'success');
      }
    }

    saveCart(newItems);
  };

  const removeItem = (productId: number) => {
    const item = cartItems.find((i) => i.product.id === productId);
    const newItems = cartItems.filter((i) => i.product.id !== productId);
    saveCart(newItems);
    if (item) {
      showToast(`تمت إزالة "${item.product.name}" من السلة.`, 'info');
    }
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    const itemIndex = cartItems.findIndex((i) => i.product.id === productId);
    if (itemIndex > -1) {
      const product = cartItems[itemIndex].product;
      const availableQty = product.inventory?.quantity ?? 999;

      let newItems = [...cartItems];
      if (quantity > availableQty) {
        showToast(`عذراً، الكمية المتاحة في المخزن هي ${availableQty} فقط.`, 'error');
        newItems[itemIndex].quantity = availableQty;
      } else {
        newItems[itemIndex].quantity = quantity;
      }
      saveCart(newItems);
    }
  };

  const clearCart = () => {
    saveCart([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
      return acc + (price * item.quantity);
    }, 0);
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addItem, removeItem, updateQuantity, clearCart, getCartTotal, getCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
