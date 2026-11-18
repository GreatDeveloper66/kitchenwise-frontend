import { isAxiosError } from 'axios';
import { api } from './api';
import type { LoginFormValues } from '../components/LoginForm/LoginForm';

// Matches user-auth-service's register and login responses.
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// Rethrows axios errors with user-auth's own message (e.g. "User not found",
// "Invalid credentials") so the forms can show it instead of a generic status text.
function toAuthError(err: unknown, fallback: string): Error {
  if (isAxiosError<{ message?: string }>(err)) {
    return new Error(err.response?.data?.message ?? fallback);
  }
  return err instanceof Error ? err : new Error(fallback);
}

export async function login(credentials: LoginFormValues): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/login', credentials);
    return response.data;
  } catch (err) {
    throw toAuthError(err, 'Login failed. Please try again.');
  }
}

export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

// The form collects one "Full name" field; user-auth stores firstName and lastName.
// The first word becomes firstName and the rest (possibly empty) becomes lastName.
function splitName(fullName: string): { firstName: string; lastName: string } {
  const [firstName = '', ...rest] = fullName.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
}

export async function register({ name, email, password }: RegisterValues): Promise<AuthResponse> {
  try {
    const response = await api.post<AuthResponse>('/register', { ...splitName(name), email, password });
    return response.data;
  } catch (err) {
    throw toAuthError(err, 'Registration failed. Please try again.');
  }
}

// Shared by LoginPage and RegisterPage so token storage lives in one place
export function saveSession({ token, user }: AuthResponse): void {
  localStorage.setItem('kitchenwise_token', token);
  localStorage.setItem('kitchenwise_user', JSON.stringify(user));
}


export function getUser(): AuthResponse['user'] | null {
  try {
    const raw = localStorage.getItem('kitchenwise_user');
    return raw ? (JSON.parse(raw) as AuthResponse['user']) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('kitchenwise_token'));
}

export function clearSession(): void {
  localStorage.removeItem('kitchenwise_token');
  localStorage.removeItem('kitchenwise_user');
}
