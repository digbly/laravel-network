import { useEffect, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Loader2, MessageSquare, Search, ShieldAlert, Trash2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import {
  useDeleteCommentMutation,
  useGetCommentsQuery,
  useUpdateCommentMutation,
} from '../../../store/services/blogApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminComment, CommentListParams, CommentStatus } from '../../../types/blog';
import { BlogTabs } from '../components/BlogTabs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';

const PER_PAGE = 15;

const statusVariant = (status: CommentStatus) => {
  switch (status) {
    case 'approved':
      return 'emerald' as const;
    case 'pending':
      return 'amber' as const;
    case 'spam':
      return 'rose' as const;
    default:
      return 'slate' as const;
  }
};

export const CommentsView = () => {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CommentStatus | ''>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminComment | null>(null);

  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment, deleteState] = useDeleteCommentMutation();

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  const params: CommentListParams = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    status: status || undefined,
    sort: 'created_at',
    direction: 'desc',
  };

  const { data, isFetching, isError, refetch } = useGetCommentsQuery(params);

  const comments = data?.data ?? [];
  const meta = data?.meta;

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const changeStatus = async (comment: AdminComment, nextStatus: CommentStatus) => {
    try {
      await updateComment({ id: comment.id, status: nextStatus }).unwrap();
      setNotice({ type: 'success', message: t('admin.blog.comments.notices.updated') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.blog.comments.errors.updateFailed')) });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteComment(deleteTarget.id).unwrap();
      setNotice({ type: 'success', message: t('admin.blog.comments.notices.deleted') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.blog.comments.errors.deleteFailed')) });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.blog.comments.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('admin.blog.comments.subtitle')}
        </p>
      </div>

      <BlogTabs />

      {notice && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border animate-in fade-in ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      {isError && <ErrorAlert message={t('admin.blog.comments.errors.loadFailed')} />}

      <Card>
        <CardBody className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin.blog.comments.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as CommentStatus | '');
                setPage(1);
              }}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('admin.blog.comments.filters.allStatuses')}</option>
              <option value="pending">{t('admin.blog.comments.filters.pending')}</option>
              <option value="approved">{t('admin.blog.comments.filters.approved')}</option>
              <option value="spam">{t('admin.blog.comments.filters.spam')}</option>
              <option value="rejected">{t('admin.blog.comments.filters.rejected')}</option>
            </select>
          </div>
        </CardBody>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-3 font-semibold">{t('admin.blog.comments.table.author')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.comments.table.comment')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.comments.table.status')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.comments.table.created')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('admin.blog.comments.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isFetching && comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.blog.comments.loading')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isFetching && comments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                      <span>{t('admin.blog.comments.empty')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {comments.map((comment) => (
                <tr key={comment.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white whitespace-nowrap">
                    {comment.name || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md line-clamp-2">
                      {comment.content}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={statusVariant(comment.status)} size="sm" dot>
                      {comment.status_label}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(comment.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      {comment.status !== 'approved' && (
                        <button
                          type="button"
                          title={t('admin.blog.comments.actions.approve')}
                          aria-label={t('admin.blog.comments.actions.approve')}
                          onClick={() => void changeStatus(comment, 'approved')}
                          className="p-2 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}

                      {comment.status !== 'rejected' && (
                        <button
                          type="button"
                          title={t('admin.blog.comments.actions.reject')}
                          aria-label={t('admin.blog.comments.actions.reject')}
                          onClick={() => void changeStatus(comment, 'rejected')}
                          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-500/10 dark:text-slate-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}

                      {comment.status !== 'spam' && (
                        <button
                          type="button"
                          title={t('admin.blog.comments.actions.spam')}
                          aria-label={t('admin.blog.comments.actions.spam')}
                          onClick={() => void changeStatus(comment, 'spam')}
                          className="p-2 rounded-lg text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 dark:text-amber-400 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        title={t('admin.blog.comments.actions.delete')}
                        aria-label={t('admin.blog.comments.actions.delete')}
                        onClick={() => setDeleteTarget(comment)}
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination meta={meta} isFetching={isFetching} onPageChange={setPage} />
      </Card>

      {isError && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('admin.blog.comments.errors.retry')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t('admin.blog.comments.deleteDialog.title')}
        description={t('admin.blog.comments.deleteDialog.description')}
        confirmLabel={t('admin.blog.comments.deleteDialog.confirm')}
        cancelLabel={t('admin.blog.comments.deleteDialog.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
