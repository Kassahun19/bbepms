import React, { useMemo } from 'react';
import { Building, X, Users, Target, Activity, CheckCircle2, TrendingUp, BarChart3, ChevronRight } from 'lucide-react';
import { Branch, User, DailyPerformanceReport, KPI, PerformanceTarget } from '../../types';

interface Props {
  branch: Branch;
  onClose: () => void;
  users: User[];
  reports: DailyPerformanceReport[];
  kpis: KPI[];
  targets: PerformanceTarget[];
}

export const BranchPerformanceDetailsModal: React.FC<Props> = ({
  branch,
  onClose,
  users,
  reports,
  kpis,
  targets
}) => {
  const branchUsers = useMemo(() => users.filter(u => u.branchId === branch.id), [users, branch.id]);
  const activeEmployees = useMemo(() => branchUsers.filter(u => u.status === 'Active' && u.role === 'EMPLOYEE'), [branchUsers]);
  const manager = branchUsers.find(u => u.role === 'MANAGER');

  const branchReports = useMemo(() => reports.filter(r => r.branchId === branch.id && r.status === 'Approved'), [reports, branch.id]);
  const branchTargets = useMemo(() => targets.filter(t => t.branchId === branch.id), [targets, branch.id]);

  // Aggregate stats
  const stats = useMemo(() => {
    let totalTarget = 0;
    let totalAchieved = 0;
    
    // Group reports by KPI
    const kpiStats: Record<string, { achieved: number, target: number, name: string }> = {};

    branchTargets.forEach(t => {
      totalTarget += t.targetValue;
      if (!kpiStats[t.kpiId]) {
        const kpi = kpis.find(k => k.id === t.kpiId);
        kpiStats[t.kpiId] = { achieved: 0, target: t.targetValue, name: kpi?.name || 'Unknown KPI' };
      } else {
        kpiStats[t.kpiId].target += t.targetValue;
      }
    });

    branchReports.forEach(r => {
      totalAchieved += r.actualValue;
      if (kpiStats[r.kpiId]) {
        kpiStats[r.kpiId].achieved += r.actualValue;
      }
    });

    const completionPercent = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;
    
    // Time-based aggregation
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    const semiAnnualAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    
    let dailyAchieved = 0, weeklyAchieved = 0, monthlyAchieved = 0, semiAnnualAchieved = 0, annualAchieved = totalAchieved;

    branchReports.forEach(r => {
      if (r.date === todayStr) dailyAchieved += r.actualValue;
      if (r.date >= oneWeekAgo) weeklyAchieved += r.actualValue;
      if (r.date >= oneMonthAgo) monthlyAchieved += r.actualValue;
      if (r.date >= semiAnnualAgo) semiAnnualAchieved += r.actualValue;
    });

    return {
      totalTarget,
      totalAchieved,
      completionPercent,
      kpiStats: Object.values(kpiStats),
      dailyAchieved,
      weeklyAchieved,
      monthlyAchieved,
      semiAnnualAchieved,
      annualAchieved
    };
  }, [branchReports, branchTargets, kpis]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto pt-10">
      <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-3xl w-full max-w-4xl text-white shadow-2xl mb-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#6B3F1D] to-[#4A2C17] p-6 border-b border-white/10 relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C89A2B] to-[#6B3F1D] p-1 shadow-lg">
              <div className="w-full h-full bg-[#6B3F1D] rounded-xl flex items-center justify-center">
                <Building className="w-8 h-8 text-[#C89A2B]" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">{branch.name}</h2>
              <div className="flex items-center space-x-3 text-sm text-gray-300 mt-1">
                <span className="font-mono text-[#C89A2B]">SOL ID: {branch.solId || branch.code}</span>
                <span>•</span>
                <span>{branch.districtName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Top Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#6B3F1D]/50 border border-white/10 rounded-2xl p-4 flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Employees</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-white">{branchUsers.length}</span>
                  <span className="text-xs text-gray-400">({activeEmployees.length} Active)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#6B3F1D]/50 border border-white/10 rounded-2xl p-4 flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Branch Manager</p>
                <p className="text-sm font-bold text-white mt-1 line-clamp-1">
                  {manager ? `${manager.firstName} ${manager.middleName || manager.lastName}` : 'Not Assigned'}
                </p>
              </div>
            </div>

            <div className="bg-[#6B3F1D]/50 border border-white/10 rounded-2xl p-4 flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Overall Perf.</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-white">{stats.completionPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time-Based Performance */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#C89A2B] mb-4 flex items-center"><TrendingUp className="w-4 h-4 mr-2" /> Performance Timeline</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: 'Daily', value: stats.dailyAchieved },
                { label: 'Weekly', value: stats.weeklyAchieved },
                { label: 'Monthly', value: stats.monthlyAchieved },
                { label: 'Semi-Annual', value: stats.semiAnnualAchieved },
                { label: 'Annual', value: stats.annualAchieved },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 bg-black/20 rounded-xl border border-white/5">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-lg font-black text-emerald-400">{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#C89A2B] flex items-center"><BarChart3 className="w-4 h-4 mr-2" /> KPI Achievements</h3>
            
            {stats.kpiStats.length === 0 ? (
              <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/10 text-gray-400 text-sm">
                No targets or reports available for this branch yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {stats.kpiStats.map((kpi, i) => {
                  const percent = kpi.target > 0 ? (kpi.achieved / kpi.target) * 100 : 0;
                  return (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-bold text-white">{kpi.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Target: <span className="text-white">{kpi.target.toLocaleString()}</span> • Achieved: <span className="text-emerald-400">{kpi.achieved.toLocaleString()}</span>
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-black text-[#C89A2B]">{percent.toFixed(1)}%</span>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#C89A2B] to-emerald-400 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
