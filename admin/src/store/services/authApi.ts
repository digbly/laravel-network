import { apiSlice } from './apiSlice';
import { setCredentials, setLogout } from '../slices/authSlice';
import type {
  ApiResponse,
  AuthSuccessData,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  ResendVerificationEmailPayload,
  ChangePasswordPayload,
  SocialProvider,
} from '../../types/auth';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthSuccessData>, LoginPayload>({
      query: (credentials) => ({
        url: '/auth/user/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.data && data.data.token && data.data.user) {
            dispatch(
              setCredentials({
                user: data.data.user,
                token: data.data.token,
              })
            );
          }
        } catch {
          // Handled in component
        }
      },
      invalidatesTags: ['Auth', 'User'],
    }),

    register: builder.mutation<ApiResponse<AuthUser>, RegisterPayload>({
      query: (payload) => ({
        url: '/auth/user/register',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Auth'],
    }),

    forgotPassword: builder.mutation<ApiResponse<string>, ForgotPasswordPayload>({
      query: (payload) => ({
        url: '/auth/user/forgot-password',
        method: 'POST',
        body: payload,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<string>, ResetPasswordPayload>({
      query: (payload) => ({
        url: '/auth/user/reset-password',
        method: 'POST',
        body: payload,
      }),
    }),

    resendVerificationEmail: builder.mutation<
      ApiResponse<string>,
      ResendVerificationEmailPayload
    >({
      query: (payload) => ({
        url: '/auth/user/resend-verification-email',
        method: 'POST',
        body: payload,
      }),
    }),

    verifyEmail: builder.mutation<
      ApiResponse<string>,
      { id: string; hash: string }
    >({
      query: ({ id, hash }) => ({
        url: `/auth/user/email/verify/${id}/${hash}`,
        method: 'POST',
      }),
    }),

    changePassword: builder.mutation<ApiResponse<string>, ChangePasswordPayload>({
      query: (payload) => ({
        url: '/auth/user/change-password',
        method: 'PUT',
        body: payload,
      }),
    }),

    logout: builder.mutation<ApiResponse<string>, void>({
      query: () => ({
        url: '/auth/user/logout',
        method: 'POST',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(setLogout());
          dispatch(apiSlice.util.resetApiState());
        }
      },
    }),

    getSocialProviders: builder.query<ApiResponse<SocialProvider[]>, void>({
      query: () => ({
        url: '/auth/social-providers',
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useResendVerificationEmailMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetSocialProvidersQuery,
} = authApi;
