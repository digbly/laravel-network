import type { ComponentType } from 'react';
import {
  Activity,
  Calendar,
  Cpu,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Users,
  Wifi,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardHeader } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ErrorAlert } from '../../../components/ui/ErrorAlert';
import { useAppSelector } from '../../../store/hooks';
import { useGetProfileQuery } from '../../../store/services/userApi';
import { getRoleVariant } from '../../../utils/role';

interface StatItem {
  key: string;
  Icon: ComponentType<{ className?: string }>;
  accent: string;
}

const stats: StatItem[] = [
  { key: 'members', Icon: Users, accent: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
  { key: 'devices', Icon: Cpu, accent: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
  { key: 'sessions', Icon: Wifi, accent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { key: 'events', Icon: Activity, accent: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
];

export const DashboardView = () => {
  const { t, i18n } = useTranslation();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const { data, isLoading, isError, isFetching, refetch } = useGetProfileQuery();

  const user = data?.data ?? reduxUser;
  const isVerified = Boolean(user?.email_verified_at);

  const formatDate = (value?: string | null): string =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : '—';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('admin.dashboard.welcome', {
              name: user?.name || t('admin.dashboard.guest'),
            })}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t('admin.dashboard.subtitle')}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
        >
          {t('admin.dashboard.refresh')}
        </Button>
      </div>

      {isError && (
        <div className="space-y-3">
          <ErrorAlert message={t('admin.dashboard.errors.loadFailed')} />
          <Button variant="secondary" size="sm" onClick={() => void refetch()}>
            {t('admin.dashboard.errors.retry')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader
            title={t('admin.dashboard.account.title')}
            subtitle={t('admin.dashboard.account.subtitle')}
            action={
              isVerified ? (
                <Badge variant="emerald" size="sm" dot>
                  {t('admin.dashboard.account.verified')}
                </Badge>
              ) : (
                <Badge variant="amber" size="sm" dot>
                  {t('admin.dashboard.account.unverified')}
                </Badge>
              )
            }
          />
          <CardBody>
            {isLoading && !user ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('admin.dashboard.loading')}</span>
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                    {t('admin.dashboard.account.name')}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.name || '—'}
                  </dd>
                </div>

                <div className="min-w-0">
                  <dt className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                    {t('admin.dashboard.account.email')}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white min-w-0">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email || '—'}</span>
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                    {t('admin.dashboard.account.role')}
                  </dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-1.5">
                    {user?.is_super_admin && (
                      <Badge variant="violet" size="sm">
                        <ShieldCheck className="w-3 h-3" />
                        {t('admin.users.status.superAdmin')}
                      </Badge>
                    )}
                    {(user?.roles ?? []).map((roleName) => (
                      <Badge key={roleName} variant={getRoleVariant(roleName)} size="sm">
                        {roleName}
                      </Badge>
                    ))}
                    {!user?.is_super_admin && (user?.roles ?? []).length === 0 && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">—</span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                    {t('admin.dashboard.account.joined')}
                  </dt>
                  <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{formatDate(user?.created_at)}</span>
                  </dd>
                </div>
              </dl>
            )}
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <CardBody className="h-full flex flex-col justify-center">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
              {t('admin.dashboard.stats.title')}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('admin.dashboard.stats.comingSoon')}
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map(({ key, Icon, accent }) => (
          <Card key={key} className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${accent}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">—</p>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
              {t(`admin.dashboard.stats.cards.${key}`)}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {t('admin.dashboard.stats.noData')}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
