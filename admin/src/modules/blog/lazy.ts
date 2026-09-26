import { lazy } from 'react';

export const PostsView = lazy(() =>
  import('./views/PostsView').then((module) => ({ default: module.PostsView }))
);

export const CategoriesView = lazy(() =>
  import('./views/CategoriesView').then((module) => ({ default: module.CategoriesView }))
);

export const CommentsView = lazy(() =>
  import('./views/CommentsView').then((module) => ({ default: module.CommentsView }))
);
