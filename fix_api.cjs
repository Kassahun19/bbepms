const fs = require('fs');
const content = fs.readFileSync('src/services/api.ts', 'utf8');

let newContent = content.replace(
  /getPaginatedDistricts: async \([^)]+\) => {[\s\S]+?},/g,
  `getPaginatedDistricts: async (params: { page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string }): Promise<{ data: District[], pagination: { total: number, page: number, limit: number, totalPages: number } }> => {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetchJsonOrFallback<any>(\`/api/districts?\${query}\`);
    if (res.data && res.data.pagination) return res.data as any;
    return { data: (res.data || []) as any, pagination: { page: params.page, limit: params.limit, total: Array.isArray(res.data) ? res.data.length : 0, totalPages: 1 } };
  },`
);

newContent = newContent.replace(
  /getPaginatedBranches: async \([^)]+\) => {[\s\S]+?},/g,
  `getPaginatedBranches: async (params: { page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, filters?: any }): Promise<{ data: Branch[], pagination: { total: number, page: number, limit: number, totalPages: number } }> => {
    const queryObj: any = { ...params, ...params.filters };
    delete queryObj.filters;
    const query = new URLSearchParams(queryObj).toString();
    const res = await fetchJsonOrFallback<any>(\`/api/branches?\${query}\`);
    if (res.data && res.data.pagination) return res.data as any;
    return { data: (res.data || []) as any, pagination: { page: params.page, limit: params.limit, total: Array.isArray(res.data) ? res.data.length : 0, totalPages: 1 } };
  },`
);

newContent = newContent.replace(
  /getPaginatedEmployees: async \([^)]+\) => {[\s\S]+?},/g,
  `getPaginatedEmployees: async (params: { page: number, limit: number, search?: string, sortBy?: string, sortOrder?: string, filters?: any }): Promise<{ data: User[], pagination: { total: number, page: number, limit: number, totalPages: number } }> => {
    const queryObj: any = { ...params, ...params.filters };
    delete queryObj.filters;
    const query = new URLSearchParams(queryObj).toString();
    const res = await fetchJsonOrFallback<any>(\`/api/employees?\${query}\`);
    if (res.data && res.data.pagination) return res.data as any;
    return { data: (res.data || []) as any, pagination: { page: params.page, limit: params.limit, total: Array.isArray(res.data) ? res.data.length : 0, totalPages: 1 } };
  },`
);

fs.writeFileSync('src/services/api.ts', newContent);
