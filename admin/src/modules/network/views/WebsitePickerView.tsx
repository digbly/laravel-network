import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { UserMenu } from '../../../components/layout/UserMenu';
import { useAppSelector } from '../../../store/hooks';
import {
  useCreateWebsiteMutation,
  useGetMyWebsitesQuery,
} from '../../../store/services/websiteApi';
import { getErrorMessage } from '../../../utils/apiError';
import { hasPermission } from '../../../utils/permission';
import { setLastWebsiteId, websitePath } from '../../../utils/website';
import type { CreateWebsitePayload, Website, WebsiteStatus } from '../../../types/website';
import { WebsiteFormModal, type WebsiteFormValues } from '../components/WebsiteFormModal';

const statusVariant: Record<WebsiteStatus, 'emerald' | 'slate' | 'amber'> = {
  active: 'emerald',
  inactive: 'slate',
  suspended: 'amber',
};

export const WebsitePickerView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError, isFetching, refetch } = useGetMyWebsitesQuery();
  const [createWebsite, createState] = useCreateWebsiteMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const websites = data?.data ?? [];
  const canCreate = hasPermission(user?.permissions, 'websites.create') && Boolean(user);

  useEffect(() => {
    if (!notice) return;

    const handle = window.setTimeout(() => setNotice(null), 4000);

    return () => window.clearTimeout(handle);
  }, [notice]);

  const openWebsite = (website: Website) => {
    setLastWebsiteId(website.id);
    navigate(websitePath('/dashboard', website.id));
  };

  const openCreate = () => {
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeCreate = () => {
    setIsFormOpen(false);
    setFormError(null);
  };

  const handleCreate = async (values: WebsiteFormValues) => {
    if (!user) return;

    setFormError(null);

    const payload: CreateWebsitePayload = {
      title: values.title,
      subdomain: values.subdomain,
      status: values.status,
      user_id: String(user.id),
    };

    if (values.description) payload.description = values.description;

    try {
      await createWebsite(payload).unwrap();
      setNotice(t('admin.network.notices.created'));
      closeCreate();
    } catch (error) {
      setFormError(getErrorMessage(error, t('admin.network.errors.createFailed')));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{t('layout.brand')}</span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                {t('layout.brandTag')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('admin.brandDesc')}
            </p>
          </div>
        </div>

        <UserMenu />
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('admin.network.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('admin.network.subtitle')}
            </p>
          </div>

          {canCreate && (
            <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
              {t('admin.network.create')}
            </Button>
          )}
        </div>

        {notice && (
          <div className="p-3 rounded-xl text-xs flex items-center gap-2.5 border bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>{t('admin.network.loading')}</span>
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <ErrorAlert message={t('admin.network.errors.loadFailed')} />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
            >
              {t('admin.network.errors.retry')}
            </Button>
          </div>
        ) : websites.length === 0 ? (
          <Card className="p-10 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center text-slate-500">
              <Globe className="w-6 h-6" />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
              {t('admin.network.empty.title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t('admin.network.empty.message')}
            </p>
            {canCreate && (
              <div className="mt-5 flex justify-center">
                <Button onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
                  {t('admin.network.create')}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {websites.map((website) => (
              <Card
                key={website.id}
                variant="interactive"
                role="button"
                tabIndex={0}
                onClick={() => openWebsite(website)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openWebsite(website);
                  }
                }}
                className="h-full p-5 flex flex-col gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold uppercase shrink-0">
                    {website.title.trim().charAt(0) || '?'}
                  </div>
                  <Badge
                    variant={statusVariant[website.status] ?? 'slate'}
                    size="sm"
                    dot
                  >
                    {website.status_label || website.status}
                  </Badge>
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {website.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                    {website.domain || website.subdomain}
                  </p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    {t('admin.network.usersCount', { total: website.users_count ?? 0 })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {t('admin.network.open')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {isFormOpen && (
        <WebsiteFormModal
          isSubmitting={createState.isLoading}
          error={formError}
          onSubmit={(values) => void handleCreate(values)}
          onClose={closeCreate}
        />
      )}
    </div>
  );
};
