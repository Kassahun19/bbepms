// backend/controllers/coachController.js
import { askEpmsCoach } from '../services/geminiService.js';

export const coachController = {
  async askCoach(req, res) {
    try {
      const { message, context } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: 'Message prompt is required' });
      }

      const role = req.user?.role || 'EMPLOYEE';
      const answer = await askEpmsCoach({ message, context, role });

      return res.status(200).json({
        success: true,
        data: {
          reply: answer,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default coachController;
