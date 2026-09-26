import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { FolderTree, MessageSquare, Newspaper } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const tabs = [
  { to: '/blog/posts', labelKey: 'admin.nav.blogPosts', Icon: Newspaper },
  { to: '/blog/categories', labelKey: 'admin.nav.blogCategories', Icon: FolderTree },
  { to: '/blog/comments', labelKey: 'admin.nav.blogComments', Icon: MessageSquare },
];

export const BlogTabs: FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.06] w-fit">
      {tabs.map(({ to, labelKey, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? 'bg-white dark:bg-[#0F1626] text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`
          }
        >
          <Icon className="w-3.5 h-3.5" />
          {t(labelKey)}
        </NavLink>
      ))}
    </div>
  );
};
