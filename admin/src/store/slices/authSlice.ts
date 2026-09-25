import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser, TokenData } from '../../types/auth';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY_TOKEN = 'sitestore_auth_token';
const STORAGE_KEY_REFRESH = 'sitestore_refresh_token';
const STORAGE_KEY_USER = 'sitestore_user';

const loadInitialState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEY_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEY_REFRESH);
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    const user = storedUser ? JSON.parse(storedUser) : null;

    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: Boolean(accessToken),
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const initialState: AuthState = loadInitialState();

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: AuthUser; token: TokenData }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.accessToken = token.access_token;
      state.refreshToken = token.refresh_token;
      state.isAuthenticated = true;

      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token.access_token);
        localStorage.setItem(STORAGE_KEY_REFRESH, token.refresh_token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } catch (e) {
        console.error('Failed to save auth state to localStorage', e);
      }
    },
    updateToken: (state, action: PayloadAction<{ token: TokenData }>) => {
      const { token } = action.payload;
      state.accessToken = token.access_token;
      state.refreshToken = token.refresh_token;
      state.isAuthenticated = true;

      try {
        localStorage.setItem(STORAGE_KEY_TOKEN, token.access_token);
        localStorage.setItem(STORAGE_KEY_REFRESH, token.refresh_token);
      } catch (e) {
        console.error('Failed to update tokens in localStorage', e);
      }
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(action.payload));
      } catch (e) {
        console.error('Failed to save user in localStorage', e);
      }
    },
    setLogout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      try {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_REFRESH);
        localStorage.removeItem(STORAGE_KEY_USER);
      } catch (e) {
        console.error('Failed to clear auth storage', e);
      }
    },
  },
});

export const { setCredentials, updateToken, setUser, setLogout } = authSlice.actions;

export default authSlice.reducer;
