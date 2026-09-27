import { apiSlice } from './apiSlice';
import { websitesApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type { SettingsData, UpdateSettingsPayload } from '../../types/setting';

export const settingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<ApiResponse<SettingsData>, string>({
      query: (websiteId) => `${websitesApiPath()}/${websiteId}/settings`,
      providesTags: (_result, _error, websiteId) => [{ type: 'Setting', id: websiteId }],
    }),

    updateSettings: builder.mutation<
      ApiResponse<SettingsData>,
      { websiteId: string; body: UpdateSettingsPayload }
    >({
      query: ({ websiteId, body }) => ({
        url: `${websitesApiPath()}/${websiteId}/settings`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { websiteId }) => [{ type: 'Setting', id: websiteId }],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingApi;
