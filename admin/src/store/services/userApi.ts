import { apiSlice } from './apiSlice';
import type { ApiResponse, AuthUser } from '../../types/auth';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({
        url: '/auth/user/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
  }),
});

export const { useGetProfileQuery } = userApi;
