// Client for user-auth-service. Routes: user-auth-service/src/server.js,
// handlers: user-auth-service/controllers/authController.js.
import { authApi, toApiError, TOKEN_KEY } from './api';
import type { LoginFormValues } from '../components/LoginForm/LoginForm';
import type { RegisterFormValues } from '../components/RegisterForm/RegisterForm';

const USER_KEY = 'kitchenwise_user';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

/** Response from /register, /login, and /login-with-code. */
export interface LoginResponse {
  message: string;
  user: AuthUser;
  token: string;
}

/** The full user document from GET /profile (password excluded by the server). */
export interface UserProfile {
  _id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
}

/** PATCH /update-profile only changes these. Empty strings are ignored by the server. */
export interface UpdateProfileValues {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface MessageResponse {
  message: string;
}

export async function login(credentials: LoginFormValues): Promise<LoginResponse> {
  try {
    const { data } = await authApi.post<LoginResponse>('/login', credentials);
    return data;
  } catch (err) {
    throw toApiError(err, 'Login failed. Please try again.');
  }
}

export async function register(values: RegisterFormValues): Promise<LoginResponse> {
  try {
    const { data } = await authApi.post<LoginResponse>('/register', values);
    return data;
  } catch (err) {
    throw toApiError(err, 'Registration failed. Please try again.');
  }
}

/** Emails a 6-digit login code, valid 15 minutes. 429 if requested again within a minute. */
export async function sendLoginCode(email: string): Promise<MessageResponse> {
  try {
    const { data } = await authApi.post<MessageResponse>('/send-login-code', { email });
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not send a login code. Please try again.');
  }
}

export async function loginWithCode(email: string, code: string): Promise<LoginResponse> {
  try {
    const { data } = await authApi.post<LoginResponse>('/login-with-code', { email, code });
    return data;
  } catch (err) {
    throw toApiError(err, 'Login failed. Please try again.');
  }
}

/** Emails a 6-digit reset code, valid 15 minutes. 429 if requested again within a minute. */
export async function forgotPassword(email: string): Promise<MessageResponse> {
  try {
    const { data } = await authApi.post<MessageResponse>('/forgot-password', { email });
    return data;
  } catch (err) {
    throw toApiError(err, 'Could not send a reset code. Please try again.');
  }
}

/** `token` is the 6-digit code from the forgot-password email. */
export async function resetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<MessageResponse> {
  try {
    const { data } = await authApi.post<MessageResponse>('/reset-password', {
      email,
      token,
      newPassword,
    });
    return data;
  } catch (err) {
    throw toApiError(err, 'Password reset failed. Please try again.');
  }
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const { data } = await authApi.get<{ user: UserProfile }>('/profile');
    return data.user;
  } catch (err) {
    throw toApiError(err, 'Could not load your profile.');
  }
}

export async function updateProfile(values: UpdateProfileValues): Promise<UserProfile> {
  try {
    const { data } = await authApi.patch<{ message: string; user: UserProfile }>(
      '/update-profile',
      values
    );
    // Keep the cached name in sync with the server
    const cached = getUser();
    if (cached) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify({
          ...cached,
          firstName: data.user.firstName ?? cached.firstName,
          lastName: data.user.lastName ?? cached.lastName,
        })
      );
    }
    return data.user;
  } catch (err) {
    throw toApiError(err, 'Could not update your profile.');
  }
}

/** Deletes the account in user-auth only. Diet profile and saved plans are separate services. */
export async function deleteAccount(): Promise<void> {
  try {
    await authApi.delete('/delete-user');
    clearSession();
  } catch (err) {
    throw toApiError(err, 'Could not delete your account.');
  }
}

export async function logout(): Promise<void> {
  try {
    // Stateless logout: the server doesn't revoke the token, clearing it locally is what matters
    await authApi.post('/logout');
  } catch {
    // Clear the local session even if the server call fails (expired token, offline)
  } finally {
    clearSession();
  }
}

export function saveSession({ token, user }: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
