import { api } from './api';
import type { LoginFormValues } from '../components/LoginForm/LoginForm';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function login(credentials: LoginFormValues): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}


export interface RegisterValues {
  name: string;
  email: string;
  password: string;
}

export async function register(values: RegisterValues): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', values);
  return response.data;
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