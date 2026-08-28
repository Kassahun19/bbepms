import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface ReusableDataTableProps<T> {
  fetchData: (params: { page: number; limit: number; search: string; filters: Record<string, string>; sortBy: string; sortOrder: 'asc'|'desc' }) => Promise<{ data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>;
  columns: Column<T>[];
  filters?: React.ReactNode;
  filterState?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  emptyMessage?: string;
  defaultSortBy?: string;
}

export function ReusableDataTable<T>({
  fetchData,
  columns,
  filters,
  filterState = {},
  onFilterChange,
  emptyMessage = "No records found.",
  defaultSortBy = ''
}: ReusableDataTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc'|'desc'>('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchData({ page, limit, search: debouncedSearch, filters: filterState, sortBy, sortOrder });
      setData(result.data);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      // Adjust page if out of bounds after filter change
      if (page > result.pagination.totalPages && result.pagination.totalPages > 0) {
        setPage(1);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit, debouncedSearch, filterState, sortBy, sortOrder]);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-white/20 rounded-xl leading-5 bg-[#6B3F1D]/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89A2B] focus:border-[#C89A2B] sm:text-sm"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {filters}
          <button onClick={loadData} className="p-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-[#C89A2B] hover:bg-white/10" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#6B3F1D]/50">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase tracking-wider border-b border-white/10">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className="p-3">
                  <button 
                    onClick={() => handleSort(String(col.key))} 
                    className="flex items-center space-x-1 hover:text-white"
                  >
                    <span>{col.header}</span>
                    {sortBy === col.key && (
                      <span className="text-xs ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading && data.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-8 text-center text-gray-400">Loading data...</td></tr>
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-rose-400">
                  <p>{error}</p>
                  <button onClick={loadData} className="mt-2 text-white bg-rose-500/20 px-4 py-1 rounded">Retry</button>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={columns.length} className="p-8 text-center text-gray-400">{emptyMessage}</td></tr>
            ) : (
              data.map((item, idx) => (
                <tr key={(item as any).id || idx} className="hover:bg-white/5 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className="p-3">
                      {col.render ? col.render(item) : (item as any)[col.key as string]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select 
            value={limit} 
            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
            className="bg-[#6B3F1D] border border-white/20 rounded px-2 py-1 text-white focus:outline-none focus:border-[#C89A2B]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={999999}>All</option>
          </select>
          <span className="ml-2">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} records
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-1 rounded bg-[#6B3F1D] border border-white/20 disabled:opacity-50 hover:bg-white/10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3">Page {page} of {totalPages}</span>
          
          <button 
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-[#6B3F1D] border border-white/20 disabled:opacity-50 hover:bg-white/10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
