import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Globe, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserMenu } from '../../../components/layout/UserMenu';
import { NetworkUsersPanel } from './NetworkUsersPanel';
import { NetworkWebsitesPanel } from './NetworkWebsitesPanel';

type NetworkTab = 'websites' | 'users';

export const NetworkView = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<NetworkTab>('websites');

  const tabs: { id: NetworkTab; labelKey: string; Icon: typeof Globe }[] = [
    { id: 'websites', labelKey: 'admin.networkAdmin.tabs.websites', Icon: Globe },
    { id: 'users', labelKey: 'admin.networkAdmin.tabs.users', Icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-500/15 dark:bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link
          to="/network"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
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
              {t('admin.networkAdmin.brandDesc')}
            </p>
          </div>
        </Link>

        <UserMenu />
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-3">
          <Link
            to="/websites"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t('admin.networkAdmin.backToWebsites')}
          </Link>

          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t('admin.networkAdmin.title')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('admin.networkAdmin.subtitle')}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] w-fit"
        >
          {tabs.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === id
                  ? 'bg-white dark:bg-[#0F1626] text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(labelKey)}
            </button>
          ))}
        </div>

        {tab === 'websites' ? <NetworkWebsitesPanel /> : <NetworkUsersPanel />}
      </main>
    </div>
  );
};
