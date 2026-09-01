import { apiClient } from './apiClient';
import { PerformanceTarget } from '../types';

export const targetService = {
  async getAll(params?: {
    employeeId?: string;
    branchId?: string;
    districtId?: string;
    kpiId?: string;
    year?: number;
  }): Promise<PerformanceTarget[]> {
    return apiClient<PerformanceTarget[]>('/api/targets', { params });
  },

  async getById(id: string): Promise<PerformanceTarget> {
    return apiClient<PerformanceTarget>(`/api/targets/${id}`);
  },

  async create(targetData: Partial<PerformanceTarget>): Promise<PerformanceTarget> {
    return apiClient<PerformanceTarget>('/api/targets', {
      method: 'POST',
      body: JSON.stringify(targetData)
    });
  }
};
