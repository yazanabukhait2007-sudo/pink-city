import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader, UserPlus, ArrowRight } from 'lucide-react';

interface SignupProps {
  redirect?: string | null;
  onNavigate: (view: string, params?: any) => void;
}

export const Signup: React.FC<SignupProps> = ({ redirect = null, onNavigate }) => {
  const { register, user } = useAuth();
  const { showToast } = useToast();

  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, redirect them
  useEffect(() => {
    if (user) {
      if (redirect === 'checkout') {
        onNavigate('checkout');
      } else {
        onNavigate('account');
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('يرجى إدخال الاسم بالكامل.', 'error');
      return;
    }
    if (registerMethod === 'email' && !email.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني.', 'error');
      return;
    }
    if (registerMethod === 'phone' && !phone.trim()) {
      showToast('يرجى إدخال رقم الهاتف.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('يجب أن تكون كلمة المرور 6 خانات على الأقل.', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name: name.trim(),
        password
      };

      if (registerMethod === 'email') {
        payload.email = email.trim().toLowerCase();
      } else {
        payload.phone = phone.trim();
      }

      await register(payload);
      // AuthContext will trigger redirect via useEffect on user state update
    } catch (err: any) {
      console.log("Signup failed:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-light rounded-2xl flex items-center justify-center text-brand-primary mx-auto shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-xs text-gray-500">انضم إلينا للاستفادة من تتبع طلباتك والتوصيل المجاني المضمون.</p>
        </div>

        {/* Register Method Toggle Pills */}
        <div className="flex bg-slate-50 p-1 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => setRegisterMethod('email')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              registerMethod === 'email'
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            التسجيل بالبريد
          </button>
          <button
            type="button"
            onClick={() => setRegisterMethod('phone')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
              registerMethod === 'phone'
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            التسجيل بالهاتف
          </button>
        </div>

        {/* Inputs Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">الاسم الثلاثي بالكامل *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="مثال: يزن أبو خيط"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-semibold"
              />
              <User className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
            </div>
          </div>

          {/* Email or Phone */}
          {registerMethod === 'email' ? (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">البريد الإلكتروني *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-semibold"
                />
                <Mail className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">رقم الهاتف للتواصل *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="079XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-semibold"
                />
                <Phone className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              </div>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">كلمة المرور (6 خانات كحد أدنى) *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-11 pl-12 py-3 bg-slate-50 border border-gray-100 focus:border-brand-primary focus:bg-white focus:outline-none rounded-xl text-sm transition-all text-right font-semibold"
              />
              <Lock className="absolute right-4 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-brand-primary hover:bg-brand-dark disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-extrabold rounded-xl shadow-lg shadow-brand-primary/10 transition-all text-sm"
          >
            {loading ? (
              <>
                <Loader className="w-4.5 h-4.5 animate-spin" />
                <span>جاري إنشاء حسابك وتأكيده...</span>
              </>
            ) : (
              <span>إنشاء حساب والولوج للمعرض</span>
            )}
          </button>
        </form>

        {/* Redirect toggle to login */}
        <div className="pt-4 border-t border-gray-50 text-center space-y-2">
          <p className="text-xs text-gray-500">لديك حساب بالفعل؟</p>
          <button
            onClick={() => onNavigate('login', { redirect })}
            className="text-xs font-extrabold text-brand-primary hover:text-brand-dark transition-colors inline-flex items-center gap-1"
          >
            <span>تسجيل الدخول مباشرةً</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
