import { BookOpen, FolderTree, MessageSquare, Newspaper } from 'lucide-react';
import type { AdminModule } from '../../app/types';
import {
  CategoriesView,
  CategoryFormView,
  CommentsView,
  PostFormView,
  PostsView,
} from './lazy';
import i18nEn from './i18n/en.json';
import i18nVi from './i18n/vi.json';

export const blogModule: AdminModule = {
  nav: [
    {
      labelKey: 'admin.nav.blog',
      Icon: BookOpen,
      children: [
        {
          to: '/blog/posts',
          labelKey: 'admin.nav.blogPosts',
          Icon: Newspaper,
          permission: 'posts.view',
        },
        {
          to: '/blog/categories',
          labelKey: 'admin.nav.blogCategories',
          Icon: FolderTree,
          permission: 'categories.view',
        },
        {
          to: '/blog/comments',
          labelKey: 'admin.nav.blogComments',
          Icon: MessageSquare,
          permission: 'comments.view',
        },
      ],
    },
  ],
  routes: [
    {
      path: '/blog/posts',
      element: <PostsView />,
      handle: { permission: 'posts.view' },
    },
    {
      path: '/blog/posts/new',
      element: <PostFormView />,
      handle: { permission: 'posts.create' },
    },
    {
      path: '/blog/posts/:postId/edit',
      element: <PostFormView />,
      handle: { permission: 'posts.update' },
    },
    {
      path: '/blog/categories',
      element: <CategoriesView />,
      handle: { permission: 'categories.view' },
    },
    {
      path: '/blog/categories/new',
      element: <CategoryFormView />,
      handle: { permission: 'categories.create' },
    },
    {
      path: '/blog/categories/:categoryId/edit',
      element: <CategoryFormView />,
      handle: { permission: 'categories.update' },
    },
    {
      path: '/blog/comments',
      element: <CommentsView />,
      handle: { permission: 'comments.view' },
    },
  ],
  i18n: { en: i18nEn, vi: i18nVi },
};
