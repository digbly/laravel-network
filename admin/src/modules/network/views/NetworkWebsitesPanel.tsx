import { type FC, type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { Input } from '../../../components/ui/Input';
import {
  useCreateNetworkWebsiteMutation,
  useDeleteNetworkWebsiteMutation,
  useGetNetworkUsersQuery,
  useGetNetworkWebsitesQuery,
  useUpdateNetworkWebsiteMutation,
} from '../../../store/services/networkAdminApi';
import { getErrorMessage } from '../../../utils/apiError';
import type { CreateWebsitePayload, Website, WebsiteStatus } from '../../../types/website';
import type { AdminUser } from '../../../types/user';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Pagination } from '../components/Pagination';
import {
  NetworkWebsiteFormModal,
  type NetworkWebsiteFormValues,
} from '../components/NetworkWebsiteFormModal';

const PER_PAGE = 10;

const statusVariant: Record<WebsiteStatus, 'emerald' | 'slate' | 'amber'> = {
  active: 'emerald',
  inactive: 'slate',
  suspended: 'amber',
};

const STATUSES: WebsiteStatus[] = ['active', 'inactive', 'suspended'];

interface Notice {
  type: 'success' | 'error';
  message: string;
}

const RowAction: FC<{
  label: string;
  onClick: () => void;
  tone?: 'default' | 'danger' | 'accent';
  children: ReactNode;
}> = ({ label, onClick, tone = 'default', children }) => {
  const toneClasses = {
    default:
      'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/[0.08]',
    danger:
      'text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 dark:hover:text-rose-300',
    accent:
      'text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 dark:text-indigo-400 dark:hover:text-indigo-300',
  };

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
};

export const NetworkWebsitesPanel = () => {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<WebsiteStatus | ''>('');
  const [notice, setNotice] = useState<Notice | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formWebsite, setFormWebsite] = useState<Website | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Website | null>(null);

  const [createWebsite, createState] = useCreateNetworkWebsiteMutation();
  const [updateWebsite, updateState] = useUpdateNetworkWebsiteMutation();
  const [deleteWebsite, deleteState] = useDeleteNetworkWebsiteMutation();

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

  const { data, isFetching, isError, refetch } = useGetNetworkWebsitesQuery({
    page,
    per_page: PER_PAGE,
    q: search || undefined,
    status: status || undefined,
  });

  const { data: ownersData } = useGetNetworkUsersQuery(
    { per_page: 100, sort: 'name', direction: 'asc' },
    { skip: !isFormOpen }
  );

  const websites = data?.data ?? [];
  const meta = data?.meta;

  const ownerOptions: AdminUser[] = useMemo(() => {
    const list = ownersData?.data ?? [];
    const currentOwner = formWebsite?.owner;

    if (currentOwner && !list.some((owner) => String(owner.id) === String(currentOwner.id))) {
      return [currentOwner, ...list];
    }

    return list;
  }, [ownersData, formWebsite]);

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const openCreate = () => {
    setFormWebsite(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEdit = (website: Website) => {
    setFormWebsite(website);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormWebsite(null);
    setFormError(null);
  };

  const handleFormSubmit = async (values: NetworkWebsiteFormValues) => {
    setFormError(null);

    const payload: CreateWebsitePayload = {
      title: values.title,
      subdomain: values.subdomain,
      status: values.status,
      user_id: values.user_id,
      domain: values.domain || null,
      description: values.description || null,
    };

    try {
      if (formWebsite) {
        await updateWebsite({ id: formWebsite.id, body: payload }).unwrap();
        setNotice({ type: 'success', message: t('admin.networkAdmin.notices.websiteUpdated') });
      } else {
        await createWebsite(payload).unwrap();
        setNotice({ type: 'success', message: t('admin.networkAdmin.notices.websiteCreated') });
      }

      closeForm();
    } catch (error) {
      setFormError(getErrorMessage(error, t('admin.networkAdmin.errors.saveFailed')));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteWebsite(deleteTarget.id).unwrap();
      setNotice({ type: 'success', message: t('admin.networkAdmin.notices.websiteDeleted') });
    } catch (error) {
      setNotice({
        type: 'error',
        message: getErrorMessage(error, t('admin.networkAdmin.errors.deleteFailed')),
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const isSaving = createState.isLoading || updateState.isLoading;

  return (
    <div className="space-y-5">
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

      {isError && <ErrorAlert message={t('admin.networkAdmin.errors.websitesLoadFailed')} />}

      <div className="flex justify-end">
        <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
          {t('admin.networkAdmin.websites.add')}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t('admin.networkAdmin.websites.searchPlaceholder')}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as WebsiteStatus | '');
                setPage(1);
              }}
              className="w-full bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-sm rounded-xl px-3.5 py-2.5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">{t('admin.networkAdmin.websites.allStatuses')}</option>
              {STATUSES.map((item) => (
                <option key={item} value={item}>
                  {t(`admin.network.status.${item}`)}
                </option>
              ))}
            </select>
          </div>

          {meta && (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              {t('admin.networkAdmin.websites.total', { total: meta.total })}
            </p>
          )}
        </CardBody>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <th className="px-6 py-3 font-semibold">{t('admin.networkAdmin.websites.table.website')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.networkAdmin.websites.table.owner')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.networkAdmin.websites.table.status')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.networkAdmin.websites.table.members')}</th>
                <th className="px-6 py-3 font-semibold">{t('admin.networkAdmin.websites.table.created')}</th>
                <th className="px-6 py-3 font-semibold text-right">
                  {t('admin.networkAdmin.websites.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
              {isFetching && websites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t('admin.networkAdmin.websites.loading')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {!isFetching && websites.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Globe className="w-6 h-6 text-slate-400" />
                      <span>{t('admin.networkAdmin.websites.empty')}</span>
                    </div>
                  </td>
                </tr>
              )}

              {websites.map((website) => (
                <tr
                  key={website.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                        {website.title.trim().charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {website.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {website.domain || `${website.subdomain}.`}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                      {website.owner?.name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {website.owner?.email ?? ''}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <Badge variant={statusVariant[website.status] ?? 'slate'} size="sm" dot>
                      {website.status_label || website.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {website.users_count ?? 0}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(website.created_at)}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <RowAction
                        label={t('admin.networkAdmin.websites.actions.edit')}
                        onClick={() => openEdit(website)}
                        tone="accent"
                      >
                        <Pencil className="w-4 h-4" />
                      </RowAction>

                      <RowAction
                        label={t('admin.networkAdmin.websites.actions.delete')}
                        onClick={() => setDeleteTarget(website)}
                        tone="danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </RowAction>
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
            {t('admin.networkAdmin.errors.retry')}
          </Button>
        </div>
      )}

      {isFormOpen && (
        <NetworkWebsiteFormModal
          website={formWebsite}
          ownerOptions={ownerOptions}
          isSubmitting={isSaving}
          error={formError}
          onSubmit={(values) => void handleFormSubmit(values)}
          onClose={closeForm}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={t('admin.networkAdmin.websiteDelete.title')}
        description={t('admin.networkAdmin.websiteDelete.description', {
          name: deleteTarget?.title ?? '',
        })}
        confirmLabel={t('admin.networkAdmin.websiteDelete.confirm')}
        cancelLabel={t('admin.networkAdmin.websiteDelete.cancel')}
        isLoading={deleteState.isLoading}
        variant="danger"
        onConfirm={() => void handleDelete()}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
