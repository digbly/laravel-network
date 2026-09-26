import { type FC, type ReactNode } from 'react';
import { useMatches } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { hasPermission } from '../../utils/permission';
import { ForbiddenView } from '../admin/ForbiddenView';

interface RequirePermissionProps {
  children: ReactNode;
}

interface RouteHandle {
  permission?: string;
}

export const RequirePermission: FC<RequirePermissionProps> = ({ children }) => {
  const matches = useMatches();
  const permissions = useAppSelector((state) => state.auth.user?.permissions);

  const requiredPermission = matches
    .map((match) => (match.handle as RouteHandle | undefined)?.permission)
    .filter((permission): permission is string => Boolean(permission))
    .at(-1);

  if (!hasPermission(permissions, requiredPermission)) {
    return <ForbiddenView />;
  }

  return <>{children}</>;
};
