import { apiSlice } from './apiSlice';
import { websitesApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type { CreateWebsitePayload, Website } from '../../types/website';

export const websiteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyWebsites: builder.query<ApiResponse<Website[]>, void>({
      query: () => websitesApiPath(),
      providesTags: ['Website'],
    }),

    createWebsite: builder.mutation<ApiResponse<Website>, CreateWebsitePayload>({
      query: (body) => ({
        url: websitesApiPath(),
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Website'],
    }),
  }),
});

export const { useGetMyWebsitesQuery, useCreateWebsiteMutation } = websiteApi;
