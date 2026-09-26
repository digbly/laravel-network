import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type {
  AdminMedia,
  MediaListParams,
  MediaPaginatedResponse,
  UpdateMediaPayload,
} from '../../types/media';

const buildQueryString = (params: object): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

export interface UploadMediaArgs {
  files: File[];
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
}

export const mediaApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMedia: builder.query<MediaPaginatedResponse, MediaListParams>({
      query: (params) => `${adminApiPath('/media')}${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminMedia' as const, id })),
              { type: 'AdminMedia' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminMedia' as const, id: 'LIST' }],
    }),

    uploadMedia: builder.mutation<ApiResponse<AdminMedia[]>, UploadMediaArgs>({
      query: ({ files, ...metadata }) => {
        const body = new FormData();

        files.forEach((file) => body.append('files[]', file));

        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            body.append(key, value);
          }
        });

        return { url: adminApiPath('/media'), method: 'POST', body };
      },
      invalidatesTags: [{ type: 'AdminMedia', id: 'LIST' }],
    }),

    updateMedia: builder.mutation<
      ApiResponse<AdminMedia>,
      { id: string; body: UpdateMediaPayload }
    >({
      query: ({ id, body }) => ({ url: adminApiPath(`/media/${id}`), method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminMedia', id },
        { type: 'AdminMedia', id: 'LIST' },
      ],
    }),

    deleteMedia: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: adminApiPath(`/media/${id}`), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminMedia', id },
        { type: 'AdminMedia', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetMediaQuery,
  useUploadMediaMutation,
  useUpdateMediaMutation,
  useDeleteMediaMutation,
} = mediaApi;
