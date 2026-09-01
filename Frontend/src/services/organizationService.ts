import { apiClient } from './apiClient';
import { Branch, District } from '../types';

export const organizationService = {
  async getBranches(params?: { districtId?: string; status?: string }): Promise<Branch[]> {
    return apiClient<Branch[]>('/api/branches', { params });
  },

  async getBranchById(id: string): Promise<Branch> {
    return apiClient<Branch>(`/api/branches/${id}`);
  },

  async getDistricts(): Promise<District[]> {
    return apiClient<District[]>('/api/districts');
  },

  async getDistrictById(id: string): Promise<District> {
    return apiClient<District>(`/api/districts/${id}`);
  }
};
