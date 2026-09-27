import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type {
  CustomizeIndexData,
  CustomizeUpdatePayload,
  CustomizeWidgetData,
  PageBlocksData,
} from '../../types/customize';

export const customizeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCustomize: builder.query<ApiResponse<CustomizeIndexData>, void>({
      query: () => adminApiPath('/customize'),
      providesTags: [{ type: 'AdminCustomize', id: 'INDEX' }],
    }),

    updateCustomize: builder.mutation<ApiResponse<{ message: string }>, CustomizeUpdatePayload>({
      query: (body) => ({
        url: adminApiPath('/customize'),
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'AdminCustomize', id: 'INDEX' },
        { type: 'AdminWidget', id: 'INDEX' },
        { type: 'AdminPage', id: 'LIST' },
      ],
    }),

    getPageBlocks: builder.query<PageBlocksData, string>({
      query: (pageId) => adminApiPath(`/customize/page-blocks/${pageId}`),
      providesTags: (_result, _error, pageId) => [{ type: 'AdminPage', id: pageId }],
    }),

    getCustomizeWidgets: builder.query<CustomizeWidgetData, void>({
      query: () => adminApiPath('/customize/widgets'),
      providesTags: [{ type: 'AdminCustomize', id: 'WIDGETS' }],
    }),
  }),
});

export const {
  useGetCustomizeQuery,
  useUpdateCustomizeMutation,
  useGetPageBlocksQuery,
  useLazyGetPageBlocksQuery,
  useGetCustomizeWidgetsQuery,
} = customizeApi;
