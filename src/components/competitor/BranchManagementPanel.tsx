import React, { useState } from 'react';
import { GitBranch, Plus, Edit, Trash2, Upload, Search, CheckCircle, AlertCircle, MapPin, FileSpreadsheet } from 'lucide-react';
import { CompetitorBranch, CommercialBank } from '../../types/competitor';

interface BranchManagementPanelProps {
  branches: CompetitorBranch[];
  banks: CommercialBank[];
  onAddBranch: (branchData: Partial<CompetitorBranch>) => Promise<void>;
  onUpdateBranch: (id: string, branchData: Partial<CompetitorBranch>) => Promise<void>;
  onDeleteBranch: (id: string) => Promise<void>;
  onImportBranches: (items: any[]) => Promise<void>;
}

export const BranchManagementPanel: React.FC<BranchManagementPanelProps> = ({
  branches,
  banks,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onImportBranches
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBankId, setFilterBankId] = useState('ALL');
  const [filterCity, setFilterCity] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompetitorBranch | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formState, setFormState] = useState({
    bankId: '',
    branchName: '',
    solId: '',
    region: 'Addis Ababa',
    city: 'Addis Ababa',
    woreda: 'Kebele 03',
    districtName: 'East A.A District',
    latitude: 9.0100,
    longitude: 38.7600
  });

  const citiesList = Array.from(new Set(branches.map(b => b.city))).sort();

  const openCreateModal = () => {
    setEditingBranch(null);
    setFormState({
      bankId: banks[0]?.id || '',
      branchName: '',
      solId: `SOL-${Math.floor(100 + Math.random() * 900)}`,
      region: 'Addis Ababa',
      city: 'Addis Ababa',
      woreda: 'Kebele 03',
      districtName: 'East A.A District',
      latitude: 9.0100,
      longitude: 38.7600
    });
    setIsModalOpen(true);
  };

  const openEditModal = (br: CompetitorBranch) => {
    setEditingBranch(br);
    setFormState({
      bankId: br.bankId,
      branchName: br.branchName,
      solId: br.solId || '',
      region: br.region || 'Addis Ababa',
      city: br.city,
      woreda: br.woreda || '',
      districtName: br.districtName || 'East A.A District',
      latitude: br.latitude || 9.0100,
      longitude: br.longitude || 38.7600
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (editingBranch) {
        await onUpdateBranch(editingBranch.id, formState);
        setMessage({ type: 'success', text: `Updated ${formState.branchName} branch.` });
      } else {
        await onAddBranch(formState);
        setMessage({ type: 'success', text: `Added competitor branch ${formState.branchName}.` });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save branch.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (br: CompetitorBranch) => {
    if (!window.confirm(`Delete ${br.branchName} (${br.bankName})?`)) return;
    setLoading(true);
    try {
      await onDeleteBranch(br.id);
      setMessage({ type: 'success', text: `Removed branch ${br.branchName}.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete branch.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImport = async () => {
    if (!importText.trim()) return;
    setLoading(true);
    try {
      const lines = importText.trim().split('\n');
      const items: any[] = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(/,|\t/);
        if (parts.length >= 3) {
          const bankCode = parts[0].trim();
          const branchName = parts[1].trim();
          const city = parts[2].trim();
          const solId = parts[3] ? parts[3].trim() : `SOL-${Math.floor(100 + Math.random() * 900)}`;
          const districtName = parts[4] ? parts[4].trim() : 'East A.A District';

          if (branchName && city) {
            items.push({
              bankCode,
              branchName,
              city,
              solId,
              districtName
            });
          }
        }
      });

      if (items.length === 0) {
        alert('Format line expected: BANK_CODE, BRANCH_NAME, CITY, SOL_ID, DISTRICT_NAME');
        setLoading(false);
        return;
      }

      await onImportBranches(items);
      setMessage({ type: 'success', text: `Imported ${items.length} competitor branches.` });
      setImportModalOpen(false);
      setImportText('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Import failed.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(br => {
    const matchSearch =
      br.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      br.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (br.solId && br.solId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      br.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchBank = filterBankId === 'ALL' || br.bankId === filterBankId;
    const matchCity = filterCity === 'ALL' || br.city.toLowerCase() === filterCity.toLowerCase();

    return matchSearch && matchBank && matchCity;
  });

  return (
    <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <GitBranch className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Competitor Branch Directory</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">Competitor Branch Network Management</h3>
          <p className="text-xs text-gray-300">Map competitor branch Sol IDs, district catchment zones, and location metadata for local market comparison.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="bg-[#6B3F1D] hover:bg-[#4A2C17] text-gray-200 border border-white/15 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4 text-[#C89A2B]" />
            <span>Import Branches CSV</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Add Competitor Branch</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search branch name, Sol ID, bank, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#6B3F1D] border border-white/15 text-white placeholder-gray-400 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-[#C89A2B]"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={filterBankId}
            onChange={(e) => setFilterBankId(e.target.value)}
            className="w-full bg-[#6B3F1D] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#C89A2B]"
          >
            <option value="ALL">All Commercial Banks</option>
            {banks.map(b => (
              <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="w-full bg-[#6B3F1D] border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#C89A2B]"
          >
            <option value="ALL">All Hub Cities</option>
            {citiesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Branch Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#4A2C17] text-[#C89A2B] uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Branch Name</th>
              <th className="py-3 px-4">Bank</th>
              <th className="py-3 px-4">Sol ID</th>
              <th className="py-3 px-4">Hub City & Region</th>
              <th className="py-3 px-4">District Zone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No competitor branches matched your criteria.
                </td>
              </tr>
            ) : (
              filteredBranches.map((br) => (
                <tr key={br.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C89A2B]" />
                      <span>{br.branchName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#6B3F1D] border border-white/10 px-2 py-1 rounded text-white font-semibold text-[11px]">
                      {br.bankName}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[#C89A2B] font-bold">{br.solId || 'N/A'}</td>
                  <td className="py-3 px-4">{br.city}, {br.region}</td>
                  <td className="py-3 px-4 text-gray-300">{br.districtName}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      br.status === 'Active' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                    }`}>
                      {br.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(br)}
                        className="p-1.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                        title="Edit Branch"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(br)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 rounded-lg transition-all"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3">
              {editingBranch ? `Edit Branch: ${editingBranch.branchName}` : 'Register Competitor Branch'}
            </h4>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Commercial Bank *</label>
                <select
                  required
                  value={formState.bankId}
                  onChange={(e) => setFormState({ ...formState, bankId: e.target.value })}
                  className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bole Medhanealem"
                    value={formState.branchName}
                    onChange={(e) => setFormState({ ...formState, branchName: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Sol ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SOL-104"
                    value={formState.solId}
                    onChange={(e) => setFormState({ ...formState, solId: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">City / Hub *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bahir Dar, Hawassa"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">District Name</label>
                  <input
                    type="text"
                    placeholder="e.g. East A.A District"
                    value={formState.districtName}
                    onChange={(e) => setFormState({ ...formState, districtName: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Latitude (GPS)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formState.latitude}
                    onChange={(e) => setFormState({ ...formState, latitude: parseFloat(e.target.value) || 9.0100 })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Longitude (GPS)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formState.longitude}
                    onChange={(e) => setFormState({ ...formState, longitude: parseFloat(e.target.value) || 38.7600 })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold"
                >
                  {loading ? 'Saving...' : 'Save Branch Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-white/15 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-[#C89A2B] border-b border-white/10 pb-3">
              <FileSpreadsheet className="w-5 h-5" />
              <h4 className="text-xl font-bold text-white">Import Competitor Branches Batch</h4>
            </div>

            <p className="text-xs text-gray-300">
              Paste comma or tab-separated lines below:<br />
              <code className="text-[#C89A2B] bg-[#4A2C17] px-2 py-1 rounded block mt-1">
                BANK_CODE, BRANCH_NAME, CITY, SOL_ID, DISTRICT_NAME
              </code>
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`CBE, Main Branch, Addis Ababa, SOL-101, Central A.A District\nDASHEN, Bole Branch, Addis Ababa, SOL-204, East A.A District\nAWASH, Lake Shore Branch, Bahir Dar, SOL-309, Bahir Dar District`}
              className="w-full bg-[#4A2C17] border border-white/15 text-white font-mono text-xs rounded-xl p-3 outline-none focus:ring-2 focus:ring-[#C89A2B]"
            />

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={loading || !importText.trim()}
                className="px-5 py-2 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold"
              >
                {loading ? 'Processing Import...' : 'Import Branch Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
