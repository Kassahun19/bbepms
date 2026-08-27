import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, ExternalLink, Calendar, CheckCircle2, AlertCircle, Shield, Eye, Check, Clock, Bookmark, BookmarkCheck, Trash2, FolderArchive, Info } from 'lucide-react';
import { api } from '../../services/api';
import { NotificationToast, NotificationType } from './NotificationToast';

interface BankMemoLibraryProps {
  currentUser: any;
}

export const BankMemoLibrary: React.FC<BankMemoLibraryProps> = ({ currentUser }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [viewTab, setViewTab] = useState<'ALL' | 'SAVED'>('ALL');
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: NotificationType; text: string } | null>(null);
  const [confirmRemoveDoc, setConfirmRemoveDoc] = useState<any | null>(null);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const data = await api.getDocuments({
        userRole: currentUser?.role,
        userDepartment: currentUser?.department,
        userId: currentUser?.id
      });
      setDocuments(data);
    } catch (err) {
      console.warn('Failed to load bank documents library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleOpenDoc = async (doc: any) => {
    setSelectedDoc(doc);
    if (currentUser?.id) {
      try {
        await api.markDocumentRead(doc.id, currentUser.id, currentUser?.name || currentUser?.id);
        setDocuments(prev => prev.map(d => {
          if (d.id === doc.id) {
            const readBy = d.readBy || [];
            if (!readBy.includes(currentUser.id)) readBy.push(currentUser.id);
            return { ...d, readBy };
          }
          return d;
        }));
      } catch (e) {}
    }
  };

  const handleToggleSave = async (doc: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.id) {
      setStatusMessage({ type: 'error', text: 'Error: User authentication session required.' });
      return;
    }
    try {
      const res = await api.saveStaffDocument(doc.id, currentUser.id, currentUser?.name || currentUser?.id);
      const isSavedNow = res?.isSaved;
      
      setDocuments(prev => prev.map(d => {
        if (d.id === doc.id) {
          const savedBy = d.savedBy || [];
          const updatedSaved = isSavedNow
            ? [...savedBy.filter((u: string) => u !== currentUser.id), currentUser.id]
            : savedBy.filter((u: string) => u !== currentUser.id);
          return { ...d, savedBy: updatedSaved };
        }
        return d;
      }));

      if (selectedDoc?.id === doc.id) {
        setSelectedDoc((prev: any) => {
          if (!prev) return null;
          const savedBy = prev.savedBy || [];
          const updatedSaved = isSavedNow
            ? [...savedBy.filter((u: string) => u !== currentUser.id), currentUser.id]
            : savedBy.filter((u: string) => u !== currentUser.id);
          return { ...prev, savedBy: updatedSaved };
        });
      }

      setStatusMessage({
        type: 'success',
        text: isSavedNow
          ? `✓ Document "${doc.title}" saved to your personal archive.`
          : `✓ Document "${doc.title}" removed from your personal archive.`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update personal archive status.' });
    }
  };

  const handleRemoveFromPersonalList = async () => {
    if (!confirmRemoveDoc || !currentUser?.id) return;
    const doc = confirmRemoveDoc;
    try {
      await api.removeStaffDocument(doc.id, currentUser.id, currentUser?.name || currentUser?.id);
      
      // Update local state to hide this document from personal view
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
      setConfirmRemoveDoc(null);

      setStatusMessage({
        type: 'success',
        text: `✓ Document "${doc.title}" removed from your view. Note: The central official document remains available to other staff.`
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to remove document from personal list.' });
      setConfirmRemoveDoc(null);
    }
  };

  const filteredDocs = documents.filter(d => {
    // Hide if removed by staff
    if (currentUser?.id && Array.isArray(d.hiddenBy) && d.hiddenBy.includes(currentUser.id)) {
      return false;
    }

    // Filter by saved archive tab
    if (viewTab === 'SAVED') {
      if (!currentUser?.id || !Array.isArray(d.savedBy) || !d.savedBy.includes(currentUser.id)) {
        return false;
      }
    }

    const matchesSearch =
      d.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.memoNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const docCat = (d.category || d.documentType || 'Memo').toUpperCase();
    const matchesCategory = categoryFilter === 'ALL' || docCat === categoryFilter.toUpperCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'MEMO', 'CIRCULAR', 'POLICY', 'PROCEDURE', 'ANNOUNCEMENT'];

  return (
    <div className="space-y-6">
      {statusMessage && (
        <NotificationToast
          type={statusMessage.type}
          message={statusMessage.text}
          onClose={() => setStatusMessage(null)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#3A1F0D] p-6 rounded-3xl border border-[#C89A2B]/40 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#C89A2B] text-[#4A2C17] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Enterprise Digital Library
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase border border-emerald-500/30">
              Read-Only Access
            </span>
          </div>
          <h2 className="text-xl font-black text-white mt-1 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-[#C89A2B]" />
            <span>Bank Memos, Policies & Circulars</span>
          </h2>
          <p className="text-xs text-gray-300 mt-1">
            Official operational directives, regulatory circulars, and executive guidelines.
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-black/30 border border-white/15 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
            />
          </div>
        </div>
      </div>

      {/* Main View Tabs (All Published vs My Saved Archive) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewTab('ALL')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
              viewTab === 'ALL'
                ? 'bg-[#C89A2B] text-[#4A2C17] shadow-lg font-black'
                : 'bg-[#3A1F0D] text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>All Published Documents ({documents.length})</span>
          </button>

          <button
            onClick={() => setViewTab('SAVED')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
              viewTab === 'SAVED'
                ? 'bg-[#C89A2B] text-[#4A2C17] shadow-lg font-black'
                : 'bg-[#3A1F0D] text-gray-300 hover:bg-white/10 border border-white/10'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>
              My Personal Saved Archive (
              {documents.filter(d => currentUser?.id && Array.isArray(d.savedBy) && d.savedBy.includes(currentUser.id)).length}
              )
            </span>
          </button>
        </div>

        <div className="text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center space-x-1.5">
          <Info className="w-3.5 h-3.5 text-[#C89A2B]" />
          <span>Staff mode: View, save personal copies, or download official attachments.</span>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              categoryFilter === cat
                ? 'bg-[#C89A2B] text-[#4A2C17] shadow-md font-extrabold'
                : 'bg-[#4A2C17] text-gray-300 hover:bg-white/5 border border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-400 text-xs">Loading Enterprise Digital Library...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400 text-xs bg-[#3A1F0D] rounded-3xl border border-white/10 p-8 space-y-2">
            <FileText className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-bold text-gray-300">No bank documents found.</p>
            <p className="text-[11px] text-gray-400">
              {viewTab === 'SAVED'
                ? 'You have not saved any documents to your personal archive yet. Click "Save to My Archive" on any document to save it here.'
                : 'There are currently no published documents matching your search/category criteria.'}
            </p>
          </div>
        ) : (
          filteredDocs.map(doc => {
            const isRead = doc.readBy && currentUser?.id && doc.readBy.includes(currentUser.id);
            const isSaved = doc.savedBy && currentUser?.id && doc.savedBy.includes(currentUser.id);

            return (
              <div
                key={doc.id}
                onClick={() => handleOpenDoc(doc)}
                className="bg-[#3A1F0D] rounded-3xl border border-[#C89A2B]/30 p-5 shadow-xl hover:border-[#C89A2B] transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full bg-[#C89A2B]/20 text-[#C89A2B] text-[10px] font-extrabold tracking-wider uppercase">
                      {doc.documentType || doc.category || 'Memo'}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => handleToggleSave(doc, e)}
                        title={isSaved ? "Saved in Personal Archive" : "Save to Personal Archive"}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-[#C89A2B] text-[#4A2C17] border-[#C89A2B]'
                            : 'bg-black/30 text-gray-400 border-white/10 hover:text-white hover:border-[#C89A2B]'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                      </button>

                      {!isRead ? (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-[#4A2C17] font-black text-[9px] animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>NEW</span>
                        </span>
                      ) : (
                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                          <Check className="w-3 h-3" />
                          <span>READ</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-gray-400">{doc.memoNumber || doc.referenceNumber}</span>
                    <h3 className="text-base font-bold text-white group-hover:text-[#C89A2B] transition-colors mt-0.5 line-clamp-2">
                      {doc.title}
                    </h3>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {doc.subject || doc.content}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-[#C89A2B]" />
                    <span>Effective: {doc.effectiveDate}</span>
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmRemoveDoc(doc);
                      }}
                      title="Remove from My Personal List"
                      className="text-gray-400 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[#C89A2B] font-bold group-hover:underline flex items-center space-x-1">
                      <span>Read</span>
                      <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CONFIRMATION MODAL FOR REMOVE FROM PERSONAL LIST */}
      {confirmRemoveDoc && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#3A1F0D] border border-amber-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-white">Remove Document from Personal View?</h3>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Are you sure you want to remove <span className="font-bold text-white">"{confirmRemoveDoc.title}"</span> from your personal inbox/list?
            </p>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-200">
              <strong>Notice:</strong> This action will only remove the document from your personal view. The central official bank document remains intact for other bank staff.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmRemoveDoc(null)}
                className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveFromPersonalList}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-md"
              >
                Yes, Remove from My List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT VIEWER MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-start border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C89A2B]/20 text-[#6B3F1D] px-3 py-1 rounded-full">
                    {selectedDoc.documentType || selectedDoc.category} • Ref: {selectedDoc.memoNumber || selectedDoc.referenceNumber}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    Target: {selectedDoc.targetAudience || 'Entire Bank (All Staff)'}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-[#6B3F1D] mt-2">{selectedDoc.title}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Effective: {selectedDoc.effectiveDate} | Directorate: {selectedDoc.issuingDepartment || 'Executive'} | Authorized Issuer: {selectedDoc.authorizedIssuer || selectedDoc.publisher}
                </p>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-800 bg-gray-50 p-6 rounded-2xl border border-gray-200 max-h-[50vh] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {selectedDoc.content}
            </div>

            {selectedDoc.fileName && (
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                <div className="flex items-center space-x-2 text-amber-900">
                  <FileText className="w-5 h-5 text-[#C89A2B]" />
                  <span className="font-bold">{selectedDoc.fileName}</span>
                  <span className="text-gray-500">({selectedDoc.fileSize})</span>
                </div>
                <a
                  href={selectedDoc.fileUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#C89A2B] text-[#6B3F1D] font-bold rounded-xl shadow-sm hover:bg-amber-500 flex items-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Attachment</span>
                </a>
              </div>
            )}

            {/* ACTION BAR FOR STAFF */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => handleToggleSave(selectedDoc, e)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    selectedDoc.savedBy && currentUser?.id && selectedDoc.savedBy.includes(currentUser.id)
                      ? 'bg-[#C89A2B] text-[#4A2C17]'
                      : 'bg-amber-100 text-[#6B3F1D] hover:bg-amber-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>
                    {selectedDoc.savedBy && currentUser?.id && selectedDoc.savedBy.includes(currentUser.id)
                      ? 'Saved in Personal Archive'
                      : 'Save to My Personal Archive'}
                  </span>
                </button>

                <button
                  onClick={() => setConfirmRemoveDoc(selectedDoc)}
                  className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center space-x-1.5 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove from My View</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-xl text-xs hover:bg-black"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
