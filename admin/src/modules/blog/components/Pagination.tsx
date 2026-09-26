import type { FC } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import type { PaginationMeta } from '../../../types/blog';

interface PaginationProps {
  meta?: PaginationMeta;
  isFetching: boolean;
  onPageChange: (page: number) => void;
}

export const Pagination: FC<PaginationProps> = ({ meta, isFetching, onPageChange }) => {
  const { t } = useTranslation();

  if (!meta) return null;

  const { current_page: currentPage, last_page: lastPage, from, to, total } = meta;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-slate-100 dark:border-white/[0.06]">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('admin.blog.pagination.summary', { from: from ?? 0, to: to ?? 0, total })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => onPageChange(currentPage - 1)}
          leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
        >
          {t('admin.blog.pagination.previous')}
        </Button>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-1">
          {t('admin.blog.pagination.page', { current: currentPage, total: lastPage })}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= lastPage || isFetching}
          onClick={() => onPageChange(currentPage + 1)}
          rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
        >
          {t('admin.blog.pagination.next')}
        </Button>
      </div>
    </div>
  );
};
