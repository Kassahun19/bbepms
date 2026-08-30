import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface TablePaginationFilterProps<T> {
  data: T[];
  searchFields: (keyof T | string)[];
  searchPlaceholder?: string;
  renderTable: (paginatedData: T[], searchTerm: string) => React.ReactNode;
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  extraFilters?: React.ReactNode;
}

export function TablePaginationFilter<T>({
  data,
  searchFields,
  searchPlaceholder = "Search records...",
  renderTable,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  extraFilters
}: TablePaginationFilterProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const keys = String(field).split('.');
        let val: any = item;
        for (const k of keys) {
          val = val?.[k];
        }
        if (val == null) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);

  const startIndex = filteredData.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, filteredData.length);

  return (
    <div className="space-y-4">
      {/* Search Bar, Row Filter & Extra Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {extraFilters}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} rows</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Render Table Content */}
      <div className="overflow-x-auto">
        {renderTable(paginatedData, searchTerm)}
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 pt-2 border-t border-slate-800">
        <div>
          Showing <span className="font-semibold text-white">{startIndex}</span> to <span className="font-semibold text-white">{endIndex}</span> of <span className="font-semibold text-white">{filteredData.length}</span> entries
          {searchTerm && ` (filtered from ${data.length} total entries)`}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={safeCurrentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg border border-slate-700 transition"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <span className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={safeCurrentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg border border-slate-700 transition"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
