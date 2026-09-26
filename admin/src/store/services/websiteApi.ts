import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { Website } from '../../types/website';

export const websiteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyWebsites: builder.query<ApiResponse<Website[]>, void>({
      query: () => '/admin/websites',
      providesTags: ['Website'],
    }),
  }),
});

export const { useGetMyWebsitesQuery } = websiteApi;
