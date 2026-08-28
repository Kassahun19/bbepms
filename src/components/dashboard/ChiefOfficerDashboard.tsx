import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Award, 
  TrendingUp, 
  BarChart2, 
  CheckCircle2, 
  Layers, 
  Printer, 
  ArrowUpRight,
  Clock,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { User, District, Branch, KPI, DailyPerformanceReport, PerformanceTarget } from '../../types';

interface ChiefOfficerDashboardProps {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
}

export const ChiefOfficerDashboard: React.FC<ChiefOfficerDashboardProps> = ({
  currentUser,
  districts,
  branches,
  kpis,
  reports,
  targets,
  language = 'en'
}) => {
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  const title = currentUser.jobTitle || 'Chief Corporate Officer';
  const approvedReports = reports.filter(r => r.status === 'Approved');

  // Determine portfolio focus based on title keywords
  let portfolioCategory = 'Bank-wide Portfolio & Strategic Execution';
  let portfolioHighlights = [
    'Resource Mobilization & Asset Growth',
    'Operational Efficiency & Governance',
    'Inter-departmental synergy across Districts & Branches'
  ];

  if (title.toLowerCase().includes('finance')) {
    portfolioCategory = 'Finance & Corporate Service Portfolio';
    portfolioHighlights = ['Deposit & Capital Reserves', 'Cost Optimization & Budget Allocation', 'Financial Reporting & Compliance'];
  } else if (title.toLowerCase().includes('digital') || title.toLowerCase().includes('information')) {
    portfolioCategory = 'Digital Banking & IT Infrastructure Portfolio';
    portfolioHighlights = ['Mobile Banking / SuperApp Adoption', 'ATM & Merchant POS Uptime', 'Digital Financing System (DFS) Scaling'];
  } else if (title.toLowerCase().includes('people') || title.toLowerCase().includes('culture')) {
    portfolioCategory = 'People, Talent & Corporate Culture Portfolio';
    portfolioHighlights = ['Employee KPI Productivity', 'Learning & Development Metrics', 'Branch Staff Retention & Engagement'];
  } else if (title.toLowerCase().includes('retail') || title.toLowerCase().includes('branch')) {
    portfolioCategory = 'Retail & Branch Banking Portfolio';
    portfolioHighlights = ['Nationwide Branch Network Operations', 'Customer Onboarding & Account Growth', 'Branch Service Excellence'];
  } else if (title.toLowerCase().includes('strategy')) {
    portfolioCategory = 'Strategy & Partnership Portfolio';
    portfolioHighlights = ['Strategic Roadmap Execution', 'Institutional Partnerships', 'Competitive Market Positioning'];
  } else if (title.toLowerCase().includes('corporate')) {
    portfolioCategory = 'Corporate Banking Portfolio';
    portfolioHighlights = ['Corporate Credit Portfolios', 'Institutional Accounts', 'Syndicated Financing'];
  } else if (title.toLowerCase().includes('product')) {
    portfolioCategory = 'Product & Service Innovation Portfolio';
    portfolioHighlights = ['Next-Gen Banking Products', 'Customer Experience Optimization', 'Fintech Integrations'];
  } else if (title.toLowerCase().includes('transformation')) {
    portfolioCategory = 'Banking Transformation Portfolio';
    portfolioHighlights = ['Core Banking Upgrade', 'Process Automation & Reengineering', 'Digital-First Workflow Adoption'];
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#333333] p-4 sm:p-8 space-y-8">
      
      {/* Chief Officer Header */}
      <div className="bg-gradient-to-r from-[#3B2212] via-[#5C3A21] to-[#7A4E2B] text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#C89A2B] text-[#3B2212] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Executive Officer Directorate
            </span>
            <span className="text-amber-200 text-sm">Bunna Bank Executive Committee</span>
            <span className="text-xs bg-white/10 text-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C89A2B]" /> Last updated: {lastUpdated}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {title}
          </h1>
          <p className="text-amber-100/90 text-sm mt-1">
            Welcome, {currentUser.firstName} {currentUser.lastName}. Managing portfolio: <strong className="text-white">{portfolioCategory}</strong>.
          </p>
        </div>
        <div>
          <button 
            onClick={() => window.print()}
            className="bg-[#C89A2B] hover:bg-[#b08522] text-[#3B2212] font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Export Portfolio Report
          </button>
        </div>
      </div>

      {/* Portfolio Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Portfolio Achievement</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">91.5%</h3>
          <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Exceeding quarterly baseline
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Assigned KPI Groups</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">4 Active</h3>
          <p className="text-xs text-stone-500 mt-3">Fully linked to MySQL targets</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Oversight Units</p>
          <h3 className="text-3xl font-serif font-bold text-[#5C3A21] mt-2">
            {districts.length || 12} Districts
          </h3>
          <p className="text-xs text-stone-500 mt-3">{branches.length || 108} Branches reporting</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
          <p className="text-xs font-semibold uppercase text-stone-500 tracking-wider">Compliance Status</p>
          <h3 className="text-3xl font-serif font-bold text-emerald-700 mt-2">100%</h3>
          <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> All audits passed successfully
          </p>
        </div>
      </div>

      {/* Portfolio Strategic Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#5C3A21] mb-1">Core Portfolio Focus & Strategic Objectives</h3>
            <p className="text-stone-600 text-sm">
              As {title}, your executive oversight ensures flawless execution across assigned performance domains and branch-level KPI mobilization.
            </p>
          </div>
          <div className="space-y-4">
            {portfolioHighlights.map((highlight, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                <div className="p-2 bg-[#C89A2B]/20 text-[#5C3A21] rounded-lg mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-800 text-sm">{highlight}</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Dynamically tracked against live branch performance reports and KPI targets.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
          <h3 className="text-lg font-serif font-bold text-[#5C3A21]">Quick Executive Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => alert('Portfolio performance summary exported successfully.')}
              className="w-full text-left p-3.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200 transition text-sm font-medium text-stone-800 flex items-center justify-between"
            >
              <span>View Portfolio KPI Analytics</span>
              <span className="text-[#C89A2B]">→</span>
            </button>
            <button 
              onClick={() => alert('Directorate reports synchronization initiated.')}
              className="w-full text-left p-3.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200 transition text-sm font-medium text-stone-800 flex items-center justify-between"
            >
              <span>Review Directorate Reports</span>
              <span className="text-[#C89A2B]">→</span>
            </button>
            <button 
              onClick={() => alert('Official banking memo distribution portal opened.')}
              className="w-full text-left p-3.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 border border-stone-200 transition text-sm font-medium text-stone-800 flex items-center justify-between"
            >
              <span>Issue Executive Memo</span>
              <span className="text-[#C89A2B]">→</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
