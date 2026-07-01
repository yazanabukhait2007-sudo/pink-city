import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Logo } from './Logo';
import { ShoppingCart, User, LogOut, Menu, X, Home, Grid, Heart, ReceiptText } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getCartCount();

  const handleLinkClick = (view: string, params?: any) => {
    onNavigate(view, params);
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'الرئيسية', view: 'home', icon: Home },
    { label: 'المنتجات', view: 'products', icon: Grid },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => handleLinkClick('home')}>
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-reverse space-x-8">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => handleLinkClick(item.view)}
                  className={`flex items-center gap-2 font-semibold text-sm transition-colors duration-200 ${
                    isActive
                      ? 'text-brand-primary border-b-2 border-brand-primary py-5'
                      : 'text-gray-600 hover:text-brand-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Controls & Cart */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Icon */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2.5 text-gray-600 hover:text-brand-primary bg-gray-50 hover:bg-brand-secondary/20 rounded-xl transition-all duration-200"
            >
              <ShoppingCart className="w-5.5 h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleLinkClick('account')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    currentView === 'account'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'border-gray-200 hover:border-brand-primary/30 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{user.name.split(' ')[0]}</span>
                </button>
                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="p-2.5 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleLinkClick('login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-brand-primary transition-all"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => handleLinkClick('signup')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl transition-all shadow-sm shadow-brand-primary/10"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Cart */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2 text-gray-600 hover:text-brand-primary bg-gray-50 rounded-lg"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-brand-primary bg-gray-50 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-slide-down">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  onClick={() => handleLinkClick(item.view)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-brand-secondary/10 transition-all text-right"
                >
                  <Icon className="w-5 h-5 text-gray-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {user ? (
              <>
                <button
                  onClick={() => handleLinkClick('account')}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-base font-medium text-gray-700 hover:text-brand-primary hover:bg-brand-secondary/10 transition-all text-right"
                >
                  <User className="w-5 h-5 text-gray-400" />
                  <span>حسابي ({user.name})</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-base font-medium text-rose-600 hover:bg-rose-50 transition-all text-right"
                >
                  <LogOut className="w-5 h-5 text-rose-400" />
                  <span>تسجيل الخروج</span>
                </button>
              </>
            ) : (
              <div className="pt-4 pb-2 border-t border-gray-100 px-3 flex gap-2">
                <button
                  onClick={() => handleLinkClick('login')}
                  className="flex-1 py-2 text-center text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
                >
                  دخول
                </button>
                <button
                  onClick={() => handleLinkClick('signup')}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-xl transition-all shadow-sm"
                >
                  إنشاء حساب
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
