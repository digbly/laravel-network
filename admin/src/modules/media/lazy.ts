import { lazy } from 'react';

export const MediaLibraryView = lazy(() =>
  import('./views/MediaLibraryView').then((module) => ({ default: module.MediaLibraryView }))
);
