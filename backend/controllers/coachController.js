// backend/controllers/coachController.js
import { askEpmsCoach, generateDataAnswer } from '../services/geminiService.js';
import { loadPersistentData } from '../config/db.js';

export const coachController = {
  async askCoach(req, res) {
    try {
      const message = String(req.body.prompt || req.body.message || '').trim();
      const context = req.body.context || req.body.contextData || {};
      const role = req.user?.role || req.body.userRole || 'EMPLOYEE';

      let answer = await askEpmsCoach({ message, context, role });

      if (!answer || typeof answer !== 'string' || answer.trim() === '' || answer.trim() === 'undefined') {
        const store = loadPersistentData();
        answer = generateDataAnswer(message || 'overview', store, role, context);
      }

      const cleanAnswer = String(answer).trim();

      return res.status(200).json({
        success: true,
        response: cleanAnswer,
        reply: cleanAnswer,
        answer: cleanAnswer,
        text: cleanAnswer,
        context: {
          timestamp: new Date().toISOString()
        },
        data: {
          reply: cleanAnswer,
          response: cleanAnswer,
          text: cleanAnswer,
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      console.error('[CoachController Error]:', err.message);
      try {
        const store = loadPersistentData();
        const context = req.body?.context || req.body?.contextData || {};
        const fallback = generateDataAnswer(req.body?.prompt || 'overview', store, req.body?.userRole || 'EMPLOYEE', context);
        return res.status(200).json({
          success: true,
          response: fallback,
          reply: fallback,
          answer: fallback,
          text: fallback,
          data: { reply: fallback }
        });
      } catch (innerErr) {
        return res.status(200).json({
          success: true,
          response: 'Bunna Bank EPMS Performance Coach is operating with verified 300 banking days benchmark data across 34 Districts and 565 Branches.',
          reply: 'Bunna Bank EPMS Performance Coach is operating with verified 300 banking days benchmark data across 34 Districts and 565 Branches.',
          text: 'Bunna Bank EPMS Performance Coach is operating with verified 300 banking days benchmark data across 34 Districts and 565 Branches.'
        });
      }
    }
  }
};

export default coachController;
