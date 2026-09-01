import { useState, useEffect, useCallback } from 'react';
import { DailyReport } from '../types';
import { dailyReportService } from '../services/dailyReportService';

export function useDailyReports(params?: {
  employeeId?: string;
  branchId?: string;
  districtId?: string;
  fiscalYearId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
}) {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dailyReportService.getAll(params);
      setReports(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily reports');
    } finally {
      setLoading(false);
    }
  }, [
    params?.employeeId,
    params?.branchId,
    params?.districtId,
    params?.fiscalYearId,
    params?.startDate,
    params?.endDate,
    params?.status
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, refetch: fetchReports };
}
