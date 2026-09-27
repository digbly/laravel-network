import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type { Page, PagePayload } from '../../types/page';

export const pageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPages: builder.query<ApiResponse<Page[]>, void>({
      query: () => adminApiPath('/pages'),
      providesTags: [{ type: 'AdminPage', id: 'LIST' }],
    }),

    createPage: builder.mutation<ApiResponse<Page>, PagePayload>({
      query: (body) => ({
        url: adminApiPath('/pages'),
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminPage', id: 'LIST' }],
    }),

    updatePage: builder.mutation<ApiResponse<Page>, { id: string; body: PagePayload }>({
      query: ({ id, body }) => ({
        url: adminApiPath(`/pages/${id}`),
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'AdminPage', id: 'LIST' }],
    }),

    deletePage: builder.mutation<ApiResponse<{ message: string }>, string>({
      query: (id) => ({
        url: adminApiPath(`/pages/${id}`),
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'AdminPage', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetPagesQuery,
  useCreatePageMutation,
  useUpdatePageMutation,
  useDeletePageMutation,
} = pageApi;
