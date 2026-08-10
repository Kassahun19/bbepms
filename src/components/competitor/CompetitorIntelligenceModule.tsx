import React, { useState, useEffect } from 'react';
import {
  Building2,
  GitBranch,
  Map,
  Target,
  Award,
  Sparkles,
  Sliders,
  Download,
  Bell,
  RefreshCw,
  Search,
  CheckCircle,
  Eye,
  BarChart3,
  TrendingUp,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../../services/api';
import {
  CommercialBank,
  CompetitorBranch,
  CompetitorKpi,
  CompetitorMonthlyPerformance,
  AreaRanking,
  AiCompetitorInsight,
  CompetitorAlert
} from '../../types/competitor';
import { EthiopiaCompetitorMap } from './EthiopiaCompetitorMap';
import { BankManagementPanel } from './BankManagementPanel';
import { BranchManagementPanel } from './BranchManagementPanel';
import { KpiBpiConfigPanel } from './KpiBpiConfigPanel';
import { GapAnalysisPanel } from './GapAnalysisPanel';
import { AiInsightsPanel } from './AiInsightsPanel';

interface CompetitorIntelligenceModuleProps {
  userRole?: string;
  userDistrict?: string;
  userBranch?: string;
}

export const CompetitorIntelligenceModule: React.FC<CompetitorIntelligenceModuleProps> = ({
  userRole = 'ADMINISTRATOR',
  userDistrict,
  userBranch
}) => {
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'MAP' | 'RANKINGS' | 'GAP' | 'AI' | 'BANKS' | 'BRANCHES' | 'KPI_CONFIG' | 'ALERTS'
  >('OVERVIEW');

  // Perspective state
  const [perspective, setPerspective] = useState<
    'EXECUTIVE' | 'REGIONAL' | 'DISTRICT' | 'BRANCH'
  >('EXECUTIVE');

  // Data Stores
  const [banks, setBanks] = useState<CommercialBank[]>([]);
  const [branches, setBranches] = useState<CompetitorBranch[]>([]);
  const [kpis, setKpis] = useState<CompetitorKpi[]>([]);
  const [performance, setPerformance] = useState<CompetitorMonthlyPerformance[]>([]);
  const [rankings, setRankings] = useState<AreaRanking[]>([]);
  const [alerts, setAlerts] = useState<CompetitorAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all initial data from backend API service
  const loadModuleData = async () => {
    setLoading(true);
    try {
      const [banksData, branchesData, kpisData, perfData, rankingsData, alertsData] = await Promise.all([
        api.getCommercialBanks(),
        api.getCompetitorBranches(),
        api.getCompetitorKpis(),
        api.getCompetitorPerformance(),
        api.getCompetitorRankings(),
        api.getCompetitorAlerts()
      ]);

      setBanks(banksData);
      setBranches(branchesData);
      setKpis(kpisData);
      setPerformance(perfData);
      setRankings(rankingsData);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load Competitor Intelligence Module data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModuleData();
  }, []);

  // CRUD Handler Proxy functions
  const handleAddBank = async (bankData: Partial<CommercialBank>) => {
    await api.addCommercialBank(bankData);
    await loadModuleData();
  };

  const handleUpdateBank = async (id: string, bankData: Partial<CommercialBank>) => {
    await api.updateCommercialBank(id, bankData);
    await loadModuleData();
  };

  const handleDeleteBank = async (id: string) => {
    await api.deleteCommercialBank(id);
    await loadModuleData();
  };

  const handleImportBanks = async (items: any[]) => {
    await api.importCommercialBanks(items);
    await loadModuleData();
  };

  const handleAddBranch = async (branchData: Partial<CompetitorBranch>) => {
    await api.addCompetitorBranch(branchData);
    await loadModuleData();
  };

  const handleUpdateBranch = async (id: string, branchData: Partial<CompetitorBranch>) => {
    await api.updateCompetitorBranch(id, branchData);
    await loadModuleData();
  };

  const handleDeleteBranch = async (id: string) => {
    await api.deleteCompetitorBranch(id);
    await loadModuleData();
  };

  const handleImportBranches = async (items: any[]) => {
    await api.importCompetitorBranches(items);
    await loadModuleData();
  };

  const handleSaveKpiWeights = async (updatedKpis: CompetitorKpi[]) => {
    await api.saveCompetitorKpis(updatedKpis);
    await loadModuleData();
  };

  const handleAskAi = async (areaName: string, query?: string) => {
    return await api.askCompetitorAiInsights(areaName, query);
  };

  // Export Report Helper
  const handleExportReport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (format === 'CSV') {
      const headers = ['Area Name', 'District', 'Bunna Rank', 'Bunna BPI Score', 'Total Competitor Banks'];
      const rows = rankings.map(r => [r.areaName, r.districtName, r.bunnaRank, r.bunnaBpiScore, r.totalBanks]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Bunna_Competitor_Intelligence_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Report exported in ${format} format. Downloading report bundle...`);
    }
  };

  const totalCompetitorBranches = branches.filter(b => b.bankCode !== 'BUNNA').length;
  const totalCommercialBanks = banks.length;
  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="space-y-6 text-gray-100 font-sans">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C89A2B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="bg-[#C89A2B] text-[#6B3F1D] text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow">
                NEW MODULE
              </span>
              <span className="text-xs font-semibold text-[#C89A2B] uppercase tracking-wider flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Executive Decision Support</span>
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Banking Competitor Intelligence System
            </h2>
            <p className="text-xs md:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Real-time market share tracking, area BPI score rankings, competitor Sol ID GIS mapping, and server-side Gemini AI strategic recommendations for Bunna Bank S.C.
            </p>
          </div>

          {/* Perspective & Export Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Perspective View Selector */}
            <div className="bg-black/30 border border-white/15 rounded-2xl p-1.5 flex items-center space-x-1 text-xs">
              <span className="text-[10px] text-gray-400 font-bold px-2 uppercase">Role View:</span>
              <button
                onClick={() => setPerspective('EXECUTIVE')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  perspective === 'EXECUTIVE'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Executive
              </button>
              <button
                onClick={() => setPerspective('REGIONAL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  perspective === 'REGIONAL'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Regional
              </button>
              <button
                onClick={() => setPerspective('DISTRICT')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  perspective === 'DISTRICT'
                    ? 'bg-[#C89A2B] text-[#6B3F1D] shadow'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                District
              </button>
            </div>

            {/* Export Dropdown */}
            <button
              onClick={() => handleExportReport('CSV')}
              className="bg-[#6B3F1D] hover:bg-[#4A2C17] text-[#C89A2B] border border-[#C89A2B]/40 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Export Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mt-6 pt-6 border-t border-white/10">
          
          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Operating Banks</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-white">{totalCommercialBanks}</span>
              <span className="text-[10px] text-emerald-400 font-bold">18 Private + CBE</span>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Tracked Competitor Branches</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-[#C89A2B]">{totalCompetitorBranches}</span>
              <span className="text-[10px] text-gray-400 font-semibold">Sol IDs Mapped</span>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Bunna Industry Rank</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-[#C89A2B]">#4</span>
              <span className="text-[10px] text-emerald-400 font-bold">In Target Hubs</span>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Bunna Average BPI</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-black text-emerald-400">79.2</span>
              <span className="text-[10px] text-gray-400">/ 100 Index</span>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 p-4 rounded-2xl col-span-2 lg:col-span-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Market Alerts</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-black text-amber-400">{unreadAlertsCount}</span>
              <span className="text-[10px] text-amber-300 font-medium">Unread Strategy Alerts</span>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10 text-xs font-bold">
        
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('MAP')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'MAP'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Interactive GIS Map</span>
        </button>

        <button
          onClick={() => setActiveTab('RANKINGS')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'RANKINGS'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Area Rankings & BPI</span>
        </button>

        <button
          onClick={() => setActiveTab('GAP')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'GAP'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Gap Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('AI')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'AI'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('BANKS')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'BANKS'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Bank Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('BRANCHES')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'BRANCHES'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          <span>Branch Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('KPI_CONFIG')}
          className={`px-4 py-3 rounded-2xl flex items-center space-x-2 whitespace-nowrap transition-all ${
            activeTab === 'KPI_CONFIG'
              ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md'
              : 'bg-[#6B3F1D]/50 text-gray-300 hover:text-white border border-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>BPI Weights Engine</span>
        </button>

      </div>

      {/* Main Tab Content Display */}
      {loading ? (
        <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#C89A2B] animate-spin mx-auto" />
          <p className="text-xs text-gray-300 font-medium">Loading Banking Competitor Intelligence database...</p>
        </div>
      ) : (
        <>
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* GIS Map Teaser + Area Leaders Overview */}
              <EthiopiaCompetitorMap
                rankings={rankings}
                branches={branches}
                banks={banks}
                onSelectArea={(area) => console.log('Selected Map Area:', area)}
              />

              {/* Top Areas Rankings Table */}
              <div className="bg-[#6B3F1D]/40 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[#C89A2B]" />
                    <span>Regional Commercial Hub Leaderboards Summary</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('RANKINGS')}
                    className="text-xs text-[#C89A2B] font-bold hover:underline"
                  >
                    View All Area Leaderboards →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {rankings.slice(0, 3).map((r) => (
                    <div key={r.id} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">{r.areaName}</h4>
                          <span className="text-[10px] text-gray-400">{r.districtName}</span>
                        </div>
                        <div className="bg-[#6B3F1D] border border-[#C89A2B]/30 px-3 py-1 rounded-lg text-center">
                          <span className="text-[9px] text-gray-300 block uppercase">Bunna Rank</span>
                          <span className="text-base font-black text-[#C89A2B]">#{r.bunnaRank}</span>
                        </div>
                      </div>

                      <div className="text-xs text-gray-300 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bunna BPI Score:</span>
                          <strong className="text-emerald-400">{r.bunnaBpiScore} / 100</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Area Market Leader:</span>
                          <strong className="text-white">{r.rankings[0]?.bankName}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MAP' && (
            <EthiopiaCompetitorMap
              rankings={rankings}
              branches={branches}
              banks={banks}
            />
          )}

          {activeTab === 'RANKINGS' && (
            <GapAnalysisPanel rankings={rankings} />
          )}

          {activeTab === 'GAP' && (
            <GapAnalysisPanel rankings={rankings} />
          )}

          {activeTab === 'AI' && (
            <AiInsightsPanel rankings={rankings} onAskAi={handleAskAi} />
          )}

          {activeTab === 'BANKS' && (
            <BankManagementPanel
              banks={banks}
              onAddBank={handleAddBank}
              onUpdateBank={handleUpdateBank}
              onDeleteBank={handleDeleteBank}
              onImportBanks={handleImportBanks}
            />
          )}

          {activeTab === 'BRANCHES' && (
            <BranchManagementPanel
              branches={branches}
              banks={banks}
              onAddBranch={handleAddBranch}
              onUpdateBranch={handleUpdateBranch}
              onDeleteBranch={handleDeleteBranch}
              onImportBranches={handleImportBranches}
            />
          )}

          {activeTab === 'KPI_CONFIG' && (
            <KpiBpiConfigPanel
              kpis={kpis}
              onSaveKpiWeights={handleSaveKpiWeights}
            />
          )}
        </>
      )}

    </div>
  );
};
