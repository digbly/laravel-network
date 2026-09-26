import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, FolderTree, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import { useDeleteCategoryMutation, useGetCategoriesQuery } from '../../../store/services/blogApi';
import { getErrorMessage } from '../../../utils/apiError';
import { websitePath } from '../../../utils/website';
import type { AdminCategory, CategoryListParams } from '../../../types/blog';
import { BlogTabs } from '../components/BlogTabs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';

const PER_PAGE = 20;

export const CategoriesView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { websiteId } = useParams<{ websiteId: string }>();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null);

  const [deleteCategory, deleteState] = useDeleteCategoryMutation();

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

  const params: CategoryListParams = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    sort: 'created_at',
    direction: 'desc',
  };

  const { data, isFetching, isError, refetch } = useGetCategoriesQuery(params);

  const categories = data?.data ?? [];
  const meta = data?.meta;

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory(deleteTarget.id).unwrap();
      setNotice({ type: 'success', message: t('admin.blog.categories.notices.deleted') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.blog.categories.errors.deleteFailed')) });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.blog.categories.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.blog.categories.subtitle')}
          </p>
        </div>

        <Button
          onClick={() => navigate(websitePath('/blog/categories/new', websiteId))}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('admin.blog.categories.add')}
        </Button>
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

      {isError && <ErrorAlert message={t('admin.blog.categories.errors.loadFailed')} />}

      <Card>
        <CardBody className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t('admin.blog.categories.searchPlaceholder')}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardBody>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-3 font-semibold">{t('admin.blog.categories.table.name')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.categories.table.slug')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.categories.table.posts')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.categories.table.home')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('admin.blog.categories.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isFetching && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.blog.categories.loading')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isFetching && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <FolderTree className="w-6 h-6 text-slate-400" />
                      <span>{t('admin.blog.categories.empty')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {category.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {category.slug ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                    {category.posts_count ?? 0}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={category.is_home ? 'emerald' : 'slate'} size="sm">
                      {category.is_home
                        ? t('admin.blog.categories.homeYes')
                        : t('admin.blog.categories.homeNo')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title={t('admin.blog.categories.actions.edit')}
                        aria-label={t('admin.blog.categories.actions.edit')}
                        onClick={() =>
                          navigate(websitePath(`/blog/categories/${category.id}/edit`, websiteId))
                        }
                        className="p-2 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title={t('admin.blog.categories.actions.delete')}
                        aria-label={t('admin.blog.categories.actions.delete')}
                        onClick={() => setDeleteTarget(category)}
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
            {t('admin.blog.categories.errors.retry')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t('admin.blog.categories.deleteDialog.title')}
        description={t('admin.blog.categories.deleteDialog.description', {
          name: deleteTarget?.name ?? '',
        })}
        confirmLabel={t('admin.blog.categories.deleteDialog.confirm')}
        cancelLabel={t('admin.blog.categories.deleteDialog.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
