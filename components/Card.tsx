
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'glass' | 'white' | 'dark';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = "", 
  icon, 
  onClick,
  variant = 'white'
}) => {
  const variantClasses = {
    white: 'bg-white/80 dark:bg-slate-900/80 border-slate-100 dark:border-slate-800 shadow-lg',
    dark: 'bg-slate-950 text-white border-slate-800 shadow-xl',
    glass: 'bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl border-white/20 dark:border-white/5 shadow-xl'
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-2xl md:rounded-3xl border p-5 md:p-6 transition-all duration-200 relative overflow-hidden group flex flex-col h-auto min-h-0 ${variantClasses[variant]} ${onClick ? 'cursor-pointer hover:shadow-xl active:scale-[0.99]' : ''} ${className}`}
    >
      {onClick && <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />}
      
      {(title || icon) && (
        <div className="flex items-center gap-3 mb-4 relative z-10 shrink-0">
          {icon && (
            <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-sm ${variant === 'dark' ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700'}`}>
              {icon}
            </div>
          )}
          <div className="min-w-0">
            {title && <h3 className={`text-sm md:text-base font-bold tracking-tight leading-tight truncate ${variant === 'dark' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{title}</h3>}
            {subtitle && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 leading-none">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="relative z-10 flex-1 break-words whitespace-normal min-h-0 leading-normal text-sm md:text-base">
        {children}
      </div>
    </div>
  );
};
