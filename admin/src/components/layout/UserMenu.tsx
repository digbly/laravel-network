import { type FC, useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../store/hooks';
import { useLogoutMutation } from '../../store/services/authApi';
import { getRoleVariant } from '../../utils/role';

const getInitials = (value: string): string => {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const UserMenu: FC = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const [logout, { isLoading }] = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const displayName = user?.name || user?.email || t('admin.userMenu.fallbackName');
  const initials = getInitials(user?.name || user?.email || '');
  const roles = user?.roles ?? [];

  const handleLogout = () => {
    setOpen(false);
    void logout();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={displayName}
        className="flex items-center gap-2.5 pl-1.5 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors cursor-pointer"
      >
        <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-xs font-bold flex items-center justify-center overflow-hidden shrink-0">
          {user?.avatar ? (
            <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden sm:block max-w-[10rem] text-left">
          <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
            {displayName}
          </span>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {user?.email || t('admin.userMenu.noEmail')}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 glass-dropdown rounded-2xl p-2 z-50 animate-in fade-in duration-150"
        >
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {displayName}
              </p>
              {user?.is_super_admin ? (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  {t('admin.users.status.superAdmin')}
                </span>
              ) : (
                roles[0] && (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                      getRoleVariant(roles[0]) === 'cyan'
                        ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    }`}
                  >
                    {roles[0]}
                  </span>
                )
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {user?.email || t('admin.userMenu.noEmail')}
            </p>
          </div>

          <div className="h-px bg-slate-200/70 dark:bg-white/[0.07] my-1" />

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            role="menuitem"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>{t('admin.userMenu.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
