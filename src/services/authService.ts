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