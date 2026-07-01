import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Phone, Lock, Sparkles } from 'lucide-react';

interface SignupProps {
  onNavigate: (view: string, params?: any) => void;
}

export const Signup: React.FC<SignupProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const { showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showError('يرجى ملء كافة حقول التسجيل لإعداد حسابك بأمان.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, phone, password });
      onNavigate('home');
    } catch (err) {
      // Handled inside context toasts
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in" style={{ direction: 'rtl' }}>
      {/* Greetings Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 fill-pink-600" />
          <span>مرحباً بك في عائلة المدينة الوردية</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">إنشاء حساب شخصي جديد</h1>
        <p className="text-xs sm:text-sm text-gray-500">سجل الآن لتتبع طلبياتك الكهربائية وتسهيل المعاينة والدفع</p>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-4.5 text-right">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500">الاسم الرباعي بالكامل</label>
          <div className="relative">
            <User className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="text"
              required
              placeholder="مثال: يزن أبو بخيت..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500">البريد الإلكتروني المفضل</label>
          <div className="relative">
            <Mail className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="email"
              required
              placeholder="example@yourdomain.com..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-11 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500">رقم الهاتف المحمول (لتأكيد الشحن والتواصل)</label>
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

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-500">كلمة المرور السرية للحساب</label>
          <div className="relative">
            <Lock className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-gray-400" />
            <input
              type="password"
              required
              placeholder="بحد أدنى 6 أحرف أو أرقام..."
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
          {submitting ? 'جاري تهيئة وإعداد حسابك الجديد...' : 'إنشاء حسابي مجانًا'}
        </button>
      </form>

      {/* Redirect CTA to Login */}
      <hr className="border-gray-50" />
      
      <div className="text-center text-xs sm:text-sm">
        <span className="text-gray-400 font-medium">لديك حساب بالفعل؟ </span>
        <button
          onClick={() => onNavigate('login')}
          className="text-pink-600 font-extrabold hover:underline"
        >
          تسجيل الدخول الفوري
        </button>
      </div>
    </div>
  );
};

export default Signup;
