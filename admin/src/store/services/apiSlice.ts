import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { updateToken, setLogout } from '../slices/authSlice';
import { refreshAccessToken } from '../../utils/oauth';

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

    // Skip refreshing if this call is the OAuth token endpoint itself
    const currentUrl = typeof args === 'string' ? args : args.url;
    const isAuthRoute = currentUrl.includes('oauth/token');

    if (refreshToken && !isAuthRoute) {
      if (!mutex.isLocked()) {
        await mutex.acquire();
        try {
          // Exchange the refresh token for a new access token
          const newTokenData = await refreshAccessToken(refreshToken);

          if (newTokenData && newTokenData.access_token) {
            // Store new tokens in Redux & localStorage
            api.dispatch(updateToken({ token: newTokenData }));

            // Retry the original query with the refreshed token
            result = await rawBaseQuery(args, api, extraOptions);
          } else {
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
  tagTypes: [
    'Auth',
    'User',
    'AdminUser',
    'AdminRole',
    'Website',
    'NetworkWebsite',
    'NetworkUser',
    'NetworkRole',
    'NetworkDashboard',
    'ApiKey',
    'Wallet',
    'Transaction',
    'AdminPost',
    'AdminCategory',
    'AdminComment',
    'AdminMedia',
  ],
  endpoints: () => ({}),
});
