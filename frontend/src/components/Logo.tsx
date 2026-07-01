import React from 'react';
import { Sparkles } from 'lucide-react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-8" }) => {
  return (
    <div className={`flex items-center gap-2 select-none font-sans ${className}`}>
      <div className="p-1.5 rounded-xl bg-pink-100 text-pink-600 animate-pulse">
        <Sparkles className="w-5 h-5 fill-pink-600" />
      </div>
      <div className="flex flex-col text-right">
        <span className="font-extrabold text-lg tracking-tight text-pink-600 leading-none">المدينة الوردية</span>
        <span className="text-[9px] font-black tracking-wider text-pink-400 uppercase mt-0.5 leading-none">للأجهزة الكهربائية</span>
      </div>
    </div>
  );
};

export default Logo;
