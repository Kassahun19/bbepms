import React, { useState } from 'react';
import { Sliders, Plus, Save, CheckCircle, AlertCircle, Percent, RotateCcw } from 'lucide-react';
import { CompetitorKpi } from '../../types/competitor';

interface KpiBpiConfigPanelProps {
  kpis: CompetitorKpi[];
  onSaveKpiWeights: (updatedKpis: CompetitorKpi[]) => Promise<void>;
}

export const KpiBpiConfigPanel: React.FC<KpiBpiConfigPanelProps> = ({
  kpis,
  onSaveKpiWeights
}) => {
  const [localKpis, setLocalKpis] = useState<CompetitorKpi[]>([...kpis]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const totalWeight = localKpis.reduce((sum, k) => sum + (Number(k.bpiWeight) || 0), 0);
  const isValidTotal = Math.abs(totalWeight - 100) < 0.5;

  const handleWeightChange = (id: string, newWeight: number) => {
    setLocalKpis(prev =>
      prev.map(k => (k.id === id ? { ...k, bpiWeight: Math.max(0, newWeight) } : k))
    );
  };

  const handleReset = () => {
    setLocalKpis([...kpis]);
    setMessage(null);
  };

  const handleSave = async () => {
    if (!isValidTotal) {
      setMessage({ type: 'error', text: `Total BPI weight must equal exactly 100%. Current sum: ${totalWeight.toFixed(1)}%` });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await onSaveKpiWeights(localKpis);
      setMessage({ type: 'success', text: 'BPI KPI configuration & weighting saved successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save BPI configuration.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <Sliders className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">BPI Engine Weights</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">Banking Performance Index (BPI) Configuration</h3>
          <p className="text-xs text-gray-300">Adjust weighted relative significance for deposit volume, digital users, loans, and profit metrics to compute composite area ranks.</p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="bg-[#6B3F1D] hover:bg-[#4A2C17] text-gray-300 border border-white/15 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span>Reset Weights</span>
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !isValidTotal}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md ${
              isValidTotal
                ? 'bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D]'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Apply BPI Weights'}</span>
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

      {/* Weight Gauge Header */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isValidTotal ? 'bg-[#6B3F1D]/80 border-emerald-500/40' : 'bg-amber-950/80 border-amber-500/40'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isValidTotal ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Composite Index Weight Sum</h4>
            <p className="text-xs text-gray-300">
              {isValidTotal
                ? 'Weight sum is 100.0%. Mathematical normalization is valid for ranking.'
                : `Current weight total is ${totalWeight.toFixed(1)}%. Please balance weights so they equal 100%.`}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className={`text-2xl font-extrabold ${isValidTotal ? 'text-emerald-400' : 'text-amber-400'}`}>
            {totalWeight.toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-400 block uppercase">Target: 100.0%</span>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {localKpis.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-[#4A2C17]/60 border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#C89A2B]">{kpi.category} • {kpi.unit}</span>
                <h5 className="text-sm font-bold text-white">{kpi.name}</h5>
              </div>
              <div className="bg-[#6B3F1D] border border-white/10 px-3 py-1 rounded-lg text-right">
                <span className="text-sm font-extrabold text-[#C89A2B]">{kpi.bpiWeight}%</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">{kpi.description}</p>

            <div className="flex items-center space-x-3 pt-1">
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={kpi.bpiWeight}
                onChange={(e) => handleWeightChange(kpi.id, parseFloat(e.target.value) || 0)}
                className="w-full accent-[#C89A2B] bg-gray-800 h-2 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                value={kpi.bpiWeight}
                onChange={(e) => handleWeightChange(kpi.id, parseFloat(e.target.value) || 0)}
                className="w-16 bg-[#6B3F1D] border border-white/15 text-white font-bold text-xs rounded-lg px-2 py-1 text-center outline-none focus:ring-1 focus:ring-[#C89A2B]"
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
