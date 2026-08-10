import React, { useState } from 'react';
import { Target, Award, ArrowUpRight, ArrowDownRight, TrendingUp, Search, ChevronRight, BarChart3, Layers } from 'lucide-react';
import { AreaRanking } from '../../types/competitor';

interface GapAnalysisPanelProps {
  rankings: AreaRanking[];
}

export const GapAnalysisPanel: React.FC<GapAnalysisPanelProps> = ({ rankings }) => {
  const [selectedArea, setSelectedArea] = useState<string>(rankings[0]?.areaName || 'Bahir Dar');

  const currentArea = rankings.find(r => r.areaName.toLowerCase().includes(selectedArea.toLowerCase())) || rankings[0];

  return (
    <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-[#C89A2B]">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Benchmarking & Gap Intelligence</span>
          </div>
          <h3 className="text-2xl font-bold text-white mt-1">Area Gap Analysis vs Commercial Leader</h3>
          <p className="text-xs text-gray-300">Measure exact variance between Bunna Bank S.C. and top-ranking market leaders across key Ethiopian regional hubs.</p>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-xs text-gray-300 font-medium">Select Commercial Area:</label>
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

      {/* Area Summary Banner */}
      {currentArea && (
        <div className="bg-black/30 border border-white/10 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="border-r border-white/10 pr-4">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Targeted Commercial Hub</span>
            <h4 className="text-xl font-extrabold text-white">{currentArea.areaName}</h4>
            <span className="text-xs text-[#C89A2B]">{currentArea.districtName}</span>
          </div>

          <div className="border-r border-white/10 pr-4">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Bunna Bank Rank</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-[#C89A2B]">#{currentArea.bunnaRank}</span>
              <span className="text-xs text-gray-300">out of {currentArea.totalBanks} Banks</span>
            </div>
          </div>

          <div className="border-r border-white/10 pr-4">
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Bunna BPI Score</span>
            <span className="text-2xl font-black text-emerald-400">{currentArea.bunnaBpiScore} / 100</span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">Area Leader (#1)</span>
            <span className="text-lg font-bold text-white block">{currentArea.rankings[0]?.bankName || 'CBE'}</span>
            <span className="text-xs text-gray-400">BPI Leader: {currentArea.rankings[0]?.bpiScore}</span>
          </div>
        </div>
      )}

      {/* Gap Table */}
      {currentArea && (
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-[#C89A2B]">
            KPI Gap Breakdown vs #1 Rank ({currentArea.rankings[0]?.bankName})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#4A2C17] text-[#C89A2B] uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">KPI Metric</th>
                  <th className="py-3.5 px-4 text-right">Bunna Bank Value</th>
                  <th className="py-3.5 px-4 text-right">Best Competitor (#1)</th>
                  <th className="py-3.5 px-4 text-center">Gap %</th>
                  <th className="py-3.5 px-4 text-right">Target Growth Needed</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentArea.gapAnalysis.map((gap, idx) => {
                  const isBehind = gap.gapPercentage > 0;
                  return (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-3.5 h-3.5 text-[#C89A2B]" />
                          <span>{gap.kpiName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {gap.unit === 'ETB' ? `ETB ${gap.bunnaValue.toLocaleString()}` : gap.bunnaValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {gap.unit === 'ETB' ? `ETB ${gap.bestCompetitorValue.toLocaleString()}` : gap.bestCompetitorValue.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-mono text-[11px] font-bold inline-flex items-center space-x-1 ${
                          isBehind ? 'bg-red-950/70 text-red-300 border border-red-500/30' : 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {isBehind ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isBehind ? `-${gap.gapPercentage}%` : `+${Math.abs(gap.gapPercentage)}%`}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#C89A2B] font-bold">
                        {gap.unit === 'ETB' ? `+ ETB ${gap.targetToRankOne.toLocaleString()}` : `+ ${gap.targetToRankOne.toLocaleString()}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          gap.gapPercentage > 25 ? 'bg-amber-900/60 text-amber-300' : 'bg-emerald-900/60 text-emerald-300'
                        }`}>
                          {gap.gapPercentage > 25 ? 'High Opportunity Gap' : 'Competitive Margin'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaderboard Table for Area */}
      {currentArea && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider text-[#C89A2B]">
            Full Area Bank Rankings Leaderboard ({currentArea.areaName})
          </h4>

          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#4A2C17] text-[#C89A2B] uppercase text-[10px] tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Bank</th>
                  <th className="py-3 px-4">Branch Name</th>
                  <th className="py-3 px-4 text-right">Deposits Mobilized</th>
                  <th className="py-3 px-4 text-right">Customer Base</th>
                  <th className="py-3 px-4 text-right">Digital Users</th>
                  <th className="py-3 px-4 text-center">BPI Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentArea.rankings.map((r) => {
                  const isBunna = r.bankCode === 'BUNNA';
                  return (
                    <tr
                      key={r.rank}
                      className={`${isBunna ? 'bg-[#6B3F1D] font-bold text-white' : 'hover:bg-white/5 text-gray-200'}`}
                    >
                      <td className="py-3 px-4 font-mono font-black text-[#C89A2B]">#{r.rank}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{r.bankName}</span>
                          {isBunna && (
                            <span className="bg-[#C89A2B] text-[#6B3F1D] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                              BUNNA
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{r.branchName}</td>
                      <td className="py-3 px-4 text-right font-mono">ETB {(r.depositsETB / 1e6).toFixed(1)}M</td>
                      <td className="py-3 px-4 text-right font-mono">{r.customerCount.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-mono">{r.digitalUsers.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-400 font-mono">{r.bpiScore}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
