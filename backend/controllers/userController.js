// backend/controllers/userController.js
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';

export const userController = {
  async getUsers(req, res) {
    try {
      const users = await User.findAll();
      return res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getUserById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, data: user });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createUser(req, res) {
    try {
      const newUser = await User.create(req.body);
      await AuditLog.create({
        user_id: req.user?.userId || 'SYSTEM',
        user_name: req.user?.fullName || 'Admin',
        action: 'CREATE_USER',
        entity_type: 'User',
        entity_id: newUser.user_id,
        details: { username: newUser.system_username, role: newUser.role }
      });
      return res.status(201).json({ success: true, data: newUser });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateUser(req, res) {
    try {
      const updated = await User.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ success: false, error: 'User not found' });
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteUser(req, res) {
    try {
      await User.delete(req.params.id);
      return res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async unlockUser(req, res) {
    try {
      const unlocked = await User.unlock(req.params.id);
      return res.status(200).json({ success: true, message: 'Account unlocked', data: unlocked });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default userController;
