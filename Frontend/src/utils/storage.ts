import { APP_CONFIG } from '../config/constants';

export const storage = {
  getToken(): string | null {
    try {
      return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    } catch {
      return null;
    }
  },

  setToken(token: string): void {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } catch {}
  },

  removeToken(): void {
    try {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    } catch {}
  },

  getUser<T = any>(): T | null {
    try {
      const data = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setUser(user: any): void {
    try {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch {}
  },

  removeUser(): void {
    try {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER);
    } catch {}
  },

  clearAuth(): void {
    this.removeToken();
    this.removeUser();
  }
};
