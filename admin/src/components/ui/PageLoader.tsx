import type { FC } from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: FC = () => (
  <div
    role="status"
    className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-500"
  >
    <Loader2 className="w-5 h-5 animate-spin" />
    <span className="sr-only">Loading</span>
  </div>
);
