import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, Printer, File, X, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState<'excel' | 'pdf' | 'word' | 'csv' | 'print'>('excel');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-07-28');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [exporting, setExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    setSuccessMsg('');
    try {
      const blob = await api.exportReports(format, { startDate, endDate, districtFilter });
      
      // Trigger File Download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bunna_Bank_EPMS_Report_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMsg(`Report exported successfully as ${format.toUpperCase()}!`);
    } catch (err: any) {
      alert("Failed to export report.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 sm:p-8 relative">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <Download className="w-6 h-6 text-[#C89A2B]" />
          <div>
            <h3 className="font-extrabold text-xl text-white">Export Performance Reports</h3>
            <p className="text-xs text-[#C89A2B]">Multi-Format Enterprise Report Generator</p>
          </div>
        </div>

        {/* Format Selectors */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-6">
          {[
            { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
            { id: 'pdf', label: 'PDF Document', icon: FileText },
            { id: 'word', label: 'Word (.docx)', icon: File },
            { id: 'csv', label: 'CSV Data', icon: FileSpreadsheet },
            { id: 'print', label: 'Print View', icon: Printer }
          ].map(fmt => {
            const Icon = fmt.icon;
            return (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setFormat(fmt.id as any)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  format === fmt.id
                    ? 'bg-[#C89A2B] text-[#6B3F1D] border-[#C89A2B] font-bold shadow-lg'
                    : 'bg-white/5 text-white border-white/10 hover:border-[#C89A2B]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] leading-tight">{fmt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">District / Region Scope</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/20 text-xs text-white"
            >
              <option value="ALL">All Districts & Head Office</option>
              <option value="d1">Addis Ababa East District</option>
              <option value="d2">Addis Ababa West District</option>
              <option value="d3">Hawassa District</option>
            </select>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-200 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-bold text-xs shadow-xl hover:opacity-95 flex items-center justify-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating Report File...' : `Download ${format.toUpperCase()} Report`}</span>
        </button>

      </div>
    </div>
  );
};
