import type { FC } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SidebarShell } from '../../../components/layout/SidebarShell';
import { NETWORK_NAV_ITEMS } from '../nav';

interface NetworkSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const NetworkSidebar: FC<NetworkSidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  return (
    <SidebarShell
      id="network-sidebar"
      ariaLabel={t('admin.networkAdmin.nav.menuLabel')}
      open={open}
      onClose={onClose}
      brandTo="/network"
      brandDescriptionKey="admin.networkAdmin.brandDesc"
      items={NETWORK_NAV_ITEMS}
      footer={
        <Link
          to="/websites"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>{t('admin.networkAdmin.backToWebsites')}</span>
        </Link>
      }
    />
  );
};
