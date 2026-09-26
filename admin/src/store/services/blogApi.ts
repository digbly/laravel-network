import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type {
  AdminCategory,
  AdminComment,
  AdminPost,
  CategoryListParams,
  CategoryPaginatedResponse,
  CategoryPayload,
  CommentListParams,
  CommentPaginatedResponse,
  CommentStatus,
  MessageResponse,
  PostListParams,
  PostPaginatedResponse,
  PostPayload,
} from '../../types/blog';

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

export const blogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<PostPaginatedResponse, PostListParams>({
      query: (params) => `${adminApiPath('/blog/posts')}${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminPost' as const, id })),
              { type: 'AdminPost' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminPost' as const, id: 'LIST' }],
    }),

    getPost: builder.query<ApiResponse<AdminPost>, string>({
      query: (id) => adminApiPath(`/blog/posts/${id}`),
      providesTags: (_result, _error, id) => [{ type: 'AdminPost', id }],
    }),

    createPost: builder.mutation<ApiResponse<AdminPost>, PostPayload>({
      query: (body) => ({ url: adminApiPath('/blog/posts'), method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminPost', id: 'LIST' }],
    }),

    updatePost: builder.mutation<ApiResponse<AdminPost>, { id: string; body: PostPayload }>({
      query: ({ id, body }) => ({ url: adminApiPath(`/blog/posts/${id}`), method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminPost', id },
        { type: 'AdminPost', id: 'LIST' },
      ],
    }),

    deletePost: builder.mutation<MessageResponse, string>({
      query: (id) => ({ url: adminApiPath(`/blog/posts/${id}`), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminPost', id },
        { type: 'AdminPost', id: 'LIST' },
      ],
    }),

    getCategories: builder.query<CategoryPaginatedResponse, CategoryListParams>({
      query: (params) => `${adminApiPath('/blog/categories')}${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminCategory' as const, id })),
              { type: 'AdminCategory' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminCategory' as const, id: 'LIST' }],
    }),

    createCategory: builder.mutation<ApiResponse<AdminCategory>, CategoryPayload>({
      query: (body) => ({ url: adminApiPath('/blog/categories'), method: 'POST', body }),
      invalidatesTags: [{ type: 'AdminCategory', id: 'LIST' }],
    }),

    updateCategory: builder.mutation<
      ApiResponse<AdminCategory>,
      { id: string; body: CategoryPayload }
    >({
      query: ({ id, body }) => ({ url: adminApiPath(`/blog/categories/${id}`), method: 'PUT', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminCategory', id },
        { type: 'AdminCategory', id: 'LIST' },
      ],
    }),

    deleteCategory: builder.mutation<MessageResponse, string>({
      query: (id) => ({ url: adminApiPath(`/blog/categories/${id}`), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminCategory', id },
        { type: 'AdminCategory', id: 'LIST' },
      ],
    }),

    getComments: builder.query<CommentPaginatedResponse, CommentListParams>({
      query: (params) => `${adminApiPath('/blog/comments')}${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminComment' as const, id })),
              { type: 'AdminComment' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminComment' as const, id: 'LIST' }],
    }),

    updateComment: builder.mutation<
      ApiResponse<AdminComment>,
      { id: string; status: CommentStatus }
    >({
      query: ({ id, status }) => ({
        url: adminApiPath(`/blog/comments/${id}`),
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminComment', id },
        { type: 'AdminComment', id: 'LIST' },
      ],
    }),

    deleteComment: builder.mutation<MessageResponse, string>({
      query: (id) => ({ url: adminApiPath(`/blog/comments/${id}`), method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminComment', id },
        { type: 'AdminComment', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCommentsQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = blogApi;
