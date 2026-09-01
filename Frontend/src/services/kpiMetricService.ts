import { apiClient } from './apiClient';
import { KpiMetric } from '../types';

export const kpiMetricService = {
  async getAll(params?: { category?: string; status?: string }): Promise<KpiMetric[]> {
    return apiClient<KpiMetric[]>('/api/kpi-metrics', { params });
  },

  async getById(id: string): Promise<KpiMetric> {
    return apiClient<KpiMetric>(`/api/kpi-metrics/${id}`);
  },

  async create(metric: Partial<KpiMetric>): Promise<KpiMetric> {
    return apiClient<KpiMetric>('/api/kpi-metrics', {
      method: 'POST',
      body: JSON.stringify(metric)
    });
  },

  async update(id: string, updates: Partial<KpiMetric>): Promise<KpiMetric> {
    return apiClient<KpiMetric>(`/api/kpi-metrics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async delete(id: string): Promise<{ deleted: boolean }> {
    return apiClient<{ deleted: boolean }>(`/api/kpi-metrics/${id}`, {
      method: 'DELETE'
    });
  }
};
