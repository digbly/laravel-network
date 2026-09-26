import { lazy } from 'react';

export const PostsView = lazy(() =>
  import('./views/PostsView').then((module) => ({ default: module.PostsView }))
);

export const PostFormView = lazy(() =>
  import('./views/PostFormView').then((module) => ({ default: module.PostFormView }))
);

export const CategoriesView = lazy(() =>
  import('./views/CategoriesView').then((module) => ({ default: module.CategoriesView }))
);

export const CategoryFormView = lazy(() =>
  import('./views/CategoryFormView').then((module) => ({ default: module.CategoryFormView }))
);

export const CommentsView = lazy(() =>
  import('./views/CommentsView').then((module) => ({ default: module.CommentsView }))
);
