import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { ShoppingCart, User, LogOut, Menu, X, ClipboardList, Shield } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'products', label: 'معرض الأجهزة' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Brand */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNav('home')}>
            <Logo className="h-10" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`text-sm font-bold transition-colors py-2 px-3 rounded-lg ${
                  currentView === item.id || (item.id === 'products' && currentView === 'product-details')
                    ? 'text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-pink-600 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* User & Cart CTA Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Shopping Cart Button */}
            <button
              onClick={() => handleNav('cart')}
              className={`relative p-2.5 rounded-xl border transition-all ${
                currentView === 'cart'
                  ? 'border-pink-200 bg-pink-50 text-pink-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-pink-200 hover:bg-pink-50/30'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Profile Dashboard / Login Portal */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNav('account')}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-bold transition-all ${
                    currentView === 'account'
                      ? 'border-pink-200 bg-pink-50 text-pink-600 shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {user.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-pink-600" />
                  ) : (
                    <User className="w-4 h-4 text-pink-600" />
                  )}
                  <span>{user.name}</span>
                  <span className="text-[10px] bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-black shrink-0">
                    {user.role === 'admin' ? 'مدير' : user.role === 'employee' ? 'موظف' : 'عميل'}
                  </span>
                </button>

                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="text-sm font-bold text-gray-600 hover:text-pink-600 px-3 py-2 transition-colors"
                >
                  دخول
                </button>
                <button
                  onClick={() => handleNav('signup')}
                  className="bg-pink-600 text-white hover:bg-pink-700 text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-all hover:scale-102"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Action Icon */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => handleNav('cart')}
              className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Slider/Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-4 px-4 space-y-3 shadow-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold ${
                currentView === item.id
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {item.label}
            </button>
          ))}
          <hr className="border-gray-100 my-2" />
          {user ? (
            <div className="space-y-2">
              <div className="px-4 py-2 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                </div>
                <span className="text-[10px] font-black bg-pink-100 text-pink-800 px-2 py-0.5 rounded-full">
                  {user.role === 'admin' ? 'مدير' : user.role === 'employee' ? 'موظف' : 'عميل'}
                </span>
              </div>
              <button
                onClick={() => handleNav('account')}
                className="w-full text-right flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 rounded-xl"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span>لوحة التحكم الخاصة بي</span>
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleNav('login')}
                className="w-full py-2.5 text-center border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50"
              >
                تسجيل الدخول
              </button>
              <button
                onClick={() => handleNav('signup')}
                className="w-full py-2.5 text-center bg-pink-600 text-white rounded-xl text-sm font-bold hover:bg-pink-700"
              >
                إنشاء حساب
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
