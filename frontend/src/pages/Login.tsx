import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Phone, Lock, Sparkles, Key, UserCheck } from 'lucide-react';

interface LoginProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { showError } = useToast();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'email' && !email) {
      showError('يرجى كتابة البريد الإلكتروني');
      return;
    }
    if (loginMethod === 'phone' && !phone) {
      showError('يرجى كتابة رقم الهاتف المعتمد');
      return;
    }
    if (!password) {
      showError('يرجى كتابة كلمة المرور للتحقق');
      return;
    }

    setSubmitting(true);
    try {
      await login({
        email: loginMethod === 'email' ? email : undefined,
        phone: loginMethod === 'phone' ? phone : undefined,
        password,
        loginMethod,
      });
      // Redirect to home or account page on success
      onNavigate('home');
    } catch (err) {
      // Errors are handled inside the AuthContext toast trigger
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Brand Greetings */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 fill-pink-600" />
          <span>مرحباً بك مجدداً في معرضنا الإلكتروني</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">تسجيل الدخول للحساب</h1>
        <p className="text-xs sm:text-sm text-gray-500">تمتع بإدارة طلبياتك الكهربائية ومتابعتها بالتفصيل</p>
      </div>

      {/* Login Method Toggle button tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100/60 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setLoginMethod('email')}
          className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
            loginMethod === 'email'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          بالبريد الإلكتروني
        </button>
        <button
          type="button"
          onClick={() => setLoginMethod('phone')}
          className={`py-2 text-center text-xs font-bold rounded-xl transition-all ${
            loginMethod === 'phone'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          برقم الهاتف المحمول
        </button>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-right">
        {loginMethod === 'email' ? (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500">البريد الإلكتروني المعتمد</label>
            <div className="relative">
              <Mail className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="email"
                required
                placeholder="example@pinkcity-jo.com..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-500">رقم الهاتف المحمول المسجل</label>
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="tel"
                required
                placeholder="079XXXXXXXX..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none font-mono text-left"
                dir="ltr"
              />
            </div>
          </div>
        )}

        {/* Password input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500">كلمة المرور السرية</label>
          <div className="relative">
            <Lock className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="password"
              required
              placeholder="••••••••..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit action */}
        <button
          type="submit"
          disabled={submitting}
          className={`w-full font-extrabold text-sm sm:text-base py-3.5 rounded-xl text-white shadow-md transition-all ${
            submitting
              ? 'bg-gray-300 cursor-wait'
              : 'bg-pink-600 hover:bg-pink-700 hover:scale-101 shadow-pink-100'
          }`}
        >
          {submitting ? 'جاري التحقق وتسجيل الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>

      {/* Redirect CTA to register */}
      <hr className="border-gray-50" />
      
      <div className="text-center text-xs sm:text-sm">
        <span className="text-gray-400 font-medium">ليس لديك حساب بعد؟ </span>
        <button
          onClick={() => onNavigate('signup')}
          className="text-pink-600 font-extrabold hover:underline"
        >
          إنشاء حساب جديد في ثوانٍ
        </button>
      </div>

      {/* Fast Demo Credentials Help card (great for developers checking functionality) */}
      <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-2xl text-right space-y-2">
        <p className="text-[10px] text-gray-400 font-extrabold flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5 text-pink-500" />
          <span>حسابات تجريبية سريعة للاختبار:</span>
        </p>
        <ul className="text-[10px] text-gray-500 leading-relaxed font-semibold space-y-1">
          <li>• <span className="font-extrabold text-gray-800">حساب مدير:</span> admin@pinkcity.com / admin123</li>
          <li>• <span className="font-extrabold text-gray-800">حساب موظف:</span> employee@pinkcity.com / employee123</li>
          <li>• <span className="font-extrabold text-gray-800">حساب عميل:</span> customer@pinkcity.com / customer123</li>
        </ul>
      </div>
    </div>
  );
};

export default Login;
