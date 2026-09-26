import { useCallback, useEffect, useState } from 'react';

interface SidebarController {
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

/**
 * Shared responsive sidebar state: closes on desktop resize and traps the
 * page scroll / Escape key while the mobile drawer is open.
 */
export const useSidebar = (): SidebarController => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setSidebarOpen(false);
    };

    desktopQuery.addEventListener('change', handleChange);
    return () => desktopQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sidebarOpen]);

  return { sidebarOpen, openSidebar, closeSidebar };
};
