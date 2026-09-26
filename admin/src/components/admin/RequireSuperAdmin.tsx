import { type FC, type ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { useGetProfileQuery } from '../../store/services/userApi';
import { PageLoader } from '../ui/PageLoader';
import { ForbiddenView } from './ForbiddenView';

interface RequireSuperAdminProps {
  children: ReactNode;
}

/**
 * Guards network-wide management pages. Super admin access is the real
 * boundary server-side; this only decides what the SPA renders.
 */
export const RequireSuperAdmin: FC<RequireSuperAdminProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useGetProfileQuery();

  useEffect(() => {
    if (data?.data) dispatch(setUser(data.data));
  }, [data, dispatch]);

  const currentUser = data?.data ?? user;

  if (!currentUser && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16]">
        <PageLoader />
      </div>
    );
  }

  if (!currentUser?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090D16] px-4">
        <div className="w-full max-w-lg">
          <ForbiddenView />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
