import React, { useState } from 'react';
import { Sparkles, Bot, ArrowRight, Lightbulb, TrendingUp, Award, Zap, CheckCircle2, MessageSquare, RefreshCw } from 'lucide-react';
import { AiCompetitorInsight, AreaRanking } from '../../types/competitor';

interface AiInsightsPanelProps {
  rankings: AreaRanking[];
  onAskAi: (areaName: string, query?: string) => Promise<{ areaName: string; bunnaRank: number; aiResponseText: string; insight: AiCompetitorInsight }>;
}

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({ rankings, onAskAi }) => {
  const [selectedArea, setSelectedArea] = useState<string>(rankings[0]?.areaName || 'Bahir Dar');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{ areaName: string; bunnaRank: number; aiResponseText: string; insight: AiCompetitorInsight } | null>(null);

  const presetQueries = [
    'How can Bunna Bank overtake #1 CBE in deposit mobilization in this area?',
    'What digital banking strategy will close the QR/POS merchant gap?',
    'Formulate a 3-month branch expansion & marketing plan for local managers.',
    'Identify weak competitor KPIs to target for aggressive market capture.'
  ];

  const handleConsultAi = async (promptToUse?: string) => {
    setLoading(true);
    try {
      const q = promptToUse || customPrompt;
      const res = await onAskAi(selectedArea, q);
      setAiResult(res);
    } catch (err) {
      console.error('AI Competitor Consulting error:', err);
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
            <Sparkles className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">AI Strategic Advisor</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">AI Competitive Intelligence Consultant</h3>
          <p className="text-xs text-gray-300">Powered by server-side Gemini AI. Analyzes competitor gaps and generates actionable strategies for district and branch managers.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-300 font-medium">Target Hub:</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="bg-[#6B3F1D] border border-white/15 text-white text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#C89A2B]"
          >
            {rankings.map(r => (
              <option key={r.id} value={r.areaName}>{r.areaName} ({r.districtName})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Prompt Chips */}
      <div className="space-y-2">
        <label className="text-xs text-gray-300 font-semibold flex items-center space-x-2">
          <Lightbulb className="w-4 h-4 text-[#C89A2B]" />
          <span>Select Strategic Consulting Topic:</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {presetQueries.map((pq, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCustomPrompt(pq);
                handleConsultAi(pq);
              }}
              className="text-left bg-[#4A2C17]/60 hover:bg-[#6B3F1D] border border-white/10 hover:border-[#C89A2B]/50 p-3 rounded-xl text-xs text-gray-200 transition-all flex items-center justify-between group"
            >
              <span>{pq}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C89A2B] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
          <span>Or ask custom competitive strategy question:</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="e.g. Draft executive review notes on Awash Bank's mobile banking dominance in Hawassa..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConsultAi()}
            className="flex-1 bg-[#4A2C17]/60 border border-white/15 text-white placeholder-gray-400 text-xs rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#C89A2B]"
          />
          <button
            onClick={() => handleConsultAi()}
            disabled={loading}
            className="bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold px-5 py-3 rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>{loading ? 'Consulting AI...' : 'Analyze Strategy'}</span>
          </button>
        </div>
      </div>

      {/* AI Consulting Output Box */}
      <div className="bg-[#2E1B0E] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <Bot className="w-5 h-5" />
            <h4 className="text-base font-bold text-white">Bunna AI Strategy Intelligence Response</h4>
          </div>
          <span className="text-xs text-gray-400">Target Area: <strong className="text-white">{selectedArea}</strong></span>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C89A2B] animate-spin mx-auto" />
            <p className="text-xs text-gray-300 font-medium">Analyzing competitor deposit data, branch networks, and BPI weights via Gemini AI...</p>
          </div>
        ) : aiResult ? (
          <div className="space-y-4">
            <div className="prose prose-invert max-w-none text-xs text-gray-200 leading-relaxed whitespace-pre-line bg-[#6B3F1D]/40 p-4 rounded-xl border border-white/10 font-sans">
              {aiResult.aiResponseText}
            </div>

            {aiResult.insight?.recommendations && (
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-[#C89A2B] uppercase tracking-wider flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>Prioritized Executive Action Items:</span>
                </h5>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiResult.insight.recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-[#6B3F1D]/40 border border-white/10 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#C89A2B] uppercase">{rec.category}</span>
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                          {rec.expectedRankImprovement}
                        </span>
                      </div>
                      <h6 className="text-xs font-bold text-white">{rec.title}</h6>
                      <p className="text-[11px] text-gray-300">{rec.actionItem}</p>
                      <div className="pt-2 border-t border-white/5 text-[10px] text-[#C89A2B] font-semibold">
                        Expected Deposit Increase: + ETB {(rec.estimatedDepositIncreaseETB / 1e6).toFixed(1)}M
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-gray-400">
            Click any prompt chip above or type a custom question to trigger Gemini competitive analysis for {selectedArea}.
          </div>
        )}
      </div>

    </div>
  );
};
