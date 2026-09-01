import { useState, useEffect, useCallback } from 'react';
import { KpiMetric } from '../types';
import { kpiMetricService } from '../services/kpiMetricService';

export function useKpis(params?: { category?: string; status?: string }) {
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKpis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await kpiMetricService.getAll(params);
      setKpis(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch KPIs');
    } finally {
      setLoading(false);
    }
  }, [params?.category, params?.status]);

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  return { kpis, loading, error, refetch: fetchKpis };
}
