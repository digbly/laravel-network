import { useState, type FC, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { NavItem } from '../../app/types';

/** A collapsible sidebar group whose links are revealed on demand. */
export interface SidebarNavGroup {
  labelKey: string;
  Icon: NavItem['Icon'];
  children: NavItem[];
}

/** A sidebar entry is either a single link or a collapsible group of links. */
export type SidebarNavEntry = NavItem | SidebarNavGroup;

const isNavGroupEntry = (entry: SidebarNavEntry): entry is SidebarNavGroup =>
  'children' in entry;

const linkClassName = ({ isActive }: { isActive: boolean }): string =>
  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
    isActive
      ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/[0.04] border border-transparent'
  }`;

interface SidebarShellProps {
  id: string;
  ariaLabel: string;
  open: boolean;
  onClose: () => void;
  brandTo: string;
  brandDescriptionKey: string;
  items: SidebarNavEntry[];
  footer?: ReactNode;
}

/**
 * Presentational shell shared by the website admin and network admin sidebars.
 * Callers resolve their own navigation targets and branding.
 */
export const SidebarShell: FC<SidebarShellProps> = ({
  id,
  ariaLabel,
  open,
  onClose,
  brandTo,
  brandDescriptionKey,
  items,
  footer,
}) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Groups expand automatically when one of their links is active; clicking a
  // toggle stores an explicit override for the current session.
  const [groupOverrides, setGroupOverrides] = useState<Record<string, boolean>>({});

  const isGroupActive = (group: SidebarNavGroup): boolean =>
    group.children.some(
      (child) => pathname === child.to || pathname.startsWith(`${child.to}/`),
    );

  const isGroupOpen = (group: SidebarNavGroup): boolean =>
    groupOverrides[group.labelKey] ?? isGroupActive(group);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        id={id}
        aria-label={ariaLabel}
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white dark:bg-[#0F1626] border-r border-slate-200/80 dark:border-white/[0.07] transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0 visible' : '-translate-x-full invisible lg:visible'
        }`}
      >
        <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-slate-200/80 dark:border-white/[0.07]">
          <Link
            to={brandTo}
            onClick={onClose}
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>{t('layout.brand')}</span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {t('layout.brandTag')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {t(brandDescriptionKey)}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
            aria-label={t('admin.topbar.closeMenu')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map((entry) => {
            if (!isNavGroupEntry(entry)) {
              const { to, labelKey, Icon, end } = entry;

              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={linkClassName}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{t(labelKey)}</span>
                </NavLink>
              );
            }

            const groupId = `sidebar-nav-group-${id}-${entry.labelKey.replace(/\./g, '-')}`;
            const expanded = isGroupOpen(entry);

            return (
              <div key={entry.labelKey} className="space-y-1">
                <button
                  type="button"
                  onClick={() =>
                    setGroupOverrides((previous) => ({
                      ...previous,
                      [entry.labelKey]: !expanded,
                    }))
                  }
                  aria-expanded={expanded}
                  aria-controls={groupId}
                  className={`w-full ${linkClassName({ isActive: isGroupActive(entry) })}`}
                >
                  <entry.Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{t(entry.labelKey)}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {expanded && (
                  <div id={groupId} className="space-y-1 pl-4">
                    {entry.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        end={child.end}
                        onClick={onClose}
                        className={linkClassName}
                      >
                        <child.Icon className="w-4 h-4 shrink-0" />
                        <span>{t(child.labelKey)}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200/80 dark:border-white/[0.07] space-y-1">
          {footer}
          <p className="px-3 text-[10px] text-slate-400 dark:text-slate-500">
            {t('admin.version')}
          </p>
        </div>
      </aside>
    </>
  );
};
