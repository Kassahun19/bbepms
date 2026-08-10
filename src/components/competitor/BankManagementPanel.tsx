import React, { useState } from 'react';
import { Building2, Plus, Edit, Trash2, Upload, Search, CheckCircle, AlertCircle, FileSpreadsheet, Sparkles } from 'lucide-react';
import { CommercialBank } from '../../types/competitor';

interface BankManagementPanelProps {
  banks: CommercialBank[];
  onAddBank: (bankData: Partial<CommercialBank>) => Promise<void>;
  onUpdateBank: (id: string, bankData: Partial<CommercialBank>) => Promise<void>;
  onDeleteBank: (id: string) => Promise<void>;
  onImportBanks: (items: any[]) => Promise<void>;
}

export const BankManagementPanel: React.FC<BankManagementPanelProps> = ({
  banks,
  onAddBank,
  onUpdateBank,
  onDeleteBank,
  onImportBanks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<CommercialBank | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [formState, setFormState] = useState({
    code: '',
    name: '',
    shortName: '',
    establishedYear: 2010,
    logoUrl: '',
    swiftCode: '',
    status: 'Active' as 'Active' | 'Inactive',
    totalBranchesNationwide: 100,
    color: '#003399'
  });

  const openCreateModal = () => {
    setEditingBank(null);
    setFormState({
      code: '',
      name: '',
      shortName: '',
      establishedYear: 2010,
      logoUrl: '',
      swiftCode: '',
      status: 'Active',
      totalBranchesNationwide: 100,
      color: '#003399'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (bank: CommercialBank) => {
    setEditingBank(bank);
    setFormState({
      code: bank.code,
      name: bank.name,
      shortName: bank.shortName,
      establishedYear: bank.establishedYear,
      logoUrl: bank.logoUrl || '',
      swiftCode: bank.swiftCode || '',
      status: bank.status,
      totalBranchesNationwide: bank.totalBranchesNationwide,
      color: bank.color || '#003399'
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      if (editingBank) {
        await onUpdateBank(editingBank.id, formState);
        setMessage({ type: 'success', text: `Updated ${formState.name} successfully.` });
      } else {
        await onAddBank(formState);
        setMessage({ type: 'success', text: `Added commercial bank ${formState.name} successfully.` });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save bank.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bank: CommercialBank) => {
    if (bank.isBunna) {
      alert('Primary Bunna Bank record cannot be deleted.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete ${bank.name} (${bank.code})?`)) return;
    setLoading(true);
    try {
      await onDeleteBank(bank.id);
      setMessage({ type: 'success', text: `Deleted bank ${bank.name} successfully.` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete bank.' });
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImport = async () => {
    if (!importText.trim()) return;
    setLoading(true);
    try {
      // Parse CSV/TSV/JSON lines
      const lines = importText.trim().split('\n');
      const items: any[] = [];

      lines.forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(/,|\t/);
        if (parts.length >= 2) {
          const code = parts[0].trim();
          const name = parts[1].trim();
          const shortName = parts[2] ? parts[2].trim() : name;
          const totalBranches = parts[3] ? parseInt(parts[3].trim()) || 50 : 50;
          if (code && name) {
            items.push({
              code,
              name,
              shortName,
              totalBranchesNationwide: totalBranches,
              status: 'Active'
            });
          }
        }
      });

      if (items.length === 0) {
        alert('No valid rows found. Please use format: CODE, FULL NAME, SHORT NAME, BRANCHES COUNT');
        setLoading(false);
        return;
      }

      await onImportBanks(items);
      setMessage({ type: 'success', text: `Successfully imported ${items.length} commercial banks!` });
      setImportModalOpen(false);
      setImportText('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Import failed.' });
    } finally {
      setLoading(false);
    }
  };

  const filteredBanks = banks.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.shortName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Bank Registry Directory</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">Ethiopian Commercial Banks Registry</h3>
          <p className="text-xs text-gray-300">Maintain official codes, SWIFT IDs, nationwide branch counts, and status for competitor intelligence.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setImportModalOpen(true)}
            className="bg-[#6B3F1D] hover:bg-[#4A2C17] text-gray-200 border border-white/15 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all"
          >
            <Upload className="w-4 h-4 text-[#C89A2B]" />
            <span>Import CSV/Excel</span>
          </button>

          <button
            onClick={openCreateModal}
            className="bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Bank</span>
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' : 'bg-red-950/80 text-red-300 border border-red-500/30'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search bank by name, code (e.g. CBE, Dashen, Awash)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#6B3F1D] border border-white/15 text-white placeholder-gray-400 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:ring-2 focus:ring-[#C89A2B] outline-none"
          />
        </div>

        <span className="text-xs text-gray-300">
          Total Registered: <strong className="text-[#C89A2B]">{banks.length} Banks</strong>
        </span>
      </div>

      {/* Banks Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-[#4A2C17] text-[#C89A2B] uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
            <tr>
              <th className="py-3 px-4">Bank</th>
              <th className="py-3 px-4">Bank Code</th>
              <th className="py-3 px-4">Est. Year</th>
              <th className="py-3 px-4">SWIFT Code</th>
              <th className="py-3 px-4 text-center">Nationwide Branches</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredBanks.map((bank) => (
              <tr key={bank.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-inner"
                      style={{ backgroundColor: bank.color || '#6B3F1D' }}
                    >
                      {bank.code.substring(0, 3)}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{bank.name}</span>
                      <span className="text-[10px] text-gray-400">{bank.shortName}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-mono font-bold text-[#C89A2B]">{bank.code}</td>
                <td className="py-3 px-4">{bank.establishedYear}</td>
                <td className="py-3 px-4 font-mono text-gray-400">{bank.swiftCode || 'N/A'}</td>
                <td className="py-3 px-4 text-center font-bold text-white">{bank.totalBranchesNationwide.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    bank.status === 'Active' ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {bank.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => openEditModal(bank)}
                      className="p-1.5 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      title="Edit Bank"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {!bank.isBunna && (
                      <button
                        onClick={() => handleDelete(bank)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 rounded-lg transition-all"
                        title="Delete Bank"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h4 className="text-xl font-bold text-white border-b border-white/10 pb-3">
              {editingBank ? `Edit Bank: ${editingBank.name}` : 'Register New Commercial Bank'}
            </h4>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Bank Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CBE, DASHEN"
                    value={formState.code}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Established Year</label>
                  <input
                    type="number"
                    value={formState.establishedYear}
                    onChange={(e) => setFormState({ ...formState, establishedYear: parseInt(e.target.value) || 2010 })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Commercial Bank of Ethiopia"
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Short Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CBE"
                    value={formState.shortName}
                    onChange={(e) => setFormState({ ...formState, shortName: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">SWIFT Code</label>
                  <input
                    type="text"
                    placeholder="e.g. CBETETAA"
                    value={formState.swiftCode}
                    onChange={(e) => setFormState({ ...formState, swiftCode: e.target.value.toUpperCase() })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Nationwide Branches</label>
                  <input
                    type="number"
                    value={formState.totalBranchesNationwide}
                    onChange={(e) => setFormState({ ...formState, totalBranchesNationwide: parseInt(e.target.value) || 10 })}
                    className="w-full bg-[#4A2C17] border border-white/15 text-white rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#C89A2B]"
                  />
                </div>
                <div>
                  <label className="text-gray-300 font-semibold block mb-1">Brand Theme Color</label>
                  <input
                    type="color"
                    value={formState.color}
                    onChange={(e) => setFormState({ ...formState, color: e.target.value })}
                    className="w-full bg-[#4A2C17] border border-white/15 h-9 rounded-xl px-1 py-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold"
                >
                  {loading ? 'Saving...' : 'Save Bank Record'}
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
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center space-x-2 text-[#C89A2B]">
                <FileSpreadsheet className="w-5 h-5" />
                <h4 className="text-xl font-bold text-white">Import Commercial Banks (CSV/Excel)</h4>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Paste comma or tab-separated bank records below. Expected format:<br />
              <code className="text-[#C89A2B] bg-[#4A2C17] px-2 py-1 rounded block mt-1">CODE, BANK NAME, SHORT NAME, BRANCH COUNT</code>
            </p>

            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder={`ZEMEN, Zemen Bank S.C., Zemen, 120\nOromia, Oromia Bank S.C., Oromia, 450\nHIKMA, ZamZam Bank S.C., ZamZam, 80`}
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
                {loading ? 'Processing Import...' : 'Import Bank Batch'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
