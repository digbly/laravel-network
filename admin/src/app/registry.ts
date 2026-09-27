import type { RouteObject } from 'react-router-dom';
import type { AdminModule } from './types';

const modules: AdminModule[] = [];

export const registerModules = (registered: AdminModule[]): void => {
  modules.push(...registered);
};

export const getAdminRoutes = (): RouteObject[] =>
  modules.flatMap((module) => module.routes ?? []);

export const getStandaloneAdminRoutes = (): RouteObject[] =>
  modules.flatMap((module) => module.standaloneRoutes ?? []);

export const getPublicRoutes = (): RouteObject[] =>
  modules.flatMap((module) => module.publicRoutes ?? []);
