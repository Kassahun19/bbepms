import { getMySqlPool } from '../config/mysqlDb';

export interface UserRow {
  user_id: string;
  system_username: string;
  password_hash: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  role_type?: string;
  job_title: string;
  branch_id?: string;
  branch_name?: string;
  district_id?: string;
  district_name?: string;
  department_id?: string;
  gender?: string;
  age?: number;
  status: string;
  is_locked: boolean;
  created_at: Date;
  updated_at: Date;
}

export const userModel = {
  async findAll(filters: { role?: string; branchId?: string; districtId?: string; status?: string } = {}): Promise<UserRow[]> {
    const pool = getMySqlPool();
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params: any[] = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.branchId) {
      sql += ' AND branch_id = ?';
      params.push(filters.branchId);
    }
    if (filters.districtId) {
      sql += ' AND district_id = ?';
      params.push(filters.districtId);
    }
    if (filters.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    sql += ' ORDER BY first_name ASC, last_name ASC';

    const [rows]: any = await pool.query(sql, params);
    return rows;
  },

  async findById(userId: string): Promise<UserRow | null> {
    const pool = getMySqlPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE user_id = ? OR system_username = ? OR email = ? LIMIT 1',
      [userId, userId, userId]
    );
    return rows[0] || null;
  },

  async create(user: Partial<UserRow>): Promise<UserRow> {
    const pool = getMySqlPool();
    await pool.query(
      `INSERT INTO users (
        user_id, system_username, password_hash, first_name, middle_name, last_name,
        email, phone, role, role_type, job_title, branch_id, branch_name,
        district_id, district_name, department_id, gender, age, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.user_id,
        user.system_username,
        user.password_hash,
        user.first_name,
        user.middle_name || null,
        user.last_name,
        user.email,
        user.phone || null,
        user.role || 'EMPLOYEE',
        user.role_type || null,
        user.job_title || 'Officer',
        user.branch_id || null,
        user.branch_name || null,
        user.district_id || null,
        user.district_name || null,
        user.department_id || null,
        user.gender || 'Male',
        user.age || 30,
        user.status || 'Active'
      ]
    );
    return (await this.findById(user.user_id!))!;
  },

  async update(userId: string, updates: Partial<UserRow>): Promise<UserRow | null> {
    const pool = getMySqlPool();
    const fields: string[] = [];
    const values: any[] = [];

    const allowed = [
      'first_name', 'middle_name', 'last_name', 'email', 'phone',
      'role', 'job_title', 'branch_id', 'branch_name', 'district_id',
      'district_name', 'gender', 'age', 'status', 'password_hash'
    ];

    for (const key of allowed) {
      if ((updates as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push((updates as any)[key]);
      }
    }

    if (fields.length === 0) return this.findById(userId);

    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, values);
    return this.findById(userId);
  }
};
