import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { NavigationItem } from '../../types/navigation';

export interface NavigationResponse {
  data: NavigationItem[];
}

export const navigationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNavigation: builder.query<NavigationResponse, void>({
      query: () => adminApiPath('/navigation'),
      providesTags: ['Navigation'],
    }),
  }),
});

export const { useGetNavigationQuery } = navigationApi;
