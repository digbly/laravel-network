import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type { WidgetIndexData, WidgetUpdatePayload } from '../../types/widget';

export const widgetApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWidgets: builder.query<ApiResponse<WidgetIndexData>, void>({
      query: () => adminApiPath('/widgets'),
      providesTags: [{ type: 'AdminWidget', id: 'INDEX' }],
    }),

    updateSidebarWidgets: builder.mutation<
      ApiResponse<never>,
      { sidebar: string; body: WidgetUpdatePayload }
    >({
      query: ({ sidebar, body }) => ({
        url: adminApiPath(`/widgets/${sidebar}`),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'AdminWidget', id: 'INDEX' }],
    }),
  }),
});

export const { useGetWidgetsQuery, useUpdateSidebarWidgetsMutation } = widgetApi;
