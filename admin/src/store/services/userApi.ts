import { apiSlice } from './apiSlice';
import { setUser } from '../slices/authSlice';
import type { ApiResponse, AuthUser, UpdateProfilePayload } from '../../types/auth';

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({
        url: '/auth/user/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation<ApiResponse<AuthUser>, UpdateProfilePayload>({
      query: ({ name, avatar }) => {
        const body = new FormData();
        body.append('name', name);

        if (avatar) {
          body.append('avatar', avatar);
        }

        return {
          url: '/auth/user/profile',
          method: 'POST',
          body,
        };
      },
      invalidatesTags: ['User'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          if (data?.data) {
            dispatch(setUser(data.data));
          }
        } catch {
          // Errors surface through the mutation result.
        }
      },
    }),
  }),
});

export const { useGetProfileQuery, useUpdateProfileMutation } = userApi;
