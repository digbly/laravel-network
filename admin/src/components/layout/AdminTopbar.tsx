import type { FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getRouteTitle } from '../../app/registry';
import { stripWebsitePrefix } from '../../utils/website';
import { TopbarShell } from './TopbarShell';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export const AdminTopbar: FC<AdminTopbarProps> = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { websiteId } = useParams<{ websiteId: string }>();
  const { pathname } = useLocation();
  const routePath = stripWebsitePrefix(pathname, websiteId);
  const titleKey = getRouteTitle(routePath) ?? 'admin.nav.dashboard';

  return (
    <TopbarShell title={t(titleKey)} onOpenSidebar={onOpenSidebar} />
  );
};
