import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Search,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import {
  useDeleteMediaMutation,
  useGetMediaQuery,
} from '../../../store/services/mediaApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { AdminMedia, MediaType } from '../../../types/media';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { MediaDetailsModal } from '../components/MediaDetailsModal';
import { MediaGrid } from '../components/MediaGrid';
import { MediaUploader } from '../components/MediaUploader';
import { Pagination } from '../components/Pagination';

const PER_PAGE = 24;

type TypeFilter = 'all' | MediaType;

const tabs: { key: TypeFilter; labelKey: string; Icon: typeof ImageIcon }[] = [
  { key: 'all', labelKey: 'admin.media.filters.all', Icon: FolderOpen },
  { key: 'image', labelKey: 'admin.media.filters.image', Icon: ImageIcon },
  { key: 'document', labelKey: 'admin.media.filters.document', Icon: FolderOpen },
];

export const MediaLibraryView = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [month, setMonth] = useState('');
  const [detailTarget, setDetailTarget] = useState<AdminMedia | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminMedia | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [deleteMedia, deleteState] = useDeleteMediaMutation();

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

  const { data, isFetching, isError, refetch } = useGetMediaQuery({
    page,
    per_page: PER_PAGE,
    search: search || undefined,
    type: type === 'all' ? undefined : type,
    month: month || undefined,
    sort: 'created_at',
    direction: 'desc',
  });

  const items = data?.data ?? [];

  const handleCopy = async (item: AdminMedia): Promise<void> => {
    if (!item.url) return;

    try {
      await navigator.clipboard.writeText(item.url);
      setNotice({ type: 'success', message: t('admin.media.notices.copied') });
    } catch {
      setNotice({ type: 'error', message: t('admin.media.errors.copyFailed') });
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;

    try {
      await deleteMedia(deleteTarget.id).unwrap();
      setNotice({ type: 'success', message: t('admin.media.notices.deleted') });

      if (detailTarget?.id === deleteTarget.id) {
        setDetailTarget(null);
      }
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error, t('admin.media.errors.deleteFailed')) });
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {t('admin.media.title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('admin.media.subtitle')}
        </p>
      </div>

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

      <Card>
        <CardBody>
          <MediaUploader
            onUploaded={() => {
              setNotice({ type: 'success', message: t('admin.media.notices.uploaded') });
              setPage(1);
            }}
          />
        </CardBody>
      </Card>

      <Card>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] w-fit">
            {tabs.map(({ key, labelKey, Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setType(key);
                  setPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  type === key
                    ? 'bg-white dark:bg-[#0F1626] text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(labelKey)}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col sm:flex-row gap-3 lg:justify-end">
            <div className="sm:w-64">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin.media.filters.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <input
              type="month"
              value={month}
              onChange={(event) => {
                setMonth(event.target.value);
                setPage(1);
              }}
              className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <CardBody>
          {isError ? (
            <div className="text-center py-10 space-y-3">
              <p className="text-sm text-rose-600 dark:text-rose-400">
                {t('admin.media.errors.loadFailed')}
              </p>
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('admin.media.errors.retry')}
              </button>
            </div>
          ) : isFetching && items.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-10 text-center">
              {t('admin.media.empty')}
            </p>
          ) : (
            <MediaGrid
              items={items}
              onOpen={setDetailTarget}
              onCopy={(item) => void handleCopy(item)}
              onDelete={setDeleteTarget}
            />
          )}
        </CardBody>

        <Pagination meta={data?.meta} isFetching={isFetching} onPageChange={setPage} />
      </Card>

      <MediaDetailsModal
        media={detailTarget}
        isOpen={detailTarget !== null}
        onClose={() => setDetailTarget(null)}
        onSaved={(updated) => {
          setDetailTarget(updated);
          setNotice({ type: 'success', message: t('admin.media.notices.updated') });
        }}
        onDelete={(item) => setDeleteTarget(item)}
      />

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('admin.media.deleteDialog.title')}
        description={t('admin.media.deleteDialog.description', {
          name: deleteTarget?.title || deleteTarget?.file_name || '',
        })}
        confirmLabel={t('admin.media.deleteDialog.confirm')}
        cancelLabel={t('admin.media.deleteDialog.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
