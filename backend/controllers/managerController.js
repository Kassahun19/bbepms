// backend/controllers/managerController.js
import { User } from '../models/User.js';
import { Branch } from '../models/Branch.js';
import { AuditLog } from '../models/AuditLog.js';

export const managerController = {
  async getBranchEmployees(req, res) {
    try {
      const branchId = req.user?.branchId || req.query.branchId;
      const allUsers = await User.findAll();
      const branchEmployees = allUsers.filter(u => {
        const uBranch = u.branch_id || u.branchId;
        return branchId ? uBranch === branchId : true;
      });
      return res.status(200).json({ success: true, count: branchEmployees.length, data: branchEmployees });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async addBranchEmployee(req, res) {
    try {
      const branchId = req.user?.branchId || req.body.branchId || req.body.branch_id;
      const branchName = req.user?.branchName || req.body.branchName || req.body.branch_name;
      const districtId = req.user?.districtId || req.body.districtId || req.body.district_id;
      const districtName = req.user?.districtName || req.body.districtName || req.body.district_name;

      const employeeData = {
        ...req.body,
        branch_id: branchId,
        branch_name: branchName,
        district_id: districtId,
        district_name: districtName,
        role: req.body.role || 'EMPLOYEE',
        status: req.body.status || 'Active'
      };

      const newEmployee = await User.create(employeeData);

      // Increment employee_count in branch if available
      if (branchId) {
        const branch = await Branch.findById(branchId);
        if (branch) {
          const currentCount = Number(branch.employee_count || branch.employeeCount || 0);
          await Branch.update(branchId, { employee_count: currentCount + 1 });
        }
      }

      await AuditLog.create({
        user_id: req.user?.userId || 'MANAGER',
        user_name: req.user?.fullName || 'Branch Manager',
        action: 'ADD_BRANCH_EMPLOYEE',
        entity_type: 'User',
        entity_id: newEmployee.user_id,
        details: { name: `${newEmployee.first_name} ${newEmployee.last_name}`, branchId }
      });

      return res.status(201).json({ success: true, message: 'Employee added successfully', employee: newEmployee, data: newEmployee });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateBranchEmployee(req, res) {
    try {
      const employeeId = req.params.id;
      const updated = await User.update(employeeId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Employee not found' });
      }

      await AuditLog.create({
        user_id: req.user?.userId || 'MANAGER',
        user_name: req.user?.fullName || 'Branch Manager',
        action: 'UPDATE_BRANCH_EMPLOYEE',
        entity_type: 'User',
        entity_id: employeeId,
        details: req.body
      });

      return res.status(200).json({ success: true, message: 'Employee updated successfully', employee: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteBranchEmployee(req, res) {
    try {
      const employeeId = req.params.id;
      const employee = await User.findById(employeeId);
      await User.delete(employeeId);

      if (employee && (employee.branch_id || employee.branchId)) {
        const branchId = employee.branch_id || employee.branchId;
        const branch = await Branch.findById(branchId);
        if (branch) {
          const currentCount = Math.max(0, Number(branch.employee_count || branch.employeeCount || 1) - 1);
          await Branch.update(branchId, { employee_count: currentCount });
        }
      }

      await AuditLog.create({
        user_id: req.user?.userId || 'MANAGER',
        user_name: req.user?.fullName || 'Branch Manager',
        action: 'DELETE_BRANCH_EMPLOYEE',
        entity_type: 'User',
        entity_id: employeeId
      });

      return res.status(200).json({ success: true, message: 'Employee removed from branch successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async resetEmployeePassword(req, res) {
    try {
      const employeeId = req.params.id;
      const { newPassword } = req.body;
      const password = newPassword || 'Default123!';
      const updated = await User.update(employeeId, { password_hash: password });
      if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });

      await AuditLog.create({
        user_id: req.user?.userId || 'MANAGER',
        user_name: req.user?.fullName || 'Branch Manager',
        action: 'RESET_EMPLOYEE_PASSWORD',
        entity_type: 'User',
        entity_id: employeeId
      });

      return res.status(200).json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateEmployeeStatus(req, res) {
    try {
      const employeeId = req.params.id;
      const { status } = req.body;
      const updated = await User.update(employeeId, { status });
      if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });

      return res.status(200).json({ success: true, message: 'Employee status updated', employee: updated, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default managerController;
