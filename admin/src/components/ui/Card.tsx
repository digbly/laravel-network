import type { FC, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'bordered' | 'interactive';
  className?: string;
  glow?: boolean;
}

export const Card: FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  glow = false,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 relative overflow-hidden';

  const variantStyles = {
    default:
      'bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.07] shadow-sm shadow-slate-200/50 dark:shadow-none',
    glass:
      'glass-panel shadow-sm dark:shadow-none',
    bordered:
      'bg-transparent border border-slate-200 dark:border-white/[0.08]',
    interactive:
      'bg-white dark:bg-[#0F1626] border border-slate-200/80 dark:border-white/[0.07] shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:-translate-y-0.5 cursor-pointer',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${
        glow ? 'hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: FC<{
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
  children?: ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) {
    return (
      <div className={`px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`px-6 py-5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between gap-4 ${className}`}
    >
      <div>
        {title && (
          <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardBody: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter: FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`px-6 py-4 bg-slate-50/60 dark:bg-slate-900/30 border-t border-slate-100 dark:border-white/[0.06] ${className}`}
    >
      {children}
    </div>
  );
};
