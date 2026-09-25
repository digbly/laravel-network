import type { FC, ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'emerald' | 'amber' | 'rose' | 'slate' | 'violet' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}

export const Badge: FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  pulse = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
    lg: 'text-sm px-3 py-1.5 font-medium',
  };

  const variantStyles = {
    primary:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    emerald:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    amber:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    rose:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    slate:
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    violet:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
    cyan:
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20',
  };

  const dotColors = {
    primary: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    violet: 'bg-purple-500',
    cyan: 'bg-cyan-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[variant]}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[variant]}`}
          />
        </span>
      )}
      {children}
    </span>
  );
};
