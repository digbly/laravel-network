import { type FC, Suspense, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { useSidebar } from './useSidebar';
import { RequirePermission } from '../auth/RequirePermission';
import { PageLoader } from '../ui/PageLoader';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/slices/authSlice';
import { setLastWebsiteId } from '../../utils/website';
import { useGetProfileQuery } from '../../store/services/userApi';

export const AdminLayout: FC = () => {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();
  const { websiteId } = useParams<{ websiteId: string }>();
  const dispatch = useAppDispatch();
  const { data: profile } = useGetProfileQuery();
  const profileUser = profile?.data;

  useEffect(() => {
    if (profileUser) dispatch(setUser(profileUser));
  }, [profileUser, dispatch]);

  useEffect(() => {
    if (websiteId) setLastWebsiteId(websiteId);
  }, [websiteId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-500">
      <AdminSidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <AdminTopbar onOpenSidebar={openSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <RequirePermission>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </RequirePermission>
          </div>
        </main>
      </div>
    </div>
  );
};
