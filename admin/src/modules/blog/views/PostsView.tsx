import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Newspaper, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import {
  useCreatePostMutation,
  useDeletePostMutation,
  useGetCategoriesQuery,
  useGetPostsQuery,
  useUpdatePostMutation,
} from '../../../store/services/blogApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminPost, PostListParams, PostPayload, PostStatus } from '../../../types/blog';
import { BlogTabs } from '../components/BlogTabs';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import { PostFormModal } from '../components/PostFormModal';

const PER_PAGE = 10;

const statusVariant = (status: PostStatus) => (status === 'published' ? 'emerald' : 'amber');

export const PostsView = () => {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<PostStatus | ''>('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPost, setFormPost] = useState<AdminPost | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPost | null>(null);

  const [createPost, createState] = useCreatePostMutation();
  const [updatePost, updateState] = useUpdatePostMutation();
  const [deletePost, deleteState] = useDeletePostMutation();

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

  const params: PostListParams = {
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    status: status || undefined,
    sort: 'created_at',
    direction: 'desc',
  };

  const { data, isFetching, isError, refetch } = useGetPostsQuery(params);
  const { data: categoriesData } = useGetCategoriesQuery({ per_page: 100 });

  const posts = data?.data ?? [];
  const meta = data?.meta;
  const categories = categoriesData?.data ?? [];

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const handleSubmit = async (payload: PostPayload) => {
    setFormError(null);

    try {
      if (formPost) {
        await updatePost({ id: formPost.id, body: payload }).unwrap();
        setNotice({ type: 'success', message: t('admin.blog.posts.notices.updated') });
      } else {
        await createPost(payload).unwrap();
        setNotice({ type: 'success', message: t('admin.blog.posts.notices.created') });
      }

      setIsFormOpen(false);
      setFormPost(null);
    } catch (error) {
      setFormError(getErrorMessage(error, t('admin.blog.posts.errors.saveFailed')));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deletePost(deleteTarget.id).unwrap();
      setNotice({ type: 'success', message: t('admin.blog.posts.notices.deleted') });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.blog.posts.errors.deleteFailed')) });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.blog.posts.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.blog.posts.subtitle')}
          </p>
        </div>

        <Button
          onClick={() => {
            setFormPost(null);
            setFormError(null);
            setIsFormOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('admin.blog.posts.add')}
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

      {isError && <ErrorAlert message={t('admin.blog.posts.errors.loadFailed')} />}

      <Card>
        <CardBody className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin.blog.posts.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as PostStatus | '');
                setPage(1);
              }}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('admin.blog.posts.filters.allStatuses')}</option>
              <option value="draft">{t('admin.blog.posts.filters.draft')}</option>
              <option value="published">{t('admin.blog.posts.filters.published')}</option>
            </select>
          </div>
        </CardBody>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-3 font-semibold">{t('admin.blog.posts.table.post')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.posts.table.status')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.posts.table.categories')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.blog.posts.table.created')}</th>
                <th className="px-6 py-3 font-semibold text-right">{t('admin.blog.posts.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isFetching && posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.blog.posts.loading')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isFetching && posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Newspaper className="w-6 h-6 text-slate-400" />
                      <span>{t('admin.blog.posts.empty')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-xs">
                      {post.title ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                      /{post.slug ?? ''}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={statusVariant(post.status)} size="sm" dot>
                      {post.status_label}
                    </Badge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {post.categories.length === 0 ? (
                        <span className="text-xs text-slate-400 dark:text-slate-500">—</span>
                      ) : (
                        post.categories.map((category) => (
                          <Badge key={category.id} variant="slate" size="sm">
                            {category.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(post.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title={t('admin.blog.posts.actions.edit')}
                        aria-label={t('admin.blog.posts.actions.edit')}
                        onClick={() => {
                          setFormPost(post);
                          setFormError(null);
                          setIsFormOpen(true);
                        }}
                        className="p-2 rounded-lg text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        title={t('admin.blog.posts.actions.delete')}
                        aria-label={t('admin.blog.posts.actions.delete')}
                        onClick={() => setDeleteTarget(post)}
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
            {t('admin.blog.posts.errors.retry')}
          </Button>
        </div>
      )}

      {isFormOpen && (
        <PostFormModal
          key={formPost?.id ?? 'new'}
          post={formPost}
          categories={categories}
          isSubmitting={createState.isLoading || updateState.isLoading}
          error={formError}
          onSubmit={(payload) => void handleSubmit(payload)}
          onClose={() => {
            setIsFormOpen(false);
            setFormPost(null);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t('admin.blog.posts.deleteDialog.title')}
        description={t('admin.blog.posts.deleteDialog.description', { title: deleteTarget?.title ?? '' })}
        confirmLabel={t('admin.blog.posts.deleteDialog.confirm')}
        cancelLabel={t('admin.blog.posts.deleteDialog.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
