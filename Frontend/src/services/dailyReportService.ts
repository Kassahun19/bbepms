import { apiClient } from './apiClient';
import { DailyReport } from '../types';

export const dailyReportService = {
  async getAll(params?: {
    employeeId?: string;
    branchId?: string;
    districtId?: string;
    fiscalYearId?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }): Promise<DailyReport[]> {
    return apiClient<DailyReport[]>('/api/daily-reports', { params });
  },

  async getById(id: string): Promise<DailyReport> {
    return apiClient<DailyReport>(`/api/daily-reports/${id}`);
  },

  async submit(reportData: Partial<DailyReport>): Promise<DailyReport> {
    return apiClient<DailyReport>('/api/daily-reports', {
      method: 'POST',
      body: JSON.stringify(reportData)
    });
  },

  async review(id: string, status: string, managerComment?: string): Promise<DailyReport> {
    return apiClient<DailyReport>(`/api/daily-reports/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ status, managerComment })
    });
  }
};
