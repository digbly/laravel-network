import type { FC } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { stripWebsitePrefix } from '../../utils/website';
import { resolveNavigationTitle } from '../../utils/navigation';
import { useGetNavigationQuery } from '../../store/services/navigationApi';
import { TopbarShell } from './TopbarShell';

interface AdminTopbarProps {
  onOpenSidebar: () => void;
}

export const AdminTopbar: FC<AdminTopbarProps> = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { websiteId } = useParams<{ websiteId: string }>();
  const { pathname } = useLocation();
  const { data } = useGetNavigationQuery();
  const routePath = stripWebsitePrefix(pathname, websiteId);
  const title = resolveNavigationTitle(data?.data ?? [], routePath) ?? t('admin.nav.dashboard');

  return <TopbarShell title={title} onOpenSidebar={onOpenSidebar} />;
};
