import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Filter, Upload, Edit3, Trash2, CheckCircle2, AlertCircle, Eye, Send, Archive, RefreshCcw, History, Shield, Calendar, Building, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationToast, NotificationType } from '../common/NotificationToast';

interface BankDocumentsManagementPanelProps {
  currentUser: any;
}

export const BankDocumentsManagementPanel: React.FC<BankDocumentsManagementPanelProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusMessage, setStatusMessage] = useState<{ type: NotificationType; text: string } | null>(null);
  const [processingAction, setProcessingAction] = useState<{ id: string; type: string } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<any | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [historyDoc, setHistoryDoc] = useState<any | null>(null);
  const [versionsData, setVersionsData] = useState<{ versions: any[]; auditTrail: any[] }>({ versions: [], auditTrail: [] });
  
  // Post/Send State
  const [isPosting, setIsPosting] = useState(false);
  const [postConfirmationOpen, setPostConfirmationOpen] = useState(false);

  // Form State
  const [formState, setFormState] = useState({
    title: '',
    referenceNumber: '',
    documentType: 'Memo',
    subject: '',
    content: '',
    importantInstructions: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuingDepartment: 'Executive Directorate',
    authorizedIssuer: currentUser?.name || 'System Administrator',
    targetAudience: 'ALL',
    priority: 'Normal',
    fileUrl: '',
    fileName: '',
    fileType: 'PDF',
    fileSize: '2.4 MB',
    status: 'DRAFT',
    version: '1.0'
  });

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments({
        search: searchQuery,
        type: typeFilter,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        userRole: currentUser?.role || 'ADMIN'
      });
      setDocuments(data);
    } catch (err: any) {
      console.warn('Failed to load bank documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [typeFilter, statusFilter]);

  const handleOpenCreate = () => {
    setEditingDoc(null);
    setFormState({
      title: '',
      referenceNumber: `BN-${Math.floor(1000 + Math.random() * 9000)}/2026`,
      documentType: 'Memo',
      subject: '',
      content: '',
      importantInstructions: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      issuingDepartment: 'Executive Directorate',
      authorizedIssuer: currentUser?.name || 'System Administrator',
      targetAudience: 'ALL',
      priority: 'Normal',
      fileUrl: '',
      fileName: '',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      status: 'DRAFT',
      version: '1.0'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: any) => {
    setProcessingAction({ id: doc.id, type: 'edit' });
    setStatusMessage({ type: 'info', text: '⏳ Loading document for editing...' });
    setEditingDoc(doc);
    setFormState({
      title: doc.title || '',
      referenceNumber: doc.memoNumber || doc.referenceNumber || '',
      documentType: doc.documentType || doc.category || 'Memo',
      subject: doc.subject || doc.title || '',
      content: doc.content || '',
      importantInstructions: doc.importantInstructions || '',
      effectiveDate: doc.effectiveDate || new Date().toISOString().split('T')[0],
      issueDate: doc.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: doc.expiryDate || '',
      issuingDepartment: doc.issuingDepartment || 'Executive Directorate',
      authorizedIssuer: doc.authorizedIssuer || doc.publisher || 'System Administrator',
      targetAudience: doc.targetAudience || 'ALL',
      priority: doc.priority || 'Normal',
      fileUrl: doc.fileUrl || '',
      fileName: doc.fileName || '',
      fileType: doc.fileType || 'PDF',
      fileSize: doc.fileSize || '2.4 MB',
      status: doc.status || 'DRAFT',
      version: doc.version || '1.0'
    });
    setIsModalOpen(true);
    setStatusMessage({ type: 'success', text: 'Document loaded successfully for editing.' });
    setProcessingAction(null);
  };

  const handleViewPreview = (doc: any) => {
    setProcessingAction({ id: doc.id, type: 'view' });
    setStatusMessage({ type: 'info', text: '⏳ Loading document details...' });
    setPreviewDoc(doc);
    setStatusMessage({ type: 'success', text: 'Document loaded successfully.' });
    setProcessingAction(null);
  };

  const handleFileUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !validExtensions.includes(ext)) {
      setStatusMessage({ type: 'error', text: 'Invalid file format. Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX.' });
      return;
    }

    // Validate file size (max 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'File size exceeds 25MB limit.' });
      return;
    }

    setFormState(prev => ({
      ...prev,
      fileName: file.name,
      fileType: ext.toUpperCase(),
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileUrl: URL.createObjectURL(file)
    }));
    setStatusMessage({ type: 'success', text: `File "${file.name}" uploaded successfully and validated.` });
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.content.trim()) {
      setStatusMessage({ type: 'error', text: 'Document Title and Content are required.' });
      return;
    }

    setStatusMessage({ type: 'info', text: '⏳ Saving document to database...' });
    try {
      const payload = {
        ...formState,
        memoNumber: formState.referenceNumber,
        category: formState.documentType,
        publisher: currentUser?.name || 'System Admin',
        createdBy: currentUser?.name || 'System Admin',
        userRole: currentUser?.role || 'ADMIN'
      };

      if (editingDoc) {
        await api.updateDocument(editingDoc.id, payload);
        setStatusMessage({ type: 'success', text: 'Document updated successfully.' });
      } else {
        await api.createDocument(payload);
        setStatusMessage({ type: 'success', text: 'Official bank document created successfully as Draft.' });
      }

      setIsModalOpen(false);
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to update the document.' });
    }
  };

  const handlePostAndSendClick = () => {
    if (!formState.title.trim() || !formState.content.trim()) {
      setStatusMessage({ type: 'error', text: 'Document Title and Content are required.' });
      return;
    }
    setPostConfirmationOpen(true);
  };

  const confirmPostAndSend = async () => {
    setPostConfirmationOpen(false);
    setIsPosting(true);
    setStatusMessage({ type: 'info', text: '⏳ Posting document...' });

    try {
      const payload = {
        ...formState,
        memoNumber: formState.referenceNumber,
        category: formState.documentType,
        publisher: currentUser?.name || 'System Admin',
        createdBy: currentUser?.name || 'System Admin',
        userRole: currentUser?.role || 'ADMIN'
      };

      let docId = editingDoc?.id;

      if (editingDoc) {
        await api.updateDocument(docId, payload);
      } else {
        const newDoc = await api.createDocument(payload);
        docId = newDoc.id;
      }

      await api.publishDocument(docId, currentUser?.name || 'System Admin', formState.targetAudience, currentUser?.role || 'ADMIN');

      setStatusMessage({ type: 'success', text: `✓ Document posted successfully. Notification sent to ${formState.targetAudience}.` });
      setIsModalOpen(false);
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to post the document. Please try again.' });
    } finally {
      setIsPosting(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!window.confirm('Are you sure you want to PUBLISH this official document? It will be immediately distributed to the authorized staff library and notifications will be sent.')) return;
    setProcessingAction({ id, type: 'publish' });
    setStatusMessage({ type: 'info', text: '⏳ Publishing document...' });
    try {
      await api.publishDocument(id, currentUser?.name || 'System Admin', undefined, currentUser?.role || 'ADMIN');
      setStatusMessage({ type: 'success', text: 'Document published successfully and is now available to the intended staff.' });
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to publish the document. Please try again.' });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleWithdraw = async (id: string) => {
    if (!window.confirm('Are you sure you want to withdraw/unpublish this document?')) return;
    setProcessingAction({ id, type: 'withdraw' });
    setStatusMessage({ type: 'info', text: '⏳ Withdrawing document...' });
    try {
      await api.withdrawDocument(id, currentUser?.role || 'ADMIN');
      setStatusMessage({ type: 'success', text: 'Document withdrawn successfully.' });
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to withdraw document.' });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this document?')) return;
    setProcessingAction({ id, type: 'archive' });
    setStatusMessage({ type: 'info', text: '⏳ Archiving document...' });
    try {
      await api.archiveDocument(id, currentUser?.role || 'ADMIN');
      setStatusMessage({ type: 'success', text: 'Document archived successfully.' });
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to archive the document.' });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this document?')) return;
    setProcessingAction({ id, type: 'delete' });
    setStatusMessage({ type: 'info', text: '⏳ Deleting document...' });
    try {
      await api.deleteDocument(id, currentUser?.role || 'ADMIN');
      setStatusMessage({ type: 'success', text: 'Document deleted successfully.' });
      setDocuments(prev => prev.filter(d => String(d.id) !== String(id)));
      fetchDocs();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete the document.' });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleViewHistory = async (doc: any) => {
    setProcessingAction({ id: doc.id, type: 'history' });
    setStatusMessage({ type: 'info', text: '⏳ Loading document version history...' });
    setHistoryDoc(doc);
    try {
      const data = await api.getDocumentVersions(doc.id);
      if (Array.isArray(data)) {
        setVersionsData({ versions: data, auditTrail: doc.auditTrail || [] });
      } else if (data && typeof data === 'object') {
        setVersionsData({
          versions: (data as any).versions || doc.versions || [],
          auditTrail: (data as any).auditTrail || doc.auditTrail || []
        });
      }
      setStatusMessage({ type: 'success', text: 'Document version history loaded successfully.' });
    } catch (e) {
      setVersionsData({ versions: doc.versions || [], auditTrail: doc.auditTrail || [] });
      setStatusMessage({ type: 'error', text: 'Unable to load document version history.' });
    } finally {
      setProcessingAction(null);
    }
  };

  const filteredDocuments = documents.filter(d => {
    const matchesSearch =
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.memoNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#3A1F0D] p-6 rounded-3xl border border-[#C89A2B]/40 shadow-xl">
        <div>
          <span className="bg-[#C89A2B] text-[#4A2C17] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Admin Management Console
          </span>
          <h2 className="text-xl font-black text-white mt-1 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#C89A2B]" />
            <span>Bank Documents Management (Memos, Policies & Circulars)</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Create, upload, version, publish, and track official bank operational documents across the organization.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-amber-500 text-[#4A2C17] text-xs font-black shadow-lg flex items-center space-x-2 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Document</span>
        </button>
      </div>

      {statusMessage && (
        <NotificationToast
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
          duration={5000}
        />
      )}

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#4A2C17]/90 p-4 rounded-2xl border border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title, ref no, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#C89A2B]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
          >
            <option value="ALL">All Document Types</option>
            <option value="Memo">Bank Memo</option>
            <option value="Policy">Policy</option>
            <option value="Circular">Circular</option>
            <option value="Procedure">Procedure</option>
            <option value="Announcement">Announcement</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-[#C89A2B]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="WITHDRAWN">Withdrawn</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Documents Table / Cards */}
      <div className="bg-[#3A1F0D] rounded-3xl border border-[#C89A2B]/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#4A2C17] text-[#C89A2B] uppercase text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Ref / Type</th>
                <th className="py-3 px-4">Title & Subject</th>
                <th className="py-3 px-4">Target Audience</th>
                <th className="py-3 px-4">Effective Date</th>
                <th className="py-3 px-4">Status & Ver.</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">Loading bank documents...</td>
                </tr>
              ) : filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">No bank documents found matching criteria.</td>
                </tr>
              ) : (
                filteredDocuments.map(doc => {
                  const isProcessing = processingAction?.id === doc.id;
                  return (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-white">{doc.memoNumber || doc.referenceNumber}</div>
                      <div className="text-[10px] text-[#C89A2B] mt-0.5">{doc.documentType || doc.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm">{doc.title}</div>
                      <div className="text-gray-400 text-[11px] truncate max-w-xs">{doc.subject || doc.content?.substring(0, 60)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px]">
                        {doc.targetAudience || 'ALL'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-300">
                      {doc.effectiveDate}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          doc.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          doc.status === 'DRAFT' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          doc.status === 'WITHDRAWN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                          'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {doc.status}
                        </span>
                        <span className="text-[10px] text-gray-400">v{doc.version || '1.0'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleViewPreview(doc)}
                          disabled={isProcessing}
                          title="Preview"
                          className={`p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleViewHistory(doc)}
                          disabled={isProcessing}
                          title="Audit & Version History"
                          className={`p-1.5 rounded-lg bg-[#C89A2B]/20 hover:bg-[#C89A2B]/30 text-[#C89A2B] transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          disabled={isProcessing}
                          title="Edit"
                          className={`p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {doc.status !== 'PUBLISHED' ? (
                          <button
                            onClick={() => handlePublish(doc.id)}
                            disabled={isProcessing}
                            title="Publish"
                            className={`p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleWithdraw(doc.id)}
                            disabled={isProcessing}
                            title="Withdraw / Unpublish"
                            className={`p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <RefreshCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(doc.id)}
                          disabled={isProcessing}
                          title="Archive"
                          className={`p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          disabled={isProcessing}
                          title="Delete"
                          className={`p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT DOCUMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#C89A2B]" />
                <span>{editingDoc ? `Edit Document: ${editingDoc.title}` : 'Create / Upload Official Bank Document'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Document Type *</label>
                  <select
                    value={formState.documentType}
                    onChange={(e) => setFormState({ ...formState, documentType: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  >
                    <option value="Memo">Bank Memo</option>
                    <option value="Policy">Policy</option>
                    <option value="Circular">Circular</option>
                    <option value="Procedure">Procedure</option>
                    <option value="Announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Reference Number *</label>
                  <input
                    type="text"
                    required
                    value={formState.referenceNumber}
                    onChange={(e) => setFormState({ ...formState, referenceNumber: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#C89A2B]"
                    placeholder="e.g. BN/DIR/012/2026"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Version</label>
                  <input
                    type="text"
                    value={formState.version}
                    onChange={(e) => setFormState({ ...formState, version: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#C89A2B]"
                  placeholder="e.g. Directive on Foreign Currency Mobilization & Retention"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Subject / Summary</label>
                <input
                  type="text"
                  value={formState.subject}
                  onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#C89A2B]"
                  placeholder="Short summary of the directive or circular"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={formState.effectiveDate}
                    onChange={(e) => setFormState({ ...formState, effectiveDate: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={formState.issueDate}
                    onChange={(e) => setFormState({ ...formState, issueDate: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Priority</label>
                  <select
                    value={formState.priority}
                    onChange={(e) => setFormState({ ...formState, priority: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Issuing Directorate / Department</label>
                  <input
                    type="text"
                    value={formState.issuingDepartment}
                    onChange={(e) => setFormState({ ...formState, issuingDepartment: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Target Audience</label>
                  <select
                    value={formState.targetAudience}
                    onChange={(e) => setFormState({ ...formState, targetAudience: e.target.value })}
                    className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C89A2B]"
                  >
                    <option value="ALL">Entire Bank (All Staff)</option>
                    <option value="Branch Managers">Branch Managers</option>
                    <option value="District Managers">District Managers</option>
                    <option value="Credit & Loans Department">Credit & Loans Department</option>
                    <option value="Digital Banking Staff">Digital Banking Staff</option>
                    <option value="Risk & Compliance">Risk & Compliance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Document Content / Body *</label>
                <textarea
                  required
                  rows={6}
                  value={formState.content}
                  onChange={(e) => setFormState({ ...formState, content: e.target.value })}
                  className="w-full bg-black/30 border border-white/15 rounded-xl p-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C89A2B]"
                  placeholder="Enter full text, instructions, and policy terms here..."
                ></textarea>
              </div>

              {/* File Attachment Upload */}
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 space-y-2">
                <label className="block text-[#C89A2B] font-extrabold flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Attach Official Document File (PDF, DOCX, XLSX, PPTX)</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileUploadSimulation}
                  className="w-full text-xs text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#C89A2B] file:text-[#4A2C17] hover:file:bg-amber-500 cursor-pointer"
                />
                {formState.fileName && (
                  <p className="text-emerald-300 text-[11px] font-mono">
                    Attached: {formState.fileName} ({formState.fileSize} - {formState.fileType})
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isPosting}
                  className="px-4 py-2 rounded-xl text-gray-300 bg-white/5 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePostAndSendClick}
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md flex items-center space-x-2 disabled:opacity-50"
                >
                  {isPosting ? (
                    <span>⏳ Posting...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send / Post</span>
                    </>
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-[#C89A2B] hover:bg-amber-500 text-[#4A2C17] font-black shadow-md disabled:opacity-50"
                >
                  Save as Draft / Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST CONFIRMATION MODAL */}
      {postConfirmationOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 text-white text-center">
            <div className="w-16 h-16 bg-[#C89A2B]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-[#C89A2B]" />
            </div>
            <h3 className="text-xl font-bold">Are you sure you want to post this document?</h3>
            <div className="bg-black/20 p-4 rounded-2xl border border-white/10">
              <p className="text-sm text-gray-300 mb-1">Target Audience:</p>
              <p className="text-lg font-black text-[#C89A2B]">{formState.targetAudience}</p>
            </div>
            <p className="text-xs text-gray-400">
              The document will be immediately published and available to the selected staff. Notifications will be dispatched.
            </p>
            <div className="flex justify-center space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setPostConfirmationOpen(false)}
                className="px-6 py-2.5 rounded-xl text-gray-300 bg-white/5 hover:bg-white/10 font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPostAndSend}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-md"
              >
                Confirm & Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-3xl max-w-2xl w-full p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C89A2B]/20 text-[#6B3F1D] px-2.5 py-1 rounded-full">
                  {previewDoc.documentType || previewDoc.category} • Ref: {previewDoc.memoNumber || previewDoc.referenceNumber}
                </span>
                <h3 className="text-2xl font-black text-[#6B3F1D] mt-2">{previewDoc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Effective: {previewDoc.effectiveDate} | Issuer: {previewDoc.authorizedIssuer || previewDoc.publisher}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-6 rounded-2xl border border-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {previewDoc.content}
            </div>

            {previewDoc.fileName && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                <div className="flex items-center space-x-2 text-amber-900">
                  <FileText className="w-5 h-5 text-[#C89A2B]" />
                  <span className="font-bold">{previewDoc.fileName}</span>
                  <span className="text-gray-500">({previewDoc.fileSize})</span>
                </div>
                <a
                  href={previewDoc.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-[#C89A2B] text-[#6B3F1D] font-bold rounded-xl shadow-sm hover:bg-amber-500"
                >
                  Download / Open Attachment
                </a>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-gray-200">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-5 py-2 bg-gray-800 text-white font-bold rounded-xl text-xs hover:bg-gray-900"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERSION HISTORY & AUDIT TRAIL MODAL */}
      {historyDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#4A2C17] border border-[#C89A2B] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-white my-8">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <History className="w-5 h-5 text-[#C89A2B]" />
                <span>Version Control & Audit Trail</span>
              </h3>
              <button
                onClick={() => setHistoryDoc(null)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10">
                <p className="font-bold text-[#C89A2B]">Document: {historyDoc.title}</p>
                <p className="text-gray-300 mt-1">Current Version: v{historyDoc.version || '1.0'} | Status: {historyDoc.status}</p>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Audit History Log</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {versionsData.auditTrail && versionsData.auditTrail.length > 0 ? (
                    versionsData.auditTrail.map((audit: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-2.5 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#C89A2B]">{audit.action}</span> by {audit.by}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{new Date(audit.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No audit events recorded yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-2">Previous Versions</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {versionsData.versions && versionsData.versions.length > 0 ? (
                    versionsData.versions.map((ver: any, idx: number) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-white">Version {ver.version}</span>
                          <span className="text-[10px] text-gray-400">{new Date(ver.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-300 truncate">{ver.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No previous version archives.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                onClick={() => setHistoryDoc(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
