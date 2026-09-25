
import type { FC } from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: FC<ErrorAlertProps> = ({ message }) => (
  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span>{message}</span>
  </div>
);
