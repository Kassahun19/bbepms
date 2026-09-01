import { getMySqlPool } from '../config/mysqlDb';

export interface BranchRow {
  branch_id: string;
  sol_id: string;
  code: string;
  name: string;
  district_id: string;
  district_name?: string;
  grade: string;
  type: string;
  manager_name?: string;
  location?: string;
  phone?: string;
  region?: string;
  employee_count: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const branchModel = {
  async findAll(filters: { districtId?: string; status?: string } = {}): Promise<BranchRow[]> {
    const pool = getMySqlPool();
    let sql = 'SELECT * FROM branches WHERE 1=1';
    const params: any[] = [];

    if (filters.districtId) {
      sql += ' AND district_id = ?';
      params.push(filters.districtId);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY name ASC';

    const [rows]: any = await pool.query(sql, params);
    return rows;
  },

  async findById(branchId: string): Promise<BranchRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM branches WHERE branch_id = ? OR sol_id = ? OR code = ? LIMIT 1',
      [branchId, branchId, branchId]
    );
    return rows[0] || null;
  }
};
