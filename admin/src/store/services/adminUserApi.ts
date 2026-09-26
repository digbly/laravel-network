import { apiSlice } from './apiSlice';
import { adminApiPath } from '../../utils/website';
import type { ApiResponse } from '../../types/auth';
import type {
  AdminUser,
  CreateUserPayload,
  MessageResponse,
  PaginatedResponse,
  ResetUserPasswordPayload,
  Role,
  UpdateUserPayload,
  UserListParams,
} from '../../types/user';

const buildQueryString = (params: UserListParams): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

export const adminUserApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => adminApiPath('/roles'),
      providesTags: ['AdminRole'],
    }),

    getUsers: builder.query<PaginatedResponse<AdminUser>, UserListParams>({
      query: (params) => `${adminApiPath('/users')}${buildQueryString(params)}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'AdminUser' as const, id })),
              { type: 'AdminUser' as const, id: 'LIST' },
            ]
          : [{ type: 'AdminUser' as const, id: 'LIST' }],
    }),

    getUser: builder.query<ApiResponse<AdminUser>, string>({
      query: (id) => adminApiPath(`/users/${id}`),
      providesTags: (_result, _error, id) => [{ type: 'AdminUser', id }],
    }),

    createUser: builder.mutation<ApiResponse<AdminUser>, CreateUserPayload>({
      query: (body) => ({
        url: adminApiPath('/users'),
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'AdminUser', id: 'LIST' }],
    }),

    updateUser: builder.mutation<
      ApiResponse<AdminUser>,
      { id: string; body: UpdateUserPayload }
    >({
      query: ({ id, body }) => ({
        url: adminApiPath(`/users/${id}`),
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'AdminUser', id },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: adminApiPath(`/users/${id}`),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminUser', id },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    restoreUser: builder.mutation<ApiResponse<AdminUser>, string>({
      query: (id) => ({
        url: adminApiPath(`/users/${id}/restore`),
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'AdminUser', id },
        { type: 'AdminUser', id: 'LIST' },
      ],
    }),

    resetUserPassword: builder.mutation<
      ApiResponse<MessageResponse>,
      { id: string; body: ResetUserPasswordPayload }
    >({
      query: ({ id, body }) => ({
        url: adminApiPath(`/users/${id}/password`),
        method: 'PUT',
        body,
      }),
    }),

    resendUserVerification: builder.mutation<ApiResponse<MessageResponse>, string>({
      query: (id) => ({
        url: adminApiPath(`/users/${id}/resend-verification`),
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useResetUserPasswordMutation,
  useResendUserVerificationMutation,
} = adminUserApi;
