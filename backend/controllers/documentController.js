// backend/controllers/documentController.js
import { loadPersistentData, savePersistentData } from '../config/db.js';
import { AuditLog } from '../models/AuditLog.js';

export const documentController = {
  async getDocuments(req, res) {
    try {
      const store = loadPersistentData();
      let documents = store.documents || [];
      const { targetAudience, category, status } = req.query;

      if (category && category !== 'ALL') {
        documents = documents.filter(d => (d.category || '').toLowerCase() === category.toLowerCase());
      }
      if (status && status !== 'ALL') {
        documents = documents.filter(d => (d.status || '').toLowerCase() === status.toLowerCase());
      }
      if (targetAudience && targetAudience !== 'ALL') {
        documents = documents.filter(d => d.targetAudience === targetAudience || d.targetAudience === 'ALL' || !d.targetAudience);
      }

      return res.status(200).json({ success: true, count: documents.length, data: documents });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getDocumentById(req, res) {
    try {
      const store = loadPersistentData();
      const doc = (store.documents || []).find(d => d.id === req.params.id);
      if (!doc) return res.status(404).json({ success: false, error: 'Document not found' });
      return res.status(200).json({ success: true, data: doc });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async createDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.documents) store.documents = [];

      const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;
      const newDoc = {
        id: docId,
        title: req.body.title || 'Untitled Bank Memo',
        category: req.body.category || 'MEMORANDUM',
        referenceNumber: req.body.referenceNumber || `BNB/OP/${Date.now().toString().slice(-4)}`,
        content: req.body.content || '',
        summary: req.body.summary || '',
        targetAudience: req.body.targetAudience || 'ALL',
        priority: req.body.priority || 'Normal',
        status: req.body.status || 'DRAFT',
        author: req.body.author || req.user?.fullName || 'System Admin',
        createdBy: req.user?.fullName || 'System Admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [{
          version: '1.0',
          updatedAt: new Date().toISOString(),
          updatedBy: req.user?.fullName || 'System Admin',
          changeLog: 'Initial creation'
        }]
      };

      store.documents.unshift(newDoc);
      savePersistentData(store);

      await AuditLog.create({
        user_id: req.user?.userId || 'ADMIN',
        user_name: req.user?.fullName || 'Admin',
        action: 'CREATE_DOCUMENT',
        entity_type: 'BankDocument',
        entity_id: docId,
        details: { title: newDoc.title }
      });

      return res.status(201).json({ success: true, message: 'Document created successfully', document: newDoc, data: newDoc });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.documents) store.documents = [];
      const idx = store.documents.findIndex(d => d.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Document not found' });

      const prev = store.documents[idx];
      const newVersionNum = ((prev.versions || []).length + 1).toFixed(1);
      const versions = prev.versions || [];
      versions.push({
        version: newVersionNum,
        updatedAt: new Date().toISOString(),
        updatedBy: req.user?.fullName || 'System Admin',
        changeLog: req.body.changeLog || 'Document updated'
      });

      store.documents[idx] = {
        ...prev,
        ...req.body,
        versions,
        updatedAt: new Date().toISOString()
      };
      savePersistentData(store);

      return res.status(200).json({ success: true, message: 'Document updated successfully', document: store.documents[idx], data: store.documents[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async publishDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.documents) store.documents = [];
      const idx = store.documents.findIndex(d => d.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Document not found' });

      store.documents[idx].status = 'PUBLISHED';
      store.documents[idx].publishedAt = new Date().toISOString();
      store.documents[idx].publishedBy = req.user?.fullName || req.body.publisher || 'System Admin';
      if (req.body.targetAudience) store.documents[idx].targetAudience = req.body.targetAudience;

      savePersistentData(store);
      return res.status(200).json({ success: true, message: 'Document published successfully', document: store.documents[idx], data: store.documents[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async withdrawDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.documents) store.documents = [];
      const idx = store.documents.findIndex(d => d.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Document not found' });

      store.documents[idx].status = 'WITHDRAWN';
      store.documents[idx].withdrawnAt = new Date().toISOString();
      savePersistentData(store);
      return res.status(200).json({ success: true, message: 'Document withdrawn successfully', document: store.documents[idx], data: store.documents[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async archiveDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (!store.documents) store.documents = [];
      const idx = store.documents.findIndex(d => d.id === req.params.id);
      if (idx === -1) return res.status(404).json({ success: false, error: 'Document not found' });

      store.documents[idx].status = 'ARCHIVED';
      store.documents[idx].archivedAt = new Date().toISOString();
      savePersistentData(store);
      return res.status(200).json({ success: true, message: 'Document archived successfully', document: store.documents[idx], data: store.documents[idx] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteDocument(req, res) {
    try {
      const store = loadPersistentData();
      if (store.documents) {
        store.documents = store.documents.filter(d => d.id !== req.params.id);
        savePersistentData(store);
      }
      return res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getVersions(req, res) {
    try {
      const store = loadPersistentData();
      const doc = (store.documents || []).find(d => d.id === req.params.id);
      return res.status(200).json({ success: true, versions: doc?.versions || [] });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async saveForLater(req, res) {
    return res.status(200).json({ success: true, message: 'Document saved to personal reading list' });
  },

  async hideDocument(req, res) {
    return res.status(200).json({ success: true, message: 'Document removed from view' });
  }
};

export default documentController;
