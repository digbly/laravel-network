import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
  useUpdatePageMutation,
} from '../../../store/services/pageApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { Page, PagePayload, PageStatus } from '../../../types/page';

type Notice = { type: 'success' | 'error'; message: string };

interface PageDraft {
  title: string;
  slug: string;
  content: string;
  description: string;
  status: PageStatus;
  template: string;
}

const emptyDraft = (): PageDraft => ({
  title: '',
  slug: '',
  content: '',
  description: '',
  status: 'published',
  template: '',
});

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const draftFromPage = (page: Page): PageDraft => ({
  title: page.title,
  slug: page.slug,
  content: page.content ?? '',
  description: page.description ?? '',
  status: page.status,
  template: page.template ?? '',
});

export const PagesView = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage?.split('-')[0] ?? 'en';

  const { data, isFetching } = useGetPagesQuery();
  const [createPage, { isLoading: isCreating }] = useCreatePageMutation();
  const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
  const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

  const pages = useMemo(() => data?.data ?? [], [data?.data]);

  const [notice, setNotice] = useState<Notice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Page | null>(null);
  const [draft, setDraft] = useState<PageDraft>(emptyDraft());
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Page | null>(null);

  useEffect(() => {
    if (notice?.type !== 'success') return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  const openCreate = (): void => {
    setEditing(null);
    setDraft(emptyDraft());
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (page: Page): void => {
    setEditing(page);
    setDraft(draftFromPage(page));
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmit = async (): Promise<void> => {
    const title = draft.title.trim();

    if (!title) {
      setFormError(t('admin:pages.form.titleRequired'));
      return;
    }

    const payload: PagePayload = {
      title,
      slug: draft.slug.trim() || slugify(title),
      content: draft.content || null,
      description: draft.description || null,
      status: draft.status,
      template: draft.template || null,
      locale,
    };

    try {
      if (editing) {
        await updatePage({ id: editing.id, body: payload }).unwrap();
        setNotice({ type: 'success', message: t('admin:pages.notices.updated') });
      } else {
        await createPage(payload).unwrap();
        setNotice({ type: 'success', message: t('admin:pages.notices.created') });
      }

      setIsFormOpen(false);
    } catch (error) {
      setFormError(getErrorMessage(error, t('admin:pages.errors.saveFailed')));
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!pendingDelete) return;

    try {
      await deletePage(pendingDelete.id).unwrap();
      setNotice({ type: 'success', message: t('admin:pages.notices.deleted') });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin:pages.errors.deleteFailed')),
      });
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t('admin:pages.title')}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t('admin:pages.subtitle')}
          </p>
        </div>

        <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
          {t('admin:pages.addPage')}
        </Button>
      </div>

      {notice && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs ${
            notice.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{notice.message}</span>
        </div>
      )}

      <Card>
        <CardBody className="p-0">
          {pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400 dark:text-slate-500">
              {isFetching ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <FileText className="h-8 w-8" />
              )}
              <span className="text-sm">{t('admin:pages.empty')}</span>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {pages.map((page) => (
                <li key={page.id} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {page.title}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      /{page.slug}
                      {page.template ? ` · ${page.template}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        page.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t(`admin:pages.status.${page.status}`)}
                    </span>

                    <button
                      type="button"
                      onClick={() => openEdit(page)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-white/[0.06]"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(page)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editing ? t('admin:pages.form.editTitle') : t('admin:pages.form.createTitle')}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Input
            label={t('admin:pages.form.title')}
            value={draft.title}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                title: event.target.value,
                slug: prev.slug ? prev.slug : slugify(event.target.value),
              }))
            }
          />

          <Input
            label={t('admin:pages.form.slug')}
            value={draft.slug}
            onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))}
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t('admin:pages.form.content')}
            </label>
            <textarea
              rows={6}
              value={draft.content}
              onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
            />
          </div>

          <Input
            label={t('admin:pages.form.description')}
            value={draft.description}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {t('admin:pages.form.status')}
              </label>
              <select
                value={draft.status}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, status: event.target.value as PageStatus }))
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-white"
              >
                <option value="published">{t('admin:pages.status.published')}</option>
                <option value="draft">{t('admin:pages.status.draft')}</option>
              </select>
            </div>

            <Input
              label={t('admin:pages.form.template')}
              value={draft.template}
              placeholder="landing"
              onChange={(event) => setDraft((prev) => ({ ...prev, template: event.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              {t('admin:pages.form.cancel')}
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              isLoading={isCreating || isUpdating}
            >
              {editing ? t('admin:pages.form.save') : t('admin:pages.form.create')}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={t('admin:pages.deleteDialog.title')}
        description={t('admin:pages.deleteDialog.description', { name: pendingDelete?.title ?? '' })}
        confirmLabel={t('admin:pages.deleteDialog.confirm')}
        cancelLabel={t('admin:pages.deleteDialog.cancel')}
        variant="danger"
        isLoading={isDeleting}
        onConfirm={() => void handleDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default PagesView;
