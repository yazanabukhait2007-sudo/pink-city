import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10 w-10', showText = true }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-dark shadow-md shadow-brand-primary/20 ${className}`}>
        {/* Abstract elegant flower/bolt emblem */}
        <span className="text-white font-extrabold text-lg">W</span>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-secondary rounded-full border-2 border-white animate-pulse" />
      </div>
      
      {showText && (
        <div className="flex flex-col text-right">
          <span className="font-extrabold text-lg leading-tight tracking-tight text-gray-900">
            المدينة <span className="text-brand-primary">الوردية</span>
          </span>
          <span className="text-[10px] text-gray-500 font-medium -mt-0.5">
            للأجهزة الكهربائية والمستلزمات
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
