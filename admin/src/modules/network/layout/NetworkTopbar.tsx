import type { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TopbarShell } from '../../../components/layout/TopbarShell';
import { getNetworkTitleKey } from '../nav';

interface NetworkTopbarProps {
  onOpenSidebar: () => void;
}

export const NetworkTopbar: FC<NetworkTopbarProps> = ({ onOpenSidebar }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <TopbarShell
      title={t(getNetworkTitleKey(pathname))}
      onOpenSidebar={onOpenSidebar}
    />
  );
};
