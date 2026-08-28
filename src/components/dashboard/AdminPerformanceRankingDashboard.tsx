import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Trophy,
  Award,
  Medal,
  Building2,
  Building,
  Users,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Download,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Printer
} from 'lucide-react';
import { api } from '../../services/api';
import { District, Branch, User, PerformanceTarget, DailyPerformanceReport } from '../../types';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { capPerformancePercentage, formatPerformancePercentage } from '../../utils/performanceClassification';

interface RankingLimitDropdownProps {
  id: string;
  value: number | 'all';
  onChange: (val: number | 'all') => void;
  options: { value: number | 'all'; label: string }[];
  variant?: 'gold' | 'rose';
  labelPrefix?: string;
}

const RankingLimitDropdown: React.FC<RankingLimitDropdownProps> = ({
  id,
  value,
  onChange,
  options,
  variant = 'gold',
  labelPrefix = 'Show:'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const currentOption = options.find(opt => String(opt.value) === String(value)) || options[0] || { label: String(value), value };
  const isGold = variant === 'gold';

  return (
    <div className="relative inline-flex items-center space-x-1.5" ref={dropdownRef}>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${isGold ? 'text-amber-200/80' : 'text-rose-300/80'}`}>
        {labelPrefix}
      </span>
      <button
        type="button"
        id={`${id}-trigger`}
        onClick={() => setIsOpen(prev => !prev)}
        className={`flex items-center justify-between space-x-2 px-3 py-1.5 rounded-lg border font-bold text-xs transition-all shadow-md focus:outline-none focus:ring-1 select-none min-w-[95px] cursor-pointer ${
          isGold
            ? 'bg-black/40 border-[#C89A2B]/60 text-[#C89A2B] hover:border-[#C89A2B] hover:bg-black/60 focus:ring-[#C89A2B]'
            : 'bg-black/40 border-rose-500/50 text-rose-300 hover:border-rose-400 hover:bg-black/60 focus:ring-rose-500'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id={`${id}-menu`}
          className={`absolute right-0 top-full mt-1.5 z-50 min-w-[130px] rounded-xl shadow-2xl border p-1 bg-[#241307] backdrop-blur-md flex flex-col space-y-0.5 ${
            isGold ? 'border-[#C89A2B]/60' : 'border-rose-500/60'
          }`}
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5 flex flex-col">
            {options.map(opt => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={`${id}-opt-${opt.value}`}
                  id={`${id}-opt-${opt.value}`}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left cursor-pointer ${
                    isSelected
                      ? isGold
                        ? 'bg-[#C89A2B]/25 text-[#C89A2B] font-bold'
                        : 'bg-rose-500/25 text-rose-300 font-bold'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ml-2 shrink-0 ${isGold ? 'text-[#C89A2B]' : 'text-rose-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminPerformanceRankingDashboardProps {
  districts: District[];
  branches: Branch[];
  employees: User[];
  reports: DailyPerformanceReport[];
  targets?: PerformanceTarget[];
  onRefreshData?: () => void;
  onViewBranchDetails?: (branch: Branch) => void;
}

export const AdminPerformanceRankingDashboard: React.FC<AdminPerformanceRankingDashboardProps> = ({
  districts: propDistricts,
  branches: propBranches,
  employees: propEmployees,
  reports: propReports,
  targets: propTargets = [],
  onRefreshData,
  onViewBranchDetails
}) => {
  // Active Ranking Category Tab
  const [rankingTab, setRankingTab] = useState<'districts' | 'branches' | 'employees'>('districts');

  // Period Filter State
  const [period, setPeriod] = useState<string>('annual');
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [districtFilter, setDistrictFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State
  const [loading, setLoading] = useState<boolean>(false);
  const [districtRankings, setDistrictRankings] = useState<any[]>([]);
  const [branchRankings, setBranchRankings] = useState<any[]>([]);
  const [employeeRankings, setEmployeeRankings] = useState<any[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [showAll, setShowAll] = useState<boolean>(false);

  // Filter State for Dynamic Ranking Display Counts (Default to 5)
  const [districtTopLimit, setDistrictTopLimit] = useState<number | 'all'>(5);
  const [districtBottomLimit, setDistrictBottomLimit] = useState<number | 'all'>(5);
  const [branchTopLimit, setBranchTopLimit] = useState<number | 'all'>(5);
  const [branchBottomLimit, setBranchBottomLimit] = useState<number | 'all'>(5);

  // Modal State for Breakdown View
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

  const { contentRef: breakdownModalRef, handleBackdropClick: handleBreakdropBackdropClick } = useModalDismiss({
    isOpen: !!selectedEntity,
    onClose: () => setSelectedEntity(null),
  });

  // Period Preset Change Handler
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    const anchor = new Date('2026-08-09');
    const year = anchor.getFullYear();
    const month = anchor.getMonth();

    if (newPeriod === 'today') {
      setStartDate('2026-08-09');
      setEndDate('2026-08-09');
    } else if (newPeriod === 'weekly') {
      const dayOfWeek = anchor.getDay();
      const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const mon = new Date(anchor);
      mon.setDate(anchor.getDate() - distToMon);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      setStartDate(mon.toISOString().substring(0, 10));
      setEndDate(sun.toISOString().substring(0, 10));
    } else if (newPeriod === 'monthly') {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      setStartDate(first.toISOString().substring(0, 10));
      setEndDate(last.toISOString().substring(0, 10));
    } else if (newPeriod === 'quarterly') {
      const q = Math.floor(month / 3);
      const first = new Date(year, q * 3, 1);
      const last = new Date(year, (q + 1) * 3, 0);
      setStartDate(first.toISOString().substring(0, 10));
      setEndDate(last.toISOString().substring(0, 10));
    } else if (newPeriod === 'semiannual') {
      const h = Math.floor(month / 6);
      const first = new Date(year, h * 6, 1);
      const last = new Date(year, (h + 1) * 6, 0);
      setStartDate(first.toISOString().substring(0, 10));
      setEndDate(last.toISOString().substring(0, 10));
    } else if (newPeriod === 'annual') {
      setStartDate(`${year}-01-01`);
      setEndDate(`${year}-12-31`);
    } else if (newPeriod === 'allTime') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Fetch dynamic rankings from backend
  const fetchRankings = async () => {
    setLoading(true);
    try {
      const params = {
        startDate,
        endDate,
        period,
        districtId: districtFilter !== 'All' ? districtFilter : undefined
      };

      const [dRank, bRank, eRank, metrics] = await Promise.all([
        api.getAdminPerformanceDistricts(params),
        api.getAdminPerformanceBranches(params),
        api.getAdminPerformanceEmployees(params),
        api.getAdminDashboardMetrics(params)
      ]);

      if (dRank && dRank.length > 0) {
        setDistrictRankings(dRank.map(d => ({
          ...d,
          performanceScore: capPerformancePercentage(d.performanceScore),
          achievementPercentage: capPerformancePercentage(d.achievementPercentage)
        })));
      }
      if (bRank && bRank.length > 0) {
        setBranchRankings(bRank.map(b => ({
          ...b,
          performanceScore: capPerformancePercentage(b.performanceScore),
          achievementPercentage: capPerformancePercentage(b.achievementPercentage)
        })));
      }
      if (eRank && eRank.length > 0) {
        setEmployeeRankings(eRank.map(e => ({
          ...e,
          performanceScore: capPerformancePercentage(e.performanceScore),
          achievementPercentage: capPerformancePercentage(e.achievementPercentage)
        })));
      }
      if (metrics) {
        setDashboardMetrics({
          ...metrics,
          overallPerformanceScore: capPerformancePercentage(metrics.overallPerformanceScore)
        });
      }
    } catch (err) {
      console.warn('Backend rankings fetch warning:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [startDate, endDate, period, districtFilter]);

  // Client-side Filter for Search Query
  const filteredDistricts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return districtRankings;
    return districtRankings.filter(d =>
      d.name?.toLowerCase().includes(q) ||
      d.code?.toLowerCase().includes(q) ||
      d.region?.toLowerCase().includes(q) ||
      d.managerName?.toLowerCase().includes(q)
    );
  }, [districtRankings, searchQuery]);

  const filteredBranches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = branchRankings;
    if (districtFilter !== 'All') {
      const dFilter = districtFilter.toLowerCase();
      list = list.filter(b => 
        (b.districtId && b.districtId.toLowerCase() === dFilter) ||
        (b.districtName && b.districtName.toLowerCase() === dFilter)
      );
    }
    if (!q) return list;
    return list.filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.solId?.toLowerCase().includes(q) ||
      b.districtName?.toLowerCase().includes(q) ||
      b.managerName?.toLowerCase().includes(q)
    );
  }, [branchRankings, districtFilter, searchQuery]);

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = employeeRankings;
    if (districtFilter !== 'All') {
      const dFilter = districtFilter.toLowerCase();
      list = list.filter(e =>
        (e.districtId && e.districtId.toLowerCase() === dFilter) ||
        (e.districtName && e.districtName.toLowerCase() === dFilter)
      );
    }
    if (!q) return list;
    return list.filter(e =>
      e.name?.toLowerCase().includes(q) ||
      e.userId?.toLowerCase().includes(q) ||
      e.jobTitle?.toLowerCase().includes(q) ||
      e.branchName?.toLowerCase().includes(q) ||
      e.districtName?.toLowerCase().includes(q)
    );
  }, [employeeRankings, districtFilter, searchQuery]);

  // Consistent sorting rules (Primary: performanceScore, Secondary: achievementPercentage, Tertiary: name)
  const allSortedDescBranches = useMemo(() => {
    return [...filteredBranches].sort((a, b) => {
      if (b.performanceScore !== a.performanceScore) return b.performanceScore - a.performanceScore;
      if (b.achievementPercentage !== a.achievementPercentage) return b.achievementPercentage - a.achievementPercentage;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [filteredBranches]);

  const allSortedAscBranches = useMemo(() => {
    return [...filteredBranches].sort((a, b) => {
      if (a.performanceScore !== b.performanceScore) return a.performanceScore - b.performanceScore;
      if (a.achievementPercentage !== b.achievementPercentage) return a.achievementPercentage - b.achievementPercentage;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [filteredBranches]);

  const allSortedDescDistricts = useMemo(() => {
    return [...filteredDistricts].sort((a, b) => {
      if (b.performanceScore !== a.performanceScore) return b.performanceScore - a.performanceScore;
      if (b.achievementPercentage !== a.achievementPercentage) return b.achievementPercentage - a.achievementPercentage;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [filteredDistricts]);

  const allSortedAscDistricts = useMemo(() => {
    return [...filteredDistricts].sort((a, b) => {
      if (a.performanceScore !== b.performanceScore) return a.performanceScore - b.performanceScore;
      if (a.achievementPercentage !== b.achievementPercentage) return a.achievementPercentage - b.achievementPercentage;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [filteredDistricts]);

  // Dynamically sliced rankings without meaningless empty slots
  const displayedTopBranches = useMemo(() => {
    if (branchTopLimit === 'all') return allSortedDescBranches;
    return allSortedDescBranches.slice(0, Math.min(Number(branchTopLimit), allSortedDescBranches.length));
  }, [allSortedDescBranches, branchTopLimit]);

  const displayedBottomBranches = useMemo(() => {
    if (branchBottomLimit === 'all') return allSortedAscBranches;
    return allSortedAscBranches.slice(0, Math.min(Number(branchBottomLimit), allSortedAscBranches.length));
  }, [allSortedAscBranches, branchBottomLimit]);

  const displayedTopDistricts = useMemo(() => {
    if (districtTopLimit === 'all') return allSortedDescDistricts;
    return allSortedDescDistricts.slice(0, Math.min(Number(districtTopLimit), allSortedDescDistricts.length));
  }, [allSortedDescDistricts, districtTopLimit]);

  const displayedBottomDistricts = useMemo(() => {
    if (districtBottomLimit === 'all') return allSortedAscDistricts;
    return allSortedAscDistricts.slice(0, Math.min(Number(districtBottomLimit), allSortedAscDistricts.length));
  }, [allSortedAscDistricts, districtBottomLimit]);

  // Dynamic ranking dropdown options generator based on available count
  const getRankingLimitOptions = (totalAvailable: number, rankingKind: 'Top' | 'Bottom'): { value: number | 'all'; label: string }[] => {
    const steps = [5, 10, 15, 20, 25, 50];
    const availableSteps = steps.filter(s => s < totalAvailable);
    return [
      ...availableSteps.map(s => ({ value: s as number | 'all', label: `${rankingKind} ${s}` })),
      ...(totalAvailable > 0 && !steps.includes(totalAvailable) ? [{ value: totalAvailable as number | 'all', label: `${rankingKind} ${totalAvailable}` }] : []),
      { value: 'all' as const, label: `All (${totalAvailable})` }
    ];
  };

  // Helper: Format heading count text
  const getHeadingLabel = (limit: number | 'all', currentCount: number, totalCount: number, rankingKind: 'TOP' | 'BOTTOM') => {
    if (limit === 'all') {
      return `${rankingKind} ALL (${currentCount})`;
    }
    if (limit > totalCount) {
      return `${rankingKind} ${currentCount}`;
    }
    return `${rankingKind} ${limit}`;
  };

  // Export CSV of currently active ranking table
  const handleExportCSV = () => {
    let headers = '';
    let rows = '';
    const dateStr = new Date().toISOString().substring(0, 10);

    if (rankingTab === 'districts') {
      headers = 'Rank,District Name,Code/SOL,Region,Manager,Target (ETB),Actual (ETB),Achievement (%),Score,Branches,Staff\n';
      rows = filteredDistricts.map(d =>
        `"${d.rank}","${d.name}","${d.code}","${d.region}","${d.managerName}",${d.totalTarget},${d.totalActual},${d.achievementPercentage},${d.performanceScore},${d.branchCount},${d.employeeCount}`
      ).join('\n');
    } else if (rankingTab === 'branches') {
      headers = 'Rank,Branch Name,SOL ID,District,Region,Manager,Target (ETB),Actual (ETB),Achievement (%),Score,Staff\n';
      rows = filteredBranches.map(b =>
        `"${b.rank}","${b.name}","${b.solId}","${b.districtName}","${b.region}","${b.managerName}",${b.target},${b.achievement},${b.achievementPercentage},${b.performanceScore},${b.employeeCount}`
      ).join('\n');
    } else {
      headers = 'Rank,Employee Name,Staff ID,Job Title,Branch,District,Target (ETB),Actual (ETB),Achievement (%),Score,Approved Reports\n';
      rows = filteredEmployees.map(e =>
        `"${e.rank}","${e.name}","${e.userId}","${e.jobTitle}","${e.branchName}","${e.districtName}",${e.target},${e.achievement},${e.achievementPercentage},${e.performanceScore},${e.approvedReportCount}`
      ).join('\n');
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `Bunna_Bank_Top_${rankingTab}_Rankings_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper: Format ETB Currency
  const formatETB = (val: number = 0) => {
    if (val >= 1_000_000_000) return `ETB ${(val / 1_000_000_000).toFixed(2)}B`;
    if (val >= 1_000_000) return `ETB ${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `ETB ${(val / 1_000).toFixed(1)}k`;
    return `ETB ${val.toLocaleString()}`;
  };

  // Helper: Rank Badge Styling
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 font-black shadow-lg border border-amber-200">
          <Trophy className="w-4 h-4 mr-0.5" /> 1
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 font-black shadow-md border border-slate-100">
          <Medal className="w-4 h-4 mr-0.5" /> 2
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 text-amber-100 font-black shadow-md border border-amber-600">
          <Award className="w-4 h-4 mr-0.5" /> 3
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 text-gray-300 font-bold border border-white/10 text-xs">
        #{rank}
      </div>
    );
  };

  return (
    <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/40 shadow-2xl text-white space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-5 border-b border-white/15">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#C89A2B] text-[#4A2C17] font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Executive Analytics
            </span>
            <span className="text-xs text-amber-200/80 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Approved Reports Only</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 flex items-center space-x-2">
            <Trophy className="w-7 h-7 text-[#C89A2B]" />
            <span>Admin Performance Ranking Dashboard</span>
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Dynamic nationwide leaderboards across Districts, Branches, and Staff based on verified target achievements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => fetchRankings()}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center space-x-1.5 transition-all text-amber-100 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#4A2C17] font-extrabold text-xs flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#4A2C17]" />
            <span>Export {rankingTab.charAt(0).toUpperCase() + rankingTab.slice(1)} CSV</span>
          </button>
        </div>
      </div>

      {/* FILTER & PERIOD SELECTOR BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 p-4 rounded-2xl bg-[#3A1F0D] border border-white/10 text-xs">
        
        {/* Period Selector Buttons */}
        <div className="md:col-span-6 flex flex-wrap items-center gap-1.5">
          {[
            { id: 'allTime', label: 'All-Time' },
            { id: 'today', label: 'Today' },
            { id: 'weekly', label: 'This Week' },
            { id: 'monthly', label: 'This Month' },
            { id: 'quarterly', label: 'Quarterly' },
            { id: 'semiannual', label: 'Semi-Annually' },
            { id: 'annual', label: 'Yearly' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => handlePeriodChange(p.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                period === p.id
                  ? 'bg-[#C89A2B] text-[#3A1F0D] shadow-sm'
                  : 'bg-[#4A2C17] text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* District Filter Dropdown */}
        <div className="md:col-span-3">
          <div className="flex items-center space-x-2 bg-[#4A2C17] px-3 py-1.5 rounded-xl border border-white/15">
            <Filter className="w-3.5 h-3.5 text-[#C89A2B]" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-transparent text-xs text-white focus:outline-none w-full cursor-pointer"
            >
              <option value="All" className="bg-[#4A2C17]">All Districts</option>
              {propDistricts.map(d => (
                <option key={d.id} value={d.id} className="bg-[#4A2C17]">{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Search Input */}
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${rankingTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#4A2C17] border border-white/15 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
            />
          </div>
        </div>
      </div>

      {/* TOP AGGREGATE SUMMARY STRIP */}
      {dashboardMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-[#3A1F0D]/80 border border-[#C89A2B]/30">
            <p className="text-[11px] text-amber-200/70 font-medium">Approved Mobilized Deposits</p>
            <h4 className="text-lg font-black text-amber-300 mt-0.5">
              {formatETB(dashboardMetrics.mobilizedActuals?.totalDepositsETB)}
            </h4>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#3A1F0D]/80 border border-[#C89A2B]/30">
            <p className="text-[11px] text-amber-200/70 font-medium">Approved Submissions</p>
            <h4 className="text-lg font-black text-emerald-400 mt-0.5">
              {dashboardMetrics.counts?.approvedReports || 0} Reports
            </h4>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#3A1F0D]/80 border border-[#C89A2B]/30">
            <p className="text-[11px] text-amber-200/70 font-medium">Digital Banking Activations</p>
            <h4 className="text-lg font-black text-cyan-300 mt-0.5">
              {((dashboardMetrics.mobilizedActuals?.totalMobileBanking || 0) + (dashboardMetrics.mobilizedActuals?.totalAtmCards || 0)).toLocaleString()}
            </h4>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#3A1F0D]/80 border border-[#C89A2B]/30">
            <p className="text-[11px] text-amber-200/70 font-medium">Enterprise Average Achievement</p>
            <h4 className="text-lg font-black text-[#C89A2B] mt-0.5">
              {formatPerformancePercentage(dashboardMetrics.overallPerformanceScore || 94.2)}
            </h4>
          </div>
        </div>
      )}

      {/* SCREENSHOT-STYLE DYNAMIC LEADERBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Dynamic Top Branches */}
        <div id="top-branches-card" className="bg-[#3A1F0D] rounded-3xl border border-[#C89A2B]/40 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-white/10">
            <h3 className="text-xs font-black text-[#C89A2B] uppercase tracking-wider flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#C89A2B]" />
              <span>{getHeadingLabel(branchTopLimit, displayedTopBranches.length, allSortedDescBranches.length, 'TOP')} BRANCHES (PERIOD AVG)</span>
            </h3>
            <RankingLimitDropdown
              id="branch-top-select"
              value={branchTopLimit}
              onChange={setBranchTopLimit}
              options={getRankingLimitOptions(allSortedDescBranches.length, 'Top')}
              variant="gold"
              labelPrefix="Show:"
            />
          </div>
          
          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {displayedTopBranches.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No branch rankings available.</p>
            ) : (
              displayedTopBranches.map((b, idx) => (
                <div 
                  key={b.id || idx} 
                  id={`top-branch-item-${idx + 1}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-[#C89A2B]/40 hover:bg-black/30 transition-all cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'Branch', ...b, rank: idx + 1 })}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#C89A2B]/20 text-[#C89A2B] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{b.name} <span className="text-amber-300 font-normal">({b.solId || 'SOL'})</span></p>
                      <p className="text-[10px] text-gray-400">{b.districtName || 'District'} • {b.employeeCount || 0} Staff</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">
                      {formatPerformancePercentage(b.performanceScore ?? b.achievementPercentage ?? 0)}
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium">{formatETB(b.achievement || b.actuals?.deposits)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-1 text-right text-[10px] text-gray-400">
            Displaying {displayedTopBranches.length} of {allSortedDescBranches.length} branches
          </div>
        </div>

        {/* Dynamic Bottom Branches */}
        <div id="bottom-branches-card" className="bg-[#3A1F0D] rounded-3xl border border-rose-500/30 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-white/10">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{getHeadingLabel(branchBottomLimit, displayedBottomBranches.length, allSortedAscBranches.length, 'BOTTOM')} BRANCHES (PERIOD AVG)</span>
            </h3>
            <RankingLimitDropdown
              id="branch-bottom-select"
              value={branchBottomLimit}
              onChange={setBranchBottomLimit}
              options={getRankingLimitOptions(allSortedAscBranches.length, 'Bottom')}
              variant="rose"
              labelPrefix="Show:"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {displayedBottomBranches.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No branch rankings available.</p>
            ) : (
              displayedBottomBranches.map((b, idx) => (
                <div 
                  key={b.id || idx} 
                  id={`bottom-branch-item-${idx + 1}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-rose-500/40 hover:bg-black/30 transition-all cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'Branch', ...b, rank: idx + 1 })}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{b.name} <span className="text-rose-300 font-normal">({b.solId || 'SOL'})</span></p>
                      <p className="text-[10px] text-gray-400">{b.districtName || 'District'} • {b.employeeCount || 0} Staff</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-300">
                      {formatPerformancePercentage(b.performanceScore ?? b.achievementPercentage ?? 0)}
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium">{formatETB(b.achievement || b.actuals?.deposits)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-1 text-right text-[10px] text-gray-400">
            Displaying {displayedBottomBranches.length} of {allSortedAscBranches.length} branches
          </div>
        </div>

        {/* Dynamic Top Districts */}
        <div id="top-districts-card" className="bg-[#3A1F0D] rounded-3xl border border-[#C89A2B]/40 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-white/10">
            <h3 className="text-xs font-black text-[#C89A2B] uppercase tracking-wider flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-[#C89A2B]" />
              <span>{getHeadingLabel(districtTopLimit, displayedTopDistricts.length, allSortedDescDistricts.length, 'TOP')} DISTRICTS (PERIOD AVG)</span>
            </h3>
            <RankingLimitDropdown
              id="district-top-select"
              value={districtTopLimit}
              onChange={setDistrictTopLimit}
              options={getRankingLimitOptions(allSortedDescDistricts.length, 'Top')}
              variant="gold"
              labelPrefix="Show:"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {displayedTopDistricts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No district rankings available.</p>
            ) : (
              displayedTopDistricts.map((d, idx) => (
                <div 
                  key={d.id || idx} 
                  id={`top-district-item-${idx + 1}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-[#C89A2B]/40 hover:bg-black/30 transition-all cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'District', ...d, rank: idx + 1 })}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#C89A2B]/20 text-[#C89A2B] font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{d.name} <span className="text-amber-300 font-normal">({d.code || 'DIST'})</span></p>
                      <p className="text-[10px] text-gray-400">{d.region || 'Region'} • {d.branchCount || 0} Branches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">
                      {formatPerformancePercentage(d.performanceScore ?? d.achievementPercentage ?? 0)}
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium">{formatETB(d.totalActual || d.achievement)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-1 text-right text-[10px] text-gray-400">
            Displaying {displayedTopDistricts.length} of {allSortedDescDistricts.length} districts
          </div>
        </div>

        {/* Dynamic Bottom Districts */}
        <div id="bottom-districts-card" className="bg-[#3A1F0D] rounded-3xl border border-rose-500/30 p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2.5 border-b border-white/10">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{getHeadingLabel(districtBottomLimit, displayedBottomDistricts.length, allSortedAscDistricts.length, 'BOTTOM')} DISTRICTS (PERIOD AVG)</span>
            </h3>
            <RankingLimitDropdown
              id="district-bottom-select"
              value={districtBottomLimit}
              onChange={setDistrictBottomLimit}
              options={getRankingLimitOptions(allSortedAscDistricts.length, 'Bottom')}
              variant="rose"
              labelPrefix="Show:"
            />
          </div>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {displayedBottomDistricts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No district rankings available.</p>
            ) : (
              displayedBottomDistricts.map((d, idx) => (
                <div 
                  key={d.id || idx} 
                  id={`bottom-district-item-${idx + 1}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/20 border border-white/5 hover:border-rose-500/40 hover:bg-black/30 transition-all cursor-pointer"
                  onClick={() => setSelectedEntity({ type: 'District', ...d, rank: idx + 1 })}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-300 font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white">{d.name} <span className="text-rose-300 font-normal">({d.code || 'DIST'})</span></p>
                      <p className="text-[10px] text-gray-400">{d.region || 'Region'} • {d.branchCount || 0} Branches</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-300">
                      {formatPerformancePercentage(d.performanceScore ?? d.achievementPercentage ?? 0)}
                    </span>
                    <p className="text-[9px] text-gray-400 font-medium">{formatETB(d.totalActual || d.achievement)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-1 text-right text-[10px] text-gray-400">
            Displaying {displayedBottomDistricts.length} of {allSortedAscDistricts.length} districts
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-PILLAR KPI BREAKDOWN DETAILS MODAL                                      */}
      {/* ========================================================================= */}
      {selectedEntity && (
        <div
          onClick={handleBreakdropBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            ref={breakdownModalRef}
            className="relative w-full max-w-3xl rounded-3xl bg-[#3A1F0D] border border-[#C89A2B]/50 p-6 shadow-2xl text-white space-y-6"
          >
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/15 pb-4">
              <div>
                <span className="bg-[#C89A2B] text-[#3A1F0D] font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  {selectedEntity.type} Performance Breakdown
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">
                  {selectedEntity.name}
                </h3>
                <p className="text-xs text-amber-200/80">
                  {selectedEntity.code || selectedEntity.solId || selectedEntity.userId || ''} • Rank #{selectedEntity.rank} ({period.toUpperCase()} Period)
                </p>
              </div>

              <ModalCloseButton onClose={() => setSelectedEntity(null)} ariaLabel="Close performance breakdown modal" />
            </div>

            {/* Overall Score Badge */}
            <div className="p-4 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-300">Overall Weighted Score</p>
                <h4 className="text-2xl font-black text-[#C89A2B] mt-0.5">
                  {formatPerformancePercentage(selectedEntity.performanceScore)}
                </h4>
              </div>
              <div className="text-right text-xs text-gray-300">
                <p>Deposit Achievement: <span className="font-bold text-emerald-400">{formatPerformancePercentage(selectedEntity.achievementPercentage)}</span></p>
                <p>Approved Reports: <span className="font-bold text-white">{selectedEntity.approvedReportCount || 0}</span></p>
              </div>
            </div>

            {/* 5 KPI Category Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              
              {/* 1. Deposit (20%) */}
              <div className="p-3.5 rounded-xl bg-[#4A2C17] border border-white/10">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">1. Deposits (20%)</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Score: {formatPerformancePercentage(selectedEntity.weightedScores?.deposit || 0)}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-300">
                  <div>Target: {formatETB(selectedEntity.targets?.deposit)}</div>
                  <div>Actual: <span className="font-bold text-emerald-400">{formatETB(selectedEntity.actuals?.deposits)}</span></div>
                  <div>Achievement: <span className="font-bold text-white">{formatPerformancePercentage(selectedEntity.achievements?.deposit || 0)}</span></div>
                </div>
              </div>

              {/* 2. FCY (15%) */}
              <div className="p-3.5 rounded-xl bg-[#4A2C17] border border-white/10">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">2. FCY Inflow (15%)</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Score: {formatPerformancePercentage(selectedEntity.weightedScores?.fcy || 0)}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-300">
                  <div>Target: {formatETB(selectedEntity.targets?.fcy)}</div>
                  <div>Actual: <span className="font-bold text-emerald-400">{formatETB(selectedEntity.actuals?.fcy)}</span></div>
                  <div>Achievement: <span className="font-bold text-white">{formatPerformancePercentage(selectedEntity.achievements?.fcy || 0)}</span></div>
                </div>
              </div>

              {/* 3. DFS (20%) */}
              <div className="p-3.5 rounded-xl bg-[#4A2C17] border border-white/10">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">3. DFS (20%)</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Score: {formatPerformancePercentage(selectedEntity.weightedScores?.dfs || 0)}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-300">
                  <div>Target: {formatETB(selectedEntity.targets?.dfs)}</div>
                  <div>Actual: <span className="font-bold text-emerald-400">{formatETB(selectedEntity.actuals?.dfs)}</span></div>
                  <div>Achievement: <span className="font-bold text-white">{formatPerformancePercentage(selectedEntity.achievements?.dfs || 0)}</span></div>
                </div>
              </div>

              {/* 4. Customer Base (20%) */}
              <div className="p-3.5 rounded-xl bg-[#4A2C17] border border-white/10">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">4. Customers (20%)</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Score: {formatPerformancePercentage(selectedEntity.weightedScores?.customerBase || 0)}</span>
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-gray-300">
                  <div>Target: {selectedEntity.targets?.customerBase || 0} Accounts</div>
                  <div>Actual: <span className="font-bold text-emerald-400">{selectedEntity.actuals?.customerBase || 0} Accounts</span></div>
                  <div>Achievement: <span className="font-bold text-white">{formatPerformancePercentage(selectedEntity.achievements?.customerBase || 0)}</span></div>
                </div>
              </div>

              {/* 5. Digitals (25%) */}
              <div className="p-3.5 rounded-xl bg-[#4A2C17] border border-white/10 sm:col-span-2">
                <div className="flex justify-between items-center text-amber-200">
                  <span className="font-bold">5. Digital Products & Activations (25%)</span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded">Score: {formatPerformancePercentage(selectedEntity.weightedScores?.digitals || 0)}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[10px] text-gray-300">
                  <div>Mobile: <span className="font-bold text-white">{selectedEntity.actuals?.mobileBanking || 0}</span> ({formatPerformancePercentage(selectedEntity.achievements?.mobileBanking || 0)})</div>
                  <div>ATM Cards: <span className="font-bold text-white">{selectedEntity.actuals?.atm || 0}</span> ({formatPerformancePercentage(selectedEntity.achievements?.atm || 0)})</div>
                  <div>Merchants: <span className="font-bold text-white">{selectedEntity.actuals?.merchant || 0}</span> ({formatPerformancePercentage(selectedEntity.achievements?.merchant || 0)})</div>
                  <div>Internet: <span className="font-bold text-white">{selectedEntity.actuals?.internetBanking || 0}</span> ({formatPerformancePercentage(selectedEntity.achievements?.internetBanking || 0)})</div>
                </div>
              </div>

            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedEntity(null)}
                className="px-5 py-2.5 rounded-xl bg-[#C89A2B] text-[#3A1F0D] font-black text-xs hover:bg-[#D8B45C]"
              >
                Close Breakdown
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
