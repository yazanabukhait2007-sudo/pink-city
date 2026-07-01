import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface Product {
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

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pink_city_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const { showSuccess, showInfo } = useToast();

  useEffect(() => {
    localStorage.setItem('pink_city_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      
      const availableQuantity = product.quantity;
      const currentInCart = existing ? existing.quantity : 0;
      const newQuantity = currentInCart + quantity;

      if (newQuantity > availableQuantity) {
        showInfo(`عذراً، المخزون المتوفر من هذا المنتج هو ${availableQuantity} قطعة فقط.`);
        if (availableQuantity <= 0) return prevItems;
        // Cap to max available
        if (existing) {
          return prevItems.map((item) =>
            item.product.id === product.id ? { ...item, quantity: availableQuantity } : item
          );
        } else {
          return [...prevItems, { product, quantity: availableQuantity }];
        }
      }

      showSuccess(`تمت إضافة "${product.name}" إلى السلة!`);

      if (existing) {
        return prevItems.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }

      return [...prevItems, { product, quantity }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.product.id === productId);
      if (item) {
        showInfo(`تمت إزالة "${item.product.name}" من السلة.`);
      }
      return prevItems.filter((item) => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          const maxAvailable = item.product.quantity;
          if (quantity > maxAvailable) {
            showInfo(`المخزون المتوفر هو ${maxAvailable} قطعة فقط.`);
            return { ...item, quantity: maxAvailable };
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('pink_city_cart');
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
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
