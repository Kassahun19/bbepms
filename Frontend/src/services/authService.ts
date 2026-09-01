import { apiClient } from './apiClient';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(credentials: { userId: string; password: string }): Promise<LoginResponse> {
    return apiClient<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async getProfile(): Promise<User> {
    return apiClient<User>('/api/auth/profile');
  },

  async registerUser(userData: Partial<User>): Promise<User> {
    return apiClient<User>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }
};
