// backend/routes/documentRoutes.js
import { Router } from 'express';
import { documentController } from '../controllers/documentController.js';
import { authMiddleware, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();
const adminOnly = ['BANK_SUPER_ADMIN', 'ADMINISTRATOR', 'CEO', 'CHIEF_OFFICER'];

router.get('/', optionalAuth, documentController.getDocuments);
router.get('/:id', optionalAuth, documentController.getDocumentById);
router.post('/', authMiddleware, requireRole(adminOnly), documentController.createDocument);
router.put('/:id', authMiddleware, requireRole(adminOnly), documentController.updateDocument);
router.delete('/:id', authMiddleware, requireRole(adminOnly), documentController.deleteDocument);

router.post('/:id/publish', authMiddleware, requireRole(adminOnly), documentController.publishDocument);
router.post('/:id/withdraw', authMiddleware, requireRole(adminOnly), documentController.withdrawDocument);
router.post('/:id/archive', authMiddleware, requireRole(adminOnly), documentController.archiveDocument);
router.get('/:id/versions', optionalAuth, documentController.getVersions);
router.post('/:id/save-for-later', authMiddleware, documentController.saveForLater);
router.post('/:id/hide', authMiddleware, documentController.hideDocument);

export default router;
