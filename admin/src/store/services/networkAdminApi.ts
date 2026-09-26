import { apiSlice } from './apiSlice';
import type { ApiResponse } from '../../types/auth';
import type { NetworkDashboard } from '../../types/network';
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
import type {
  CreateWebsitePayload,
  UpdateWebsitePayload,
  Website,
  WebsiteListParams,
} from '../../types/website';

const NETWORK_PREFIX = '/network';

const buildQueryString = (params: Record<string, unknown>): string => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return queryString ? `?${queryString}` : '';
};

export const networkAdminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNetworkDashboard: builder.query<ApiResponse<NetworkDashboard>, void>({
      query: () => `${NETWORK_PREFIX}/dashboard`,
      providesTags: ['NetworkDashboard'],
    }),

    getNetworkWebsites: builder.query<PaginatedResponse<Website>, WebsiteListParams>({
      query: (params) =>
        `${NETWORK_PREFIX}/websites${buildQueryString({ ...params })}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'NetworkWebsite' as const, id })),
              { type: 'NetworkWebsite' as const, id: 'LIST' },
            ]
          : [{ type: 'NetworkWebsite' as const, id: 'LIST' }],
    }),

    createNetworkWebsite: builder.mutation<ApiResponse<Website>, CreateWebsitePayload>({
      query: (body) => ({
        url: `${NETWORK_PREFIX}/websites`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'NetworkWebsite', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    updateNetworkWebsite: builder.mutation<
      ApiResponse<Website>,
      { id: string; body: UpdateWebsitePayload }
    >({
      query: ({ id, body }) => ({
        url: `${NETWORK_PREFIX}/websites/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'NetworkWebsite', id },
        { type: 'NetworkWebsite', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    deleteNetworkWebsite: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `${NETWORK_PREFIX}/websites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'NetworkWebsite', id },
        { type: 'NetworkWebsite', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    getNetworkRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => `${NETWORK_PREFIX}/roles`,
      providesTags: ['NetworkRole'],
    }),

    getNetworkUsers: builder.query<PaginatedResponse<AdminUser>, UserListParams>({
      query: (params) => `${NETWORK_PREFIX}/users${buildQueryString({ ...params })}`,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'NetworkUser' as const, id })),
              { type: 'NetworkUser' as const, id: 'LIST' },
            ]
          : [{ type: 'NetworkUser' as const, id: 'LIST' }],
    }),

    createNetworkUser: builder.mutation<ApiResponse<AdminUser>, CreateUserPayload>({
      query: (body) => ({
        url: `${NETWORK_PREFIX}/users`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'NetworkUser', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    updateNetworkUser: builder.mutation<
      ApiResponse<AdminUser>,
      { id: string; body: UpdateUserPayload }
    >({
      query: ({ id, body }) => ({
        url: `${NETWORK_PREFIX}/users/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'NetworkUser', id },
        { type: 'NetworkUser', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    deleteNetworkUser: builder.mutation<MessageResponse, string>({
      query: (id) => ({
        url: `${NETWORK_PREFIX}/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'NetworkUser', id },
        { type: 'NetworkUser', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    restoreNetworkUser: builder.mutation<ApiResponse<AdminUser>, string>({
      query: (id) => ({
        url: `${NETWORK_PREFIX}/users/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'NetworkUser', id },
        { type: 'NetworkUser', id: 'LIST' },
        { type: 'NetworkDashboard' },
      ],
    }),

    resetNetworkUserPassword: builder.mutation<
      ApiResponse<MessageResponse>,
      { id: string; body: ResetUserPasswordPayload }
    >({
      query: ({ id, body }) => ({
        url: `${NETWORK_PREFIX}/users/${id}/password`,
        method: 'PUT',
        body,
      }),
    }),

    resendNetworkUserVerification: builder.mutation<ApiResponse<MessageResponse>, string>({
      query: (id) => ({
        url: `${NETWORK_PREFIX}/users/${id}/resend-verification`,
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useGetNetworkDashboardQuery,
  useGetNetworkWebsitesQuery,
  useCreateNetworkWebsiteMutation,
  useUpdateNetworkWebsiteMutation,
  useDeleteNetworkWebsiteMutation,
  useGetNetworkRolesQuery,
  useGetNetworkUsersQuery,
  useCreateNetworkUserMutation,
  useUpdateNetworkUserMutation,
  useDeleteNetworkUserMutation,
  useRestoreNetworkUserMutation,
  useResetNetworkUserPasswordMutation,
  useResendNetworkUserVerificationMutation,
} = networkAdminApi;
