export interface AuthUser {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  balance?: number;
  plan?: string;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TokenData {
  token_type: string;
  expires_in: number;
  access_token: string;
  refresh_token: string;
}

export interface AuthSuccessData {
  token: TokenData;
  user: AuthUser;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  password: string;
  password_confirmation: string;
  token: string;
}

export interface ResendVerificationEmailPayload {
  email: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface SocialProvider {
  driver: string;
  label: string;
  icon: string;
}
