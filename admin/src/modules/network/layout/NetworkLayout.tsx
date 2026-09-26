import { type FC, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { NetworkSidebar } from './NetworkSidebar';
import { NetworkTopbar } from './NetworkTopbar';
import { useSidebar } from '../../../components/layout/useSidebar';
import { PageLoader } from '../../../components/ui/PageLoader';

export const NetworkLayout: FC = () => {
  const { sidebarOpen, openSidebar, closeSidebar } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500/20 selection:text-indigo-500">
      <NetworkSidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <NetworkTopbar onOpenSidebar={openSidebar} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
};
