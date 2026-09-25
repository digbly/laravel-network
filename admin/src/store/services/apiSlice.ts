import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { updateToken, setLogout } from '../slices/authSlice';
import type { ApiResponse, TokenData } from '../../types/auth';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState)?.auth?.accessToken ||
      localStorage.getItem('sitestore_auth_token');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

// Mutex implementation to prevent multiple simultaneous refresh calls
class Mutex {
  private _isLocked = false;
  private _waiters: (() => void)[] = [];

  isLocked(): boolean {
    return this._isLocked;
  }

  async acquire(): Promise<void> {
    if (!this._isLocked) {
      this._isLocked = true;
      return;
    }
    return new Promise((resolve) => {
      this._waiters.push(resolve);
    });
  }

  release(): void {
    if (this._waiters.length > 0) {
      const nextWaiter = this._waiters.shift();
      nextWaiter?.();
    } else {
      this._isLocked = false;
    }
  }

  async waitForUnlock(): Promise<void> {
    if (!this._isLocked) return;
    return new Promise((resolve) => {
      this._waiters.push(resolve);
    });
  }
}

const mutex = new Mutex();

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // If another request is currently refreshing the token, wait for it to complete
  if (mutex.isLocked()) {
    await mutex.waitForUnlock();
    return rawBaseQuery(args, api, extraOptions);
  }

  let result = await rawBaseQuery(args, api, extraOptions);

  // If 401 Unauthorized, attempt refresh token mechanism
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const refreshToken =
      state.auth.refreshToken || localStorage.getItem('sitestore_refresh_token');

    // Skip refreshing if this was already a login or refresh-token call
    const currentUrl = typeof args === 'string' ? args : args.url;
    const isAuthRoute =
      currentUrl.includes('auth/user/login') ||
      currentUrl.includes('auth/user/refresh-token');

    if (refreshToken && !isAuthRoute) {
      if (!mutex.isLocked()) {
        await mutex.acquire();
        try {
          // Attempt to refresh the access token
          const refreshResult = await rawBaseQuery(
            {
              url: '/auth/user/refresh-token',
              method: 'POST',
              body: { refresh_token: refreshToken },
            },
            api,
            extraOptions
          );

          if (refreshResult.data) {
            const dataResponse = refreshResult.data as ApiResponse<TokenData>;
            const newTokenData = dataResponse.data;

            if (newTokenData && newTokenData.access_token) {
              // Store new tokens in Redux & localStorage
              api.dispatch(updateToken({ token: newTokenData }));

              // Retry the original query with the refreshed token
              result = await rawBaseQuery(args, api, extraOptions);
            } else {
              api.dispatch(setLogout());
            }
          } else {
            // Refresh token has expired or is invalid
            api.dispatch(setLogout());
          }
        } catch {
          api.dispatch(setLogout());
        } finally {
          mutex.release();
        }
      } else {
        // Wait for the running refresh to finish, then retry
        await mutex.waitForUnlock();
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } else if (!isAuthRoute) {
      api.dispatch(setLogout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth', 'User', 'ApiKey', 'Wallet', 'Transaction'],
  endpoints: () => ({}),
});
