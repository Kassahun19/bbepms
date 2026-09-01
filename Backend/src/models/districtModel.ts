import { getMySqlPool } from '../config/mysqlDb';

export interface DistrictRow {
  district_id: string;
  code: string;
  name: string;
  region: string;
  manager_name?: string;
  phone?: string;
  email?: string;
  sec_email?: string;
  location?: string;
  operation_manager?: string;
  type: string;
  branch_count: number;
  total_employees: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export const districtModel = {
  async findAll(): Promise<DistrictRow[]> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query('SELECT * FROM districts ORDER BY name ASC');
    return rows;
  },

  async findById(districtId: string): Promise<DistrictRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM districts WHERE district_id = ? OR code = ? LIMIT 1',
      [districtId, districtId]
    );
    return rows[0] || null;
  }
};
