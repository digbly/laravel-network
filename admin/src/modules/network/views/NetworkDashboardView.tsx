import type { ComponentType } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useGetNetworkDashboardQuery } from '../../../store/services/networkAdminApi';
import type { WebsiteStatus } from '../../../types/website';

const statusVariant: Record<WebsiteStatus, 'emerald' | 'slate' | 'amber'> = {
  active: 'emerald',
  inactive: 'slate',
  suspended: 'amber',
};

interface StatItem {
  key: string;
  Icon: ComponentType<{ className?: string }>;
  accent: string;
  value: number | undefined;
  to: string;
}

export const NetworkDashboardView = () => {
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError, isFetching, refetch } = useGetNetworkDashboardQuery();

  const dashboard = data?.data;
  const recentWebsites = dashboard?.recent_websites ?? [];
  const recentUsers = dashboard?.recent_users ?? [];

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '—';

  const stats: StatItem[] = [
    {
      key: 'websites',
      Icon: Globe,
      accent: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      value: dashboard?.stats.websites.total,
      to: '/network/websites',
    },
    {
      key: 'active',
      Icon: CheckCircle2,
      accent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      value: dashboard?.stats.websites.active,
      to: '/network/websites',
    },
    {
      key: 'suspended',
      Icon: AlertTriangle,
      accent: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      value: dashboard?.stats.websites.suspended,
      to: '/network/websites',
    },
    {
      key: 'users',
      Icon: Users,
      accent: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      value: dashboard?.stats.users.total,
      to: '/network/users',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.networkAdmin.dashboard.title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('admin.networkAdmin.dashboard.subtitle')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          {t('admin.networkAdmin.dashboard.refresh')}
        </Button>
      </div>

      {isError && (
        <div className="space-y-3">
          <ErrorAlert message={t('admin.networkAdmin.dashboard.errors.loadFailed')} />
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('admin.networkAdmin.errors.retry')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map(({ key, Icon, accent, value, to }) => (
          <Link
            key={key}
            to={to}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl"
          >
            <Card className="p-5 h-full transition-all hover:border-indigo-500/40 hover:shadow-md">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accent}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  value ?? '—'
                )}
              </p>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                {t(`admin.networkAdmin.dashboard.stats.${key}`)}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title={t('admin.networkAdmin.dashboard.recentWebsites.title')}
            subtitle={t('admin.networkAdmin.dashboard.recentWebsites.subtitle')}
            action={
              <Link
                to="/network/websites"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('admin.networkAdmin.dashboard.viewAll')}
              </Link>
            }
          />
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin.networkAdmin.websites.loading')}</span>
              </div>
            ) : recentWebsites.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('admin.networkAdmin.dashboard.recentWebsites.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {recentWebsites.map((website) => (
                  <li key={website.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                      {website.title.trim().charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {website.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {website.owner?.name || website.owner?.email || '—'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={statusVariant[website.status] ?? 'slate'} size="sm" dot>
                        {website.status_label || website.status}
                      </Badge>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {formatDate(website.created_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title={t('admin.networkAdmin.dashboard.recentUsers.title')}
            subtitle={t('admin.networkAdmin.dashboard.recentUsers.subtitle')}
            action={
              <Link
                to="/network/users"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {t('admin.networkAdmin.dashboard.viewAll')}
              </Link>
            }
          />
          <CardBody className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin.networkAdmin.users.loading')}</span>
              </div>
            ) : recentUsers.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                {t('admin.networkAdmin.dashboard.recentUsers.empty')}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                {recentUsers.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {user.name.trim().charAt(0) || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                      {formatDate(user.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
