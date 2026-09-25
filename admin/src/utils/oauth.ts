import type { AuthUser, TokenData } from '../types/auth';

/** Base URL of the Laravel OAuth server (Passport). */
const OAUTH_BASE_URL =
  (import.meta.env.VITE_OAUTH_BASE_URL as string | undefined)?.replace(/\/$/, '') ||
  'http://localhost:8000';

/** Public PKCE client id provisioned by the OAuthClientSeeder. */
const OAUTH_CLIENT_ID = (import.meta.env.VITE_OAUTH_CLIENT_ID as string | undefined) || '';

/** Base URL of the JSON API. */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api/v1';

const PKCE_VERIFIER_KEY = 'sitestore_oauth_code_verifier';
const PKCE_STATE_KEY = 'sitestore_oauth_state';

const base64UrlEncode = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const oauthRedirectUri = (): string => `${window.location.origin}/auth/callback`;

export const isOAuthConfigured = (): boolean => OAUTH_CLIENT_ID !== '';

/**
 * Generate a PKCE verifier/challenge pair, persist it, and redirect the
 * browser to the Passport authorization endpoint.
 */
export const beginOAuthLogin = async (): Promise<void> => {
  if (!isOAuthConfigured()) {
    throw new Error('OAuth client is not configured.');
  }

  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const verifier = base64UrlEncode(verifierBytes);

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64UrlEncode(new Uint8Array(digest));

  const stateBytes = new Uint8Array(16);
  crypto.getRandomValues(stateBytes);
  const state = base64UrlEncode(stateBytes);

  sessionStorage.setItem(PKCE_VERIFIER_KEY, verifier);
  sessionStorage.setItem(PKCE_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: oauthRedirectUri(),
    response_type: 'code',
    scope: 'profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  });

  window.location.assign(`${OAUTH_BASE_URL}/oauth/authorize?${params.toString()}`);
};

const requestToken = async (body: Record<string, string>): Promise<TokenData> => {
  const response = await fetch(`${OAUTH_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw data ?? { message: 'Token request failed.' };
  }

  return data as TokenData;
};

/**
 * Validate the returned state, then exchange the authorization code for tokens.
 */
export const exchangeAuthorizationCode = async (
  code: string,
  state: string
): Promise<TokenData> => {
  const expectedState = sessionStorage.getItem(PKCE_STATE_KEY);
  const verifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);

  if (!expectedState || expectedState !== state) {
    throw new Error('OAuth state mismatch. Please sign in again.');
  }

  if (!verifier) {
    throw new Error('Missing PKCE code verifier. Please sign in again.');
  }

  return requestToken({
    grant_type: 'authorization_code',
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: oauthRedirectUri(),
    code,
    code_verifier: verifier,
  });
};

export const refreshAccessToken = (refreshToken: string): Promise<TokenData> =>
  requestToken({
    grant_type: 'refresh_token',
    client_id: OAUTH_CLIENT_ID,
    refresh_token: refreshToken,
  });

export const fetchProfile = async (accessToken: string): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/user/profile`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.data) {
    throw payload ?? { message: 'Unable to load your profile.' };
  }

  return payload.data as AuthUser;
};
