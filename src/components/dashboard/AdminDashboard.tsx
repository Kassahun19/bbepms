import { BranchPerformanceDetailsModal } from './BranchPerformanceDetailsModal';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Building2,
  Building,
  MapPin,
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Sparkles,
  BarChart2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Settings,
  Bell,
  Search,
  MessageSquare,
  UserCheck,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Filter,
  ArrowUpDown,
  Phone,
  Printer,
  Upload,
  Check,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { downloadBranchesCSV, downloadBranchesExcel, printOrDownloadBranchesPDF } from '../../utils/exportUtils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { User, District, Branch, KPI, DailyPerformanceReport, AuditLog, BankHoliday, PerformanceTarget, getUserFullName, KpiGroup } from '../../types';
import { AllProductsOverview } from './AllProductsOverview';
import { BranchCampaignWidget } from './BranchCampaignWidget';
import { CompetitorIntelligenceModule } from '../competitor/CompetitorIntelligenceModule';
import { AdminPerformanceRankingDashboard } from './AdminPerformanceRankingDashboard';
import { BankDocumentsManagementPanel } from './BankDocumentsManagementPanel';

export interface KpiPresetOption {
  code: string;
  name: string;
  category: KpiGroup;
  defaultWeight: number;
  unit: KPI['unit'];
  description: string;
}

export const KPI_CATALOG_BY_GROUP: Record<KpiGroup, KpiPresetOption[]> = {
  Finance: [
    {
      code: 'KPI-DEP',
      name: 'Deposit Mobilization',
      category: 'Finance',
      defaultWeight: 20,
      unit: 'ETB',
      description: 'Total deposit mobilization target achievement including Demand, Savings, and Fixed Time Deposits (20% weight).'
    },
    {
      code: 'KPI-FCY',
      name: 'Foreign Currency Generation (FCY)',
      category: 'Finance',
      defaultWeight: 15,
      unit: 'ETB',
      description: 'Foreign Currency generation, exports trade finance, and remittance inflow mobilization (15% weight).'
    },
    {
      code: 'KPI-DFS',
      name: 'Digital Financing System (DFS)',
      category: 'Finance',
      defaultWeight: 20,
      unit: 'ETB',
      description: 'Digital loan disbursements, micro-advances, and DFS credit portfolio mobilization (20% weight).'
    },
    {
      code: 'KPI-LOAN',
      name: 'Gross Loan & Advance Portfolio',
      category: 'Finance',
      defaultWeight: 15,
      unit: 'ETB',
      description: 'Quality loan disbursements, SME financing, retail credit & advances portfolio growth (15% weight).'
    },
    {
      code: 'KPI-NII',
      name: 'Non-Interest Income & Commissions',
      category: 'Finance',
      defaultWeight: 10,
      unit: 'ETB',
      description: 'Service fees, letter of credit/guarantee commissions, and transaction charges (10% weight).'
    },
    {
      code: 'KPI-NPL',
      name: 'NPL Recovery & Loan Quality',
      category: 'Finance',
      defaultWeight: 10,
      unit: 'ETB',
      description: 'Non-performing loan recovery, overdue collections, and credit risk mitigation (10% weight).'
    }
  ],
  Stakeholder: [
    {
      code: 'KPI-CUST',
      name: 'Customer Base & Account Openings',
      category: 'Stakeholder',
      defaultWeight: 20,
      unit: 'Count',
      description: 'New customer onboarding, individual savings accounts, and active account growth (20% weight).'
    },
    {
      code: 'KPI-CSQ',
      name: 'Customer Service Quality & NPS',
      category: 'Stakeholder',
      defaultWeight: 15,
      unit: 'Percentage',
      description: 'Net Promoter Score (NPS), customer satisfaction index, and branch wait time reduction (15% weight).'
    },
    {
      code: 'KPI-CRR',
      name: 'Customer Retention & Reactivation',
      category: 'Stakeholder',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Reactivation of dormant/inactive accounts and high-value customer relationship retention (10% weight).'
    },
    {
      code: 'KPI-CORP',
      name: 'Corporate & Institutional Partnerships',
      category: 'Stakeholder',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Corporate payroll accounts, institutional partnerships, NGOs, and cooperative alliances (10% weight).'
    }
  ],
  'Internal Business': [
    {
      code: 'KPI-DIG',
      name: 'Digitals (Mobile, ATM, Merchant, Internet)',
      category: 'Internal Business',
      defaultWeight: 25,
      unit: 'Count',
      description: 'Digital banking activations including Mobile Banking, ATMs, Merchant POS & Internet Banking (25% weight).'
    },
    {
      code: 'KPI-MB',
      name: 'Mobile Banking Activations',
      category: 'Internal Business',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Bunna Mobile banking app & USSD user registrations and active digital transactions (10% weight).'
    },
    {
      code: 'KPI-ATM',
      name: 'ATM & Debit Card Issuance',
      category: 'Internal Business',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Bunna Card/Debit card issuance, PIN activations, and ATM cardholder onboarding (10% weight).'
    },
    {
      code: 'KPI-POS',
      name: 'Merchant POS & QR Code Onboarding',
      category: 'Internal Business',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Merchant POS terminal deployment, QR code payment onboarding, and merchant digital volume (10% weight).'
    },
    {
      code: 'KPI-IB',
      name: 'Internet Banking Registrations',
      category: 'Internal Business',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Corporate & retail Internet Banking enrollments and active digital workflow utilization (10% weight).'
    },
    {
      code: 'KPI-OPS',
      name: 'Operational Efficiency & Audit Compliance',
      category: 'Internal Business',
      defaultWeight: 15,
      unit: 'Percentage',
      description: 'Zero cash discrepancies, branch operational compliance, AML/KYC adherence, and audit scores (15% weight).'
    }
  ],
  'Learning & Growth': [
    {
      code: 'KPI-TRN',
      name: 'Staff Training & Skill Development',
      category: 'Learning & Growth',
      defaultWeight: 15,
      unit: 'Count',
      description: 'Mandatory banking compliance hours, product mastery, and professional certification completion (15% weight).'
    },
    {
      code: 'KPI-STAFF',
      name: 'Staff Performance & Appraisal Score',
      category: 'Learning & Growth',
      defaultWeight: 15,
      unit: 'Percentage',
      description: 'Individual employee target achievement rate, performance appraisal score, and supervisor rating (15% weight).'
    },
    {
      code: 'KPI-INNOV',
      name: 'Innovation & Process Optimization',
      category: 'Learning & Growth',
      defaultWeight: 10,
      unit: 'Count',
      description: 'Kaizen process improvement suggestions, digital idea submissions, and operational streamlining (10% weight).'
    },
    {
      code: 'KPI-ENG',
      name: 'Employee Engagement & Retention',
      category: 'Learning & Growth',
      defaultWeight: 10,
      unit: 'Percentage',
      description: 'Staff retention index, team engagement surveys, and branch workplace excellence (10% weight).'
    }
  ]
};

const KPI_GROUPS_LIST: { value: KpiGroup; label: string; description: string }[] = [
  {
    value: 'Finance',
    label: 'Finance',
    description: 'Financial & Balance Sheet Metrics (Deposits, Loans, FX, Capital, Yields)'
  },
  {
    value: 'Stakeholder',
    label: 'Stakeholder',
    description: 'Customer & Stakeholder Relations (Service Quality, NPS, Accounts, Retention)'
  },
  {
    value: 'Internal Business',
    label: 'Internal Business',
    description: 'Internal Business Processes (Digital Banking, Mobile/ATM Activations, Operations)'
  },
  {
    value: 'Learning & Growth',
    label: 'Learning & Growth',
    description: 'Organizational & Human Capital (Staff Training, Skill Competency, Retention)'
  }
];

interface KpiGroupDropdownProps {
  value: KpiGroup | undefined;
  onChange: (val: KpiGroup) => void;
}

const KpiGroupDropdown: React.FC<KpiGroupDropdownProps> = ({ value, onChange }) => {
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

  const selectedGroup = KPI_GROUPS_LIST.find(g => g.value === value) || (value ? undefined : null);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        id="kpi-group-dropdown-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 hover:border-[#C89A2B]/70 text-xs text-white flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-[#C89A2B] shadow-inner cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedGroup ? (
            <span className="font-bold text-white text-xs tracking-wide">{selectedGroup.label}</span>
          ) : (
            <span className="text-gray-400 text-xs italic">Select a KPI Group...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#C89A2B] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="kpi-group-dropdown-menu"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#351C0C] border border-[#C89A2B]/60 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex flex-col space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          {KPI_GROUPS_LIST.map((group) => {
            const isSelected = group.value === value;
            return (
              <button
                key={group.value}
                id={`kpi-group-option-${group.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                type="button"
                onClick={() => {
                  onChange(group.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C89A2B]/25 border border-[#C89A2B]/50 text-white shadow-sm'
                    : 'bg-black/25 hover:bg-[#4A2C17] border border-white/5 text-gray-200 hover:text-white'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#C89A2B]' : 'text-white'}`}>
                      {group.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-tight">
                    {group.description}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#C89A2B] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface KpiNameDropdownProps {
  category: KpiGroup | undefined;
  value: string;
  onChangePreset: (preset: KpiPresetOption) => void;
  onCustomInput: (name: string) => void;
}

const KpiNameDropdown: React.FC<KpiNameDropdownProps> = ({ category, value, onChangePreset, onCustomInput }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomEditing, setIsCustomEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableOptions = category ? KPI_CATALOG_BY_GROUP[category] || [] : [];
  const selectedPreset = availableOptions.find(opt => opt.name === value);

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

  // If no group is selected, remain disabled as requested
  if (!category) {
    return (
      <div className="relative w-full">
        <button
          type="button"
          disabled
          id="kpi-name-disabled-trigger"
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17]/40 border border-white/10 text-xs text-gray-400 flex items-center justify-between cursor-not-allowed opacity-60"
        >
          <span className="italic">Disabled — Please select a KPI Group first</span>
          <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
        </button>
      </div>
    );
  }

  if (isCustomEditing) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onCustomInput(e.target.value)}
            placeholder="Type custom KPI indicator name..."
            className="w-full px-3.5 py-2 rounded-xl bg-[#4A2C17] border border-[#C89A2B]/60 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C89A2B]"
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setIsCustomEditing(false)}
            className="px-2.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] text-[#C89A2B] font-semibold whitespace-nowrap cursor-pointer"
          >
            Presets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        id="kpi-name-dropdown-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 hover:border-[#C89A2B]/70 text-xs text-white flex items-center justify-between transition-all focus:outline-none focus:ring-1 focus:ring-[#C89A2B] shadow-inner cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2 truncate">
          {value ? (
            <span className="font-bold text-white text-xs truncate">{value}</span>
          ) : (
            <span className="text-gray-400 text-xs italic">Select {category} KPI Name...</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-[#C89A2B] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="kpi-name-dropdown-menu"
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#351C0C] border border-[#C89A2B]/60 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md max-h-64 overflow-y-auto space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
          role="listbox"
        >
          <div className="px-2.5 py-1 text-[10px] font-bold text-[#C89A2B] uppercase tracking-wider border-b border-white/10">
            Available {category} KPIs ({availableOptions.length})
          </div>

          {availableOptions.map((opt) => {
            const isSelected = opt.name === value;
            return (
              <button
                key={opt.code}
                id={`kpi-name-option-${opt.code.toLowerCase()}`}
                type="button"
                onClick={() => {
                  onChangePreset(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#C89A2B]/25 border border-[#C89A2B]/50 text-white shadow-sm'
                    : 'bg-black/25 hover:bg-[#4A2C17] border border-white/5 text-gray-200 hover:text-white'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[#C89A2B]' : 'text-white'}`}>
                      {opt.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-[#C89A2B] font-mono font-bold">
                      {opt.code}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 font-bold">
                      {opt.defaultWeight}%
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">
                    {opt.description}
                  </p>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#C89A2B] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}

          <div className="pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsCustomEditing(true);
                setIsOpen(false);
              }}
              className="w-full py-1.5 px-2 text-center rounded-lg bg-white/5 hover:bg-[#C89A2B]/20 text-[11px] text-[#C89A2B] font-semibold transition-colors cursor-pointer"
            >
              + Enter Custom Indicator Name
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdminDashboardProps {
  user: User;
  districts: District[];
  branches: Branch[];
  employees: User[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  auditLogs: AuditLog[];
  holidays: BankHoliday[];
  targets?: PerformanceTarget[];
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  onRefreshData: () => void;
  onOpenAiAssistant: () => void;
  onOpenExportModal: () => void;
  onOpenProfile?: () => void;
  onOpenAiSummary?: (employee: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  districts,
  branches,
  employees,
  kpis,
  reports,
  auditLogs,
  holidays,
  targets = [],
  activeTab: propActiveTab,
  onTabChange,
  onRefreshData,
  onOpenAiAssistant,
  onOpenExportModal,
  onOpenProfile,
  onOpenAiSummary
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'rankings' | 'products' | 'competitor' | 'districts' | 'branches' | 'employees' | 'kpis' | 'reports' | 'audit' | 'holidays' | 'fiscalYears' | 'documents'
  >((propActiveTab as any) || 'overview');

  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [currentFiscalYear, setCurrentFiscalYear] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isNewFyModalOpen, setIsNewFyModalOpen] = useState(false);
  const [newFyName, setNewFyName] = useState('');
  const [newFyStartDate, setNewFyStartDate] = useState('');
  const [newFyEndDate, setNewFyEndDate] = useState('');
  const [newFyStatus, setNewFyStatus] = useState<'ACTIVE' | 'CLOSED'>('CLOSED');

  React.useEffect(() => {
    loadFiscalYearsData();
  }, []);

  const loadFiscalYearsData = async () => {
    try {
      const fying = await api.getFiscalYears();
      setFiscalYears(fying);
      const curr = await api.getCurrentFiscalYear();
      setCurrentFiscalYear(curr);
      const comp = await api.getPerformanceComparison();
      setComparisonData(comp);
    } catch (e) {}
  };

  const handleActivateFy = async (id: string) => {
    try {
      await api.activateFiscalYear(id);
      showToast('Fiscal Year activated successfully.', 'success');
      loadFiscalYearsData();
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to activate fiscal year', 'error');
    }
  };

  const handleCloseFy = async (id: string) => {
    try {
      await api.closeFiscalYear(id);
      showToast('Fiscal Year closed successfully.', 'success');
      loadFiscalYearsData();
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to close fiscal year', 'error');
    }
  };

  const handleCreateFy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFyName || !newFyStartDate || !newFyEndDate) return;
    try {
      await api.createFiscalYear({
        name: newFyName,
        startDate: newFyStartDate,
        endDate: newFyEndDate,
        status: newFyStatus
      });
      setIsNewFyModalOpen(false);
      setNewFyName('');
      setNewFyStartDate('');
      setNewFyEndDate('');
      showToast('Fiscal Year created successfully.', 'success');
      loadFiscalYearsData();
      onRefreshData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create fiscal year', 'error');
    }
  };

  React.useEffect(() => {
    if (propActiveTab) {
      setActiveTab(propActiveTab as any);
    }
  }, [propActiveTab]);

  const handleTabSelect = (tabId: any) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Toast Notification Banners
  const [toastNotification, setToastNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastNotification({ type, message });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  // Branch Directory Table State: Search, Filter, Sort, Pagination
  const [branchSearch, setBranchSearch] = useState('');
  const [branchRegionFilter, setBranchRegionFilter] = useState('All');
  const [branchDistrictFilter, setBranchDistrictFilter] = useState('All');
  const [branchStatusFilter, setBranchStatusFilter] = useState('All');
  const [branchSortBy, setBranchSortBy] = useState<'solId' | 'name' | 'district'>('solId');
  const [branchSortOrder, setBranchSortOrder] = useState<'asc' | 'desc'>('asc');
  const [branchPage, setBranchPage] = useState(1);
  const [branchRowsPerPage, setBranchRowsPerPage] = useState(10);

  // District Roster Table State: Search, Filter, Pagination
  const [districtSearch, setDistrictSearch] = useState('');
  const [districtRegionFilter, setDistrictRegionFilter] = useState('All');
  const [districtPage, setDistrictPage] = useState(1);
  const [districtRowsPerPage, setDistrictRowsPerPage] = useState(10);

  // Modals for adding district and branch
  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictCode, setNewDistrictCode] = useState('');
  const [newDistrictRegion, setNewDistrictRegion] = useState('');
  const [newDistrictManager, setNewDistrictManager] = useState('');
  const [newDistrictType, setNewDistrictType] = useState<'District' | 'Area Office'>('District');

  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchDistrictId, setNewBranchDistrictId] = useState('');
  const [newBranchType, setNewBranchType] = useState('Grade I');
  const [newBranchLocation, setNewBranchLocation] = useState('');
  const [newBranchManager, setNewBranchManager] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchStatus, setNewBranchStatus] = useState<'Active' | 'Inactive'>('Active');

  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDistrictName || !newDistrictCode || !newDistrictRegion) return;
    try {
      const formattedName = newDistrictName.endsWith('District') 
        ? newDistrictName 
        : `${newDistrictName} District`;

      await api.createDistrict({
        name: formattedName,
        code: newDistrictCode.toUpperCase(),
        region: newDistrictRegion,
        managerName: newDistrictManager || 'Assigned Director',
        branchCount: 0,
        totalEmployees: 0
      });
      setIsAddDistrictModalOpen(false);
      setNewDistrictName('');
      setNewDistrictCode('');
      setNewDistrictRegion('');
      setNewDistrictManager('');
      showToast(`District / Area Office "${formattedName}" created successfully!`, 'success');
      onRefreshData();
    } catch (err) {
      showToast('Failed to create district', 'error');
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCode || !newBranchDistrictId) return;
    try {
      const dist = districts.find(d => d.id === newBranchDistrictId);
      await api.createBranch({
        solId: newBranchCode.toUpperCase(),
        districtId: newBranchDistrictId,
        districtName: dist?.name || '',
        region: dist?.region || 'Addis Ababa',
        name: newBranchName,
        code: newBranchCode.toUpperCase(),
        phone: newBranchPhone || '+251 11 800 0000',
        type: newBranchType,
        location: newBranchLocation || 'Main Commercial Area',
        managerName: newBranchManager || 'Branch Operations Manager',
        status: newBranchStatus,
        employeeCount: 0
      });
      setIsAddBranchModalOpen(false);
      setNewBranchName('');
      setNewBranchCode('');
      setNewBranchDistrictId('');
      setNewBranchLocation('');
      setNewBranchManager('');
      setNewBranchPhone('');
      setNewBranchStatus('Active');
      showToast(`Branch "${newBranchName}" (Sol ID: ${newBranchCode.toUpperCase()}) added successfully!`, 'success');
      onRefreshData();
    } catch (err) {
      showToast('Failed to create branch', 'error');
    }
  };

  // Action Modals State
  const [viewingDistrict, setViewingDistrict] = useState<District | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);

  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [viewingEmployee, setViewingEmployee] = useState<User | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);

  const [viewingReport, setViewingReport] = useState<DailyPerformanceReport | null>(null);
  const [editingKpi, setEditingKpi] = useState<KPI | null>(null);
  const [editingHoliday, setEditingHoliday] = useState<BankHoliday | null>(null);

  // District Handlers
  const handleUpdateDistrictSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDistrict) return;
    try {
      await api.updateDistrict(editingDistrict.id, editingDistrict);
      showToast(`District "${editingDistrict.name}" updated successfully!`, 'success');
      setEditingDistrict(null);
      onRefreshData();
    } catch (err) {
      showToast('Failed to update district', 'error');
    }
  };

  const handleDeleteDistrict = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete district "${name}"?`)) {
      try {
        await api.deleteDistrict(id);
        showToast(`District "${name}" has been deleted.`, 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete district', 'error');
      }
    }
  };

  // Branch Handlers
  const handleUpdateBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    try {
      await api.updateBranch(editingBranch.id, editingBranch);
      showToast(`Branch "${editingBranch.name}" updated successfully!`, 'success');
      setEditingBranch(null);
      onRefreshData();
    } catch (err) {
      showToast('Failed to update branch', 'error');
    }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete branch "${name}"?`)) {
      try {
        await api.deleteBranch(id);
        showToast(`Branch "${name}" deleted successfully.`, 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete branch', 'error');
      }
    }
  };

  // Employee Handlers
  const handleUpdateEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    try {
      await api.updateEmployee(editingEmployee.id, editingEmployee);
      showToast(`User profile for "${getUserFullName(editingEmployee)}" updated successfully!`, 'success');
      setEditingEmployee(null);
      onRefreshData();
    } catch (err) {
      showToast('Failed to update user profile', 'error');
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove user "${name}"? This record will be permanently deleted.`)) {
      try {
        await api.deleteEmployee(id);
        showToast(`User "${name}" has been removed.`, 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete user', 'error');
      }
    }
  };

  // KPI Handlers
  const handleUpdateKpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKpi || !editingKpi.name || !editingKpi.code) {
      showToast('Please provide both KPI Group, KPI Name, and KPI Code', 'error');
      return;
    }
    try {
      const exists = kpis.some(k => k.id === editingKpi.id);
      if (exists) {
        await api.updateKPI(editingKpi.id, editingKpi);
        showToast(`KPI indicator "${editingKpi.name}" updated successfully!`, 'success');
      } else {
        await api.createKPI(editingKpi);
        showToast(`KPI indicator "${editingKpi.name}" configured & added successfully!`, 'success');
      }
      setEditingKpi(null);
      onRefreshData();
    } catch (err) {
      showToast('Failed to save KPI configuration', 'error');
    }
  };

  const handleDeleteKpi = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete KPI "${name}"? This record will be permanently removed.`)) {
      try {
        await api.deleteKPI(id);
        showToast(`KPI "${name}" deleted.`, 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete KPI', 'error');
      }
    }
  };

  // Report Handler
  const handleDeleteReport = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this performance report entry? This action cannot be undone.')) {
      try {
        await api.deleteReport(id);
        showToast('Performance report entry deleted.', 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete report', 'error');
      }
    }
  };

  // Holiday Handlers
  const handleUpdateHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHoliday) return;
    try {
      await api.updateHoliday(editingHoliday.id, editingHoliday);
      showToast(`Bank holiday "${editingHoliday.name}" updated!`, 'success');
      setEditingHoliday(null);
      onRefreshData();
    } catch (err) {
      showToast('Failed to update bank holiday', 'error');
    }
  };

  const handleDeleteHoliday = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove bank holiday "${name}"?`)) {
      try {
        await api.deleteHoliday(id);
        showToast(`Holiday "${name}" removed successfully.`, 'info');
        onRefreshData();
      } catch (err) {
        showToast('Failed to delete holiday', 'error');
      }
    }
  };

  // Derived Regions & Parent Offices for Branch Filters
  const uniqueRegions = useMemo(() => {
    const regSet = new Set<string>();
    branches.forEach(b => { if (b.region) regSet.add(b.region); });
    districts.forEach(d => { if (d.region) regSet.add(d.region); });
    return Array.from(regSet).sort();
  }, [branches, districts]);

  // Filtered & Sorted Branches
  const filteredBranches = useMemo(() => {
    return branches.filter(b => {
      const q = (branchSearch || '').toLowerCase();
      const matchesSearch =
        !branchSearch ||
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.solId && b.solId.toLowerCase().includes(q)) ||
        (b.code && b.code.toLowerCase().includes(q)) ||
        (b.districtName && b.districtName.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.location && b.location.toLowerCase().includes(q));

      const matchesRegion = branchRegionFilter === 'All' || b.region === branchRegionFilter;
      const matchesDistrict = branchDistrictFilter === 'All' || b.districtId === branchDistrictFilter || b.districtName === branchDistrictFilter;
      const matchesStatus = branchStatusFilter === 'All' || (b.status || 'Active') === branchStatusFilter;

      return matchesSearch && matchesRegion && matchesDistrict && matchesStatus;
    }).sort((a, b) => {
      let valA = '';
      let valB = '';
      if (branchSortBy === 'solId') {
        valA = a.solId || a.code || '';
        valB = b.solId || b.code || '';
      } else if (branchSortBy === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else {
        valA = a.districtName || '';
        valB = b.districtName || '';
      }
      return branchSortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  }, [branches, branchSearch, branchRegionFilter, branchDistrictFilter, branchStatusFilter, branchSortBy, branchSortOrder]);

  const totalBranchPages = Math.ceil(filteredBranches.length / branchRowsPerPage) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (branchPage - 1) * branchRowsPerPage;
    return filteredBranches.slice(start, start + branchRowsPerPage);
  }, [filteredBranches, branchPage, branchRowsPerPage]);

  // Filtered & Paginated Districts
  const filteredDistricts = useMemo(() => {
    const q = (districtSearch || '').toLowerCase();
    return districts.filter(d => {
      const matchesSearch =
        !districtSearch ||
        (d.name && d.name.toLowerCase().includes(q)) ||
        (d.code && d.code.toLowerCase().includes(q)) ||
        (d.solId && d.solId.toLowerCase().includes(q)) ||
        (d.region && d.region.toLowerCase().includes(q));

      const matchesRegion = districtRegionFilter === 'All' || d.region === districtRegionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [districts, districtSearch, districtRegionFilter]);

  const totalDistrictPages = Math.ceil(filteredDistricts.length / districtRowsPerPage) || 1;
  const paginatedDistricts = useMemo(() => {
    const start = (districtPage - 1) * districtRowsPerPage;
    return filteredDistricts.slice(start, start + districtRowsPerPage);
  }, [filteredDistricts, districtPage, districtRowsPerPage]);

  // Sample Chart Data
  const trendData = [
    { month: 'Jan', deposits: 120, digital: 850 },
    { month: 'Feb', deposits: 145, digital: 980 },
    { month: 'Mar', deposits: 160, digital: 1120 },
    { month: 'Apr', deposits: 180, digital: 1300 },
    { month: 'May', deposits: 210, digital: 1450 },
    { month: 'Jun', deposits: 240, digital: 1680 },
    { month: 'Jul', deposits: 290, digital: 1950 }
  ];

  const districtPerformanceData = districts.map(d => ({
    name: d.code,
    branches: d.branchCount,
    employees: d.totalEmployees
  }));

  const COLORS = ['#C89A2B', '#6B3F1D', '#10B981', '#3B82F6', '#F59E0B'];

  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const rejectedCount = reports.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-8">
      
      {/* Top Banner / Welcome Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#362011] border border-[#C89A2B]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-[#C89A2B] text-[#6B3F1D] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Administrator Console
            </span>
            <span className="text-xs text-gray-300">Bunna Bank S.C. HQ</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white mt-1">
            Welcome, {getUserFullName(user)}
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            Enterprise Performance Monitoring, District Governance, & AI Analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-2.5 rounded-xl bg-[#4A2C17] hover:bg-white/10 border border-[#C89A2B]/40 text-xs font-bold flex items-center space-x-2 text-[#C89A2B]"
            >
              <UserCheck className="w-4 h-4 text-[#C89A2B]" />
              <span>My Role Profile</span>
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center space-x-2 text-white"
          >
            <Download className="w-4 h-4 text-[#C89A2B]" />
            <span>Export Reports</span>
          </button>

          <button
            onClick={onOpenAiAssistant}
            className="px-5 py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs shadow-lg hover:bg-[#D8B45C] flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#6B3F1D]" />
            <span>AI Insights Engine</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {toastNotification && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-xl animate-fade-in ${
          toastNotification.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : toastNotification.type === 'error'
            ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
        }`}>
          <div className="flex items-center space-x-2.5">
            {toastNotification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toastNotification.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-cyan-400 shrink-0" />
            )}
            <span>{toastNotification.message}</span>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-white/10 text-xs font-bold text-gray-300">
        {[
          { id: 'overview', label: 'Executive Dashboard' },
          { id: 'rankings', label: 'Performance Rankings' },
          { id: 'competitor', label: 'Competitor Intelligence' },
          { id: 'products', label: 'All Products Performance' },
          { id: 'districts', label: 'Districts' },
          { id: 'branches', label: 'Branches' },
          { id: 'employees', label: 'Employee Roster' },
          { id: 'kpis', label: 'KPI Management' },
          { id: 'reports', label: 'Daily Reports' },
          { id: 'holidays', label: 'Bank Holidays' },
          { id: 'audit', label: 'System Audit Logs' },
          { id: 'fiscalYears', label: 'Fiscal Year & YoY' },
          { id: 'documents', label: 'Bank Documents' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSelect(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#C89A2B] text-[#6B3F1D] shadow-md font-extrabold'
                : 'bg-[#4A2C17] hover:bg-white/5 border border-white/10 text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB FOR FISCAL YEAR MANAGEMENT */}
      {activeTab === 'fiscalYears' && (
        <div className="space-y-6">
          <div className="bg-[#4A2C17]/80 backdrop-blur-md rounded-2xl p-6 border border-[#C89A2B]/30 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <CalendarIcon className="w-6 h-6 text-[#C89A2B]" />
                  <span>Fiscal Year Management & Year-over-Year (YoY) Analytics</span>
                </h3>
                <p className="text-xs text-gray-300 mt-1">
                  Bunna Bank Fiscal Year runs strictly from July 1 to June 30 of the following year. New fiscal years start from zero KPI achievements while preserving historical data as read-only.
                </p>
              </div>
              <button
                onClick={() => setIsNewFyModalOpen(true)}
                className="px-4 py-2.5 bg-[#C89A2B] text-[#6B3F1D] rounded-xl font-bold text-xs flex items-center space-x-2 shadow-lg hover:bg-[#D8B45C] transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Fiscal Year</span>
              </button>
            </div>

            {/* YoY Summary Cards */}
            {comparisonData && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                <div className="bg-[#3A2211] rounded-xl p-5 border border-white/10 shadow-md">
                  <span className="text-xs font-semibold text-gray-400">Current Active FY</span>
                  <div className="text-xl font-bold text-[#C89A2B] mt-1">{comparisonData.currentFyName}</div>
                  <span className="text-[10px] text-emerald-400 flex items-center mt-1">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Active & Accepting Reports
                  </span>
                </div>
                <div className="bg-[#3A2211] rounded-xl p-5 border border-white/10 shadow-md">
                  <span className="text-xs font-semibold text-gray-400">Previous Fiscal Year</span>
                  <div className="text-xl font-bold text-gray-200 mt-1">{comparisonData.previousFyName}</div>
                  <span className="text-[10px] text-gray-400 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" /> Archived (Read-Only)
                  </span>
                </div>
                <div className="bg-[#3A2211] rounded-xl p-5 border border-white/10 shadow-md">
                  <span className="text-xs font-semibold text-gray-400">Deposit YoY Growth</span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                    {comparisonData.depositsGrowthPct >= 0 ? `+${comparisonData.depositsGrowthPct}%` : `${comparisonData.depositsGrowthPct}%`}
                  </div>
                  <span className="text-[10px] text-gray-300 mt-1">
                    Current: ETB {comparisonData.depositsCurrent.toLocaleString()} vs Prev: ETB {comparisonData.depositsPrevious.toLocaleString()}
                  </span>
                </div>
                <div className="bg-[#3A2211] rounded-xl p-5 border border-white/10 shadow-md">
                  <span className="text-xs font-semibold text-gray-400">Approved Reports (Current FY)</span>
                  <div className="text-2xl font-extrabold text-cyan-400 mt-1">{comparisonData.reportsCurrent}</div>
                  <span className="text-[10px] text-gray-300 mt-1">Previous FY: {comparisonData.reportsPrevious} reports</span>
                </div>
              </div>
            )}

            {/* Fiscal Years Table */}
            <div className="mt-8">
              <h4 className="text-sm font-bold text-white mb-4">All Fiscal Years Roster</h4>
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left text-xs text-gray-200">
                  <thead className="bg-[#3A2211] text-gray-300 border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 font-bold">Fiscal Year ID</th>
                      <th className="px-4 py-3 font-bold">Fiscal Year Name</th>
                      <th className="px-4 py-3 font-bold">Start Date</th>
                      <th className="px-4 py-3 font-bold">End Date</th>
                      <th className="px-4 py-3 font-bold">Status</th>
                      <th className="px-4 py-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#4A2C17]/40">
                    {fiscalYears.map((fy: any) => {
                      const isActive = fy.isActive || fy.is_active === 1 || fy.status === 'ACTIVE';
                      return (
                        <tr key={fy.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 font-mono font-bold text-[#C89A2B]">{fy.id}</td>
                          <td className="px-4 py-3 font-bold text-white">{fy.name}</td>
                          <td className="px-4 py-3">{fy.startDate}</td>
                          <td className="px-4 py-3">{fy.endDate}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-gray-500/20 text-gray-300 border border-gray-500/40'
                            }`}>
                              {isActive ? 'ACTIVE' : 'CLOSED (READ-ONLY)'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            {!isActive && (
                              <button
                                onClick={() => handleActivateFy(fy.id)}
                                className="px-3 py-1.5 bg-[#C89A2B] text-[#6B3F1D] font-bold rounded-lg text-[10px] hover:bg-[#D8B45C]"
                              >
                                Activate FY
                              </button>
                            )}
                            {isActive && (
                              <button
                                onClick={() => handleCloseFy(fy.id)}
                                className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold rounded-lg text-[10px] hover:bg-rose-500/30"
                              >
                                Close FY & Archive
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* New Fiscal Year Modal */}
          {isNewFyModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#4A2C17] border border-[#C89A2B]/40 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-[#C89A2B]" />
                    <span>Create New Fiscal Year</span>
                  </h3>
                  <button onClick={() => setIsNewFyModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-gray-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateFy} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Fiscal Year Name (e.g. FY 2027/28)</label>
                    <input
                      type="text"
                      value={newFyName}
                      onChange={(e) => setNewFyName(e.target.value)}
                      placeholder="FY 2027/28"
                      className="w-full px-3 py-2 rounded-xl bg-[#3A2211] border border-white/20 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Start Date (Must be July 1)</label>
                    <input
                      type="date"
                      value={newFyStartDate}
                      onChange={(e) => setNewFyStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#3A2211] border border-white/20 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">End Date (Must be June 30)</label>
                    <input
                      type="date"
                      value={newFyEndDate}
                      onChange={(e) => setNewFyEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#3A2211] border border-white/20 text-xs text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Initial Status</label>
                    <select
                      value={newFyStatus}
                      onChange={(e: any) => setNewFyStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#3A2211] border border-white/20 text-xs text-white focus:outline-none"
                    >
                      <option value="CLOSED">CLOSED (Upcoming / Archived)</option>
                      <option value="ACTIVE">ACTIVE (Current Operating FY)</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-3">
                    <button type="button" onClick={() => setIsNewFyModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300">
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold">
                      Create Fiscal Year
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB FOR PERFORMANCE RANKINGS */}
      {activeTab === 'rankings' && (
        <AdminPerformanceRankingDashboard
          districts={districts}
          branches={branches}
          employees={employees}
          reports={reports}
          targets={targets}
          onRefreshData={onRefreshData}
          onViewBranchDetails={(b) => {
            handleTabSelect('branches');
          }}
        />
      )}

      {/* TAB FOR BANK DOCUMENTS MANAGEMENT */}
      {activeTab === 'documents' && (
        <BankDocumentsManagementPanel currentUser={user} />
      )}

      {/* TAB FOR COMPETITOR INTELLIGENCE */}
      {activeTab === 'competitor' && (
        <CompetitorIntelligenceModule userRole={user.role} userDistrict={user.districtName} userBranch={user.branchName} />
      )}

      {/* TAB FOR ALL PRODUCTS */}
      {activeTab === 'products' && (
        <AllProductsOverview reports={reports} targets={targets} kpis={kpis} />
      )}

      {/* TAB 1: EXECUTIVE DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Admin Performance Ranking Section */}
          <AdminPerformanceRankingDashboard
            districts={districts}
            branches={branches}
            employees={employees}
            reports={reports}
            targets={targets}
            onRefreshData={onRefreshData}
            onViewBranchDetails={(b) => {
              handleTabSelect('branches');
            }}
          />

          {/* Enterprise & Branch Daily Campaign Analytics Engine */}
          <BranchCampaignWidget
            branchName="All Bunna Bank Network Branches"
            userRole={user.role}
            reports={reports}
            onReportSubmitted={onRefreshData}
          />

          {/* Main All Products Performance Overview Section */}
          <AllProductsOverview reports={reports} targets={targets} kpis={kpis} />
          
          {/* Top Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Total Staff Employees</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{employees.length.toLocaleString()}</h3>
                </div>
                <div className="p-3 rounded-xl bg-[#C89A2B]/20 text-[#C89A2B]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-400 mt-3 font-semibold">+12% growth in 2026</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Active Branches</p>
                  <h3 className="text-2xl font-extrabold text-white mt-1">{branches.length} Branches</h3>
                </div>
                <div className="p-3 rounded-xl bg-[#C89A2B]/20 text-[#C89A2B]">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-[#C89A2B] mt-3 font-semibold">Across {districts.length} Districts</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Pending Approvals</p>
                  <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount} Reports</h3>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-3 font-medium">Awaiting branch manager review</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-lg text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-gray-400 font-medium">Approved Reports</p>
                  <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{approvedCount} Reports</h3>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <p className="text-[11px] text-emerald-400 mt-3 font-semibold">
                {reports.length > 0
                  ? `${((approvedCount / reports.length) * 100).toFixed(1)}% approval rate`
                  : '100.0% approval rate'}
              </p>
            </div>
          </div>

          {/* Interactive Recharts Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Performance Trends Area Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-lg text-white">Financial Mobilization & Digital Activations Trend</h3>
                  <p className="text-xs text-gray-400">Monthly aggregate growth across all Bunna Bank branches</p>
                </div>
                <span className="bg-[#C89A2B]/20 text-[#C89A2B] px-3 py-1 rounded-full text-xs font-bold">2026 YTD</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C89A2B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#C89A2B" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDigital" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#6B3F1D', borderColor: '#C89A2B', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="deposits" name="Deposits (Million ETB)" stroke="#C89A2B" fillOpacity={1} fill="url(#colorDeposits)" />
                    <Area type="monotone" dataKey="digital" name="Digital Banking Activations" stroke="#10B981" fillOpacity={1} fill="url(#colorDigital)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: District Distribution Bar Chart */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-white mb-1">District Branch Density</h3>
                <p className="text-xs text-gray-400 mb-4">Branch count distribution per district</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={districtPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#6B3F1D', borderColor: '#C89A2B', borderRadius: '12px', fontSize: '12px' }} />
                      <Bar dataKey="branches" name="Branches" fill="#C89A2B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-center">
                <span className="text-xs text-[#C89A2B] font-semibold">
                  Top Performing District: Addis Ababa East District
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: DISTRICTS & AREA OFFICES */}
      {activeTab === 'districts' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-5">
          {/* Top Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#C89A2B]" />
                <span>Districts & Area Office Management</span>
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Manage Bunna Bank regional districts and zonal area offices across Ethiopia.
              </p>
            </div>
            <button
              onClick={() => setIsAddDistrictModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs flex items-center space-x-1.5 hover:bg-[#D8B45C] transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add District / Area Office</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search district name, code, region..."
                value={districtSearch}
                onChange={(e) => { setDistrictSearch(e.target.value); setDistrictPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-[#C89A2B]" />
              <select
                value={districtRegionFilter}
                onChange={(e) => { setDistrictRegionFilter(e.target.value); setDistrictPage(1); }}
                className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none"
              >
                <option value="All">All Regions</option>
                {uniqueRegions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#6B3F1D]/50">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">SOL ID / Code</th>
                  <th className="p-3">District / Area Office Name</th>
                  <th className="p-3">Region / Territory</th>
                  <th className="p-3">Assigned Branches</th>
                  <th className="p-3">Staff Employees</th>
                  <th className="p-3">District Manager</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedDistricts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      No district or area office matched your search filters.
                    </td>
                  </tr>
                ) : (
                  paginatedDistricts.map(d => (
                    <tr key={d.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-bold text-[#C89A2B] font-mono">
                        {d.solId || d.code} <span className="text-gray-400 font-normal text-[11px]">({d.code})</span>
                      </td>
                      <td className="p-3 font-semibold text-white">{d.name}</td>
                      <td className="p-3">{d.region}</td>
                      <td className="p-3 font-medium text-white">{d.branchCount || 0} Branches</td>
                      <td className="p-3">{d.totalEmployees || 0} Employees</td>
                      <td className="p-3 text-emerald-400 font-medium">{d.managerName || 'Assigned Director'}</td>
                      <td className="p-3">
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingDistrict(d)}
                            title="View District Details (👁)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDistrict({ ...d })}
                            title="Edit District (✏️)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDistrict(d.id, d.name)}
                            title="Delete District (🗑)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-300 gap-3 pt-2">
            <div>
              Showing {filteredDistricts.length === 0 ? 0 : (districtPage - 1) * districtRowsPerPage + 1} to{' '}
              {Math.min(districtPage * districtRowsPerPage, filteredDistricts.length)} of {filteredDistricts.length} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={districtPage === 1}
                onClick={() => setDistrictPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#C89A2B]">Page {districtPage} of {totalDistrictPages}</span>
              <button
                disabled={districtPage >= totalDistrictPages}
                onClick={() => setDistrictPage(prev => Math.min(prev + 1, totalDistrictPages))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BRANCH MANAGEMENT */}
      {activeTab === 'branches' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-5">
          {/* Top Bar with Export Options */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                  <Building className="w-5 h-5 text-[#C89A2B]" />
                  <span>Branch Directory & Sol ID Management</span>
                </h3>
                <span className="bg-[#C89A2B] text-[#6B3F1D] text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {branches.length} Registered
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Full-featured Bunna Bank branch CRUD system with search, filters, sorting, pagination, and multi-format exports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => downloadBranchesCSV(filteredBranches)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
                title="Download CSV file"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => downloadBranchesExcel(filteredBranches)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
                title="Download Excel file"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={() => printOrDownloadBranchesPDF(filteredBranches)}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
                title="Print or Save PDF"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-300" />
                <span>Print PDF</span>
              </button>

              <button
                onClick={() => setIsAddBranchModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs flex items-center space-x-1.5 hover:bg-[#D8B45C] transition-all shadow-md cursor-pointer ml-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Branch</span>
              </button>
            </div>
          </div>

          {/* Search, Filter, Sort Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Sol ID, Branch name, Telephone, Location..."
                value={branchSearch}
                onChange={(e) => { setBranchSearch(e.target.value); setBranchPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#C89A2B]"
              />
            </div>

            {/* Region Filter */}
            <select
              value={branchRegionFilter}
              onChange={(e) => { setBranchRegionFilter(e.target.value); setBranchPage(1); }}
              className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none"
            >
              <option value="All">All Regions</option>
              {uniqueRegions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {/* Parent District Filter */}
            <select
              value={branchDistrictFilter}
              onChange={(e) => { setBranchDistrictFilter(e.target.value); setBranchPage(1); }}
              className="px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none"
            >
              <option value="All">All Districts / Area Offices</option>
              {districts.map(d => (
                <option key={d.id} value={d.id}>{d.name} {d.solId ? `(SOL ${d.solId})` : ''}</option>
              ))}
            </select>

            {/* Status Filter & Sort Toggle */}
            <div className="flex items-center space-x-2">
              <select
                value={branchStatusFilter}
                onChange={(e) => { setBranchStatusFilter(e.target.value); setBranchPage(1); }}
                className="w-full px-3 py-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-xs text-white focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={() => setBranchSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-xl bg-[#6B3F1D] border border-white/20 text-[#C89A2B] hover:bg-white/10 shrink-0"
                title={`Sort ${branchSortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Branch Responsive Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#6B3F1D]/50">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-3">
                    <button
                      onClick={() => setBranchSortBy('solId')}
                      className="flex items-center space-x-1 hover:text-white"
                    >
                      <span>SOL ID</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="p-3">
                    <button
                      onClick={() => setBranchSortBy('name')}
                      className="flex items-center space-x-1 hover:text-white"
                    >
                      <span>Branch Name</span>
                      <ArrowUpDown className="w-3 h-3 opacity-60" />
                    </button>
                  </th>
                  <th className="p-3">Telephone Line(s)</th>
                  <th className="p-3">Parent District / Area Office</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Branch Address / Location</th>
                  <th className="p-3">Grade / Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedBranches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No branch found matching the selected search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedBranches.map(b => (
                    <tr key={b.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-extrabold text-[#C89A2B] font-mono">{b.solId || b.code}</td>
                      <td className="p-3 font-semibold text-white">{b.name}</td>
                      <td className="p-3 font-mono text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{b.phone || '+251 11 800 0000'}</span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-white">{b.districtName}</td>
                      <td className="p-3">{b.region || 'Addis Ababa'}</td>
                      <td className="p-3 text-gray-300">{b.location}</td>
                      <td className="p-3">
                        <span className="bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/30 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap">
                          {b.type || 'Grade I'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (b.status || 'Active') === 'Active' 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {b.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingBranch(b)}
                            title="View Branch Details (👁)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingBranch({ ...b })}
                            title="Edit Branch Record (✏️)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(b.id, b.name)}
                            title="Delete Branch (🗑)"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Branch Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-300 gap-3 pt-2">
            <div className="flex items-center space-x-3">
              <span>Rows per page:</span>
              <select
                value={branchRowsPerPage}
                onChange={(e) => { setBranchRowsPerPage(Number(e.target.value)); setBranchPage(1); }}
                className="px-2 py-1 rounded bg-[#6B3F1D] border border-white/20 text-white text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>
                Showing {filteredBranches.length === 0 ? 0 : (branchPage - 1) * branchRowsPerPage + 1} to{' '}
                {Math.min(branchPage * branchRowsPerPage, filteredBranches.length)} of {filteredBranches.length} entries
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={branchPage === 1}
                onClick={() => setBranchPage(prev => Math.max(prev - 1, 1))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-[#C89A2B]">
                Page {branchPage} of {totalBranchPages}
              </span>
              <button
                disabled={branchPage >= totalBranchPages}
                onClick={() => setBranchPage(prev => Math.min(prev + 1, totalBranchPages))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Employee Staff Roster</h3>
            <span className="text-xs text-[#C89A2B]">{employees.length} Registered Users</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase">
                <tr>
                  <th className="p-3">Staff ID</th>
                  <th className="p-3">Employee Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Job Title</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {employees.map(e => (
                  <tr key={e.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-[#C89A2B]">{e.userId}</td>
                    <td className="p-3 font-semibold text-white">{getUserFullName(e)}</td>
                    <td className="p-3"><span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{e.role}</span></td>
                    <td className="p-3">{e.jobTitle}</td>
                    <td className="p-3">{e.branchName}</td>
                    <td className="p-3">{e.email}</td>
                    <td className="p-3"><span className="text-emerald-400 font-bold">{e.status}</span></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingEmployee(e)}
                          title="View Employee Details"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingEmployee({ ...e })}
                          title="Edit Employee Role & Title"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEmployee(e.id, getUserFullName(e))}
                          title="Remove User"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenAiSummary) {
                              onOpenAiSummary(e);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold text-[11px] inline-flex items-center space-x-1 shadow transition-all cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>AI Summary</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: KPIS */}
      {activeTab === 'kpis' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Bunna Bank KPI Definitions & Weightings</h3>
            <button
              onClick={() => {
                const defaultGroup: KpiGroup = 'Finance';
                const defaultPreset = KPI_CATALOG_BY_GROUP[defaultGroup][0];
                const newK: KPI = {
                  id: `KPI-${Date.now()}`,
                  code: defaultPreset.code,
                  name: defaultPreset.name,
                  category: defaultGroup,
                  unit: defaultPreset.unit,
                  description: defaultPreset.description,
                  weight: defaultPreset.defaultWeight
                };
                setEditingKpi(newK);
              }}
              className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs flex items-center space-x-1.5 hover:bg-[#D8B45C]"
            >
              <Plus className="w-4 h-4" />
              <span>Define New KPI</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpis.map(k => (
              <div key={k.id} className="p-4 rounded-2xl bg-[#6B3F1D] border border-[#C89A2B]/20 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-[#C89A2B]">{k.code}</span>
                    <span className="bg-white/10 text-[10px] px-2 py-0.5 rounded font-medium">{k.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{k.name}</h4>
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed">{k.description}</p>
                </div>
                <div className="text-right shrink-0 space-y-2 ml-3">
                  <div>
                    <span className="text-base font-extrabold text-[#C89A2B]">{k.weight}%</span>
                    <p className="text-[10px] text-gray-400">Weight</p>
                  </div>
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      type="button"
                      onClick={() => setEditingKpi({ ...k })}
                      title="Edit KPI"
                      className="p-1 rounded bg-white/5 hover:bg-white/20 text-amber-400"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKpi(k.id, k.name)}
                      title="Delete KPI"
                      className="p-1 rounded bg-white/5 hover:bg-white/20 text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <h3 className="font-bold text-lg text-white">Daily Performance Reports Master Log</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase">
                <tr>
                  <th className="p-3">Report Date</th>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Deposits (ETB)</th>
                  <th className="p-3">Mobile Activations</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reviewed By</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reports.map(r => (
                  <tr key={r.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-[#C89A2B]">{r.reportDate}</td>
                    <td className="p-3 font-semibold text-white">{r.employeeName}</td>
                    <td className="p-3">{r.branchName}</td>
                    <td className="p-3 font-bold text-emerald-400">ETB {r.depositsETB.toLocaleString()}</td>
                    <td className="p-3">{r.mobileBankingActivations}</td>
                    <td className="p-3"><span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">{r.status}</span></td>
                    <td className="p-3">{r.reviewedBy || '-'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingReport(r)}
                          title="View Complete Report Details"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-cyan-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteReport(r.id)}
                          title="Delete Report Entry"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: BANK HOLIDAYS */}
      {activeTab === 'holidays' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-white">Configured Official Bank Holidays</h3>
            <button
              onClick={() => {
                const newH: BankHoliday = {
                  id: `HOL-${Date.now()}`,
                  name: 'New Public Holiday',
                  date: new Date().toISOString().split('T')[0],
                  recurring: true,
                  description: 'National banking holiday'
                };
                setEditingHoliday(newH);
              }}
              className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs flex items-center space-x-1.5 hover:bg-[#D8B45C]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank Holiday</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {holidays.map(h => (
              <div key={h.id} className="p-4 rounded-2xl bg-[#6B3F1D] border border-[#C89A2B]/20 flex justify-between items-start">
                <div>
                  <p className="font-bold text-xs text-[#C89A2B]">{h.date}</p>
                  <h4 className="font-bold text-sm text-white mt-0.5">{h.name}</h4>
                  <p className="text-xs text-gray-300 mt-1">{h.description}</p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <button
                    type="button"
                    onClick={() => setEditingHoliday({ ...h })}
                    title="Edit Holiday"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-amber-400"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteHoliday(h.id, h.name)}
                    title="Delete Holiday"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/20 text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-[#4A2C17] border border-[#C89A2B]/30 shadow-xl text-white space-y-4">
          <h3 className="font-bold text-lg text-white">System Security & Audit Log History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-[#6B3F1D] text-[#C89A2B] font-bold uppercase">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Module</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {auditLogs.map(l => (
                  <tr key={l.id} className="hover:bg-white/5">
                    <td className="p-3 font-bold text-[#C89A2B]">{l.id}</td>
                    <td className="p-3 font-semibold text-white">{l.userName}</td>
                    <td className="p-3">{l.userRole}</td>
                    <td className="p-3 font-mono text-emerald-400">{l.action}</td>
                    <td className="p-3">{l.module}</td>
                    <td className="p-3">{l.ipAddress}</td>
                    <td className="p-3">{l.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD DISTRICT */}
      {isAddDistrictModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#C89A2B]" />
                <span>Add New District</span>
              </h3>
              <button
                onClick={() => setIsAddDistrictModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDistrict} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">District Type</label>
                <select
                  value={newDistrictType}
                  onChange={(e) => setNewDistrictType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                >
                  <option value="District">Regional City District</option>
                  <option value="Area Office">Zonal City District</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">City / Office Name</label>
                <input
                  type="text"
                  placeholder="e.g., Harar, Gondar, Nekemte"
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">District Code</label>
                <input
                  type="text"
                  placeholder="e.g., 954, HRD, BDR"
                  value={newDistrictCode}
                  onChange={(e) => setNewDistrictCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Region / Zone</label>
                <input
                  type="text"
                  placeholder="e.g., Harari Region, Amhara Region"
                  value={newDistrictRegion}
                  onChange={(e) => setNewDistrictRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ato Solomon Worku"
                  value={newDistrictManager}
                  onChange={(e) => setNewDistrictManager(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDistrictModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold hover:bg-[#D8B45C] transition-colors"
                >
                  Create District
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD BRANCH */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Building className="w-5 h-5 text-[#C89A2B]" />
                <span>Add New Branch</span>
              </h3>
              <button
                onClick={() => setIsAddBranchModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Parent District / Area Office</label>
                <select
                  value={newBranchDistrictId}
                  onChange={(e) => setNewBranchDistrictId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                >
                  <option value="">-- Choose Parent Office --</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name} {d.solId ? `[SOL ${d.solId}]` : ''} ({d.region})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Name</label>
                <input
                  type="text"
                  placeholder="e.g., Harar Jugol Branch"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Code / Sol ID</label>
                <input
                  type="text"
                  placeholder="e.g., 360, BDR-01, HRR-01"
                  value={newBranchCode}
                  onChange={(e) => setNewBranchCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Grade / Type</label>
                  <select
                    value={newBranchType}
                    onChange={(e) => setNewBranchType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  >
                    <option value="Grade I">Grade I</option>
                    <option value="Grade II">Grade II</option>
                    <option value="Grade III">Grade III</option>
                    <option value="Special Branch">Special Branch</option>
                    <option value="IFB Special Branch">IFB Special Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Location Area</label>
                  <input
                    type="text"
                    placeholder="e.g., Downtown Commercial"
                    value={newBranchLocation}
                    onChange={(e) => setNewBranchLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Manager Name</label>
                <input
                  type="text"
                  placeholder="e.g., W/ro Bethlehem Tesfaye"
                  value={newBranchManager}
                  onChange={(e) => setNewBranchManager(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Telephone Line(s)</label>
                  <input
                    type="text"
                    placeholder="e.g., +251 11 890 1234"
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Status</label>
                  <select
                    value={newBranchStatus}
                    onChange={(e) => setNewBranchStatus(e.target.value as 'Active' | 'Inactive')}
                    className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold"
                >
                  Create Branch
                </button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW DISTRICT DETAILS */}
      {viewingDistrict && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-[#C89A2B] flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{viewingDistrict.name}</span>
              </h3>
              <button onClick={() => setViewingDistrict(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-200">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">District Code / SOL ID:</span>
                <span className="font-bold text-[#C89A2B] font-mono">{viewingDistrict.code} {viewingDistrict.solId ? `(SOL ${viewingDistrict.solId})` : ''}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Region / Zone:</span>
                <span className="font-semibold">{viewingDistrict.region}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Assigned Branches:</span>
                <span className="font-bold text-white">{viewingDistrict.branchCount} Branches</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Active Staff Count:</span>
                <span className="font-bold text-white">{viewingDistrict.totalEmployees} Employees</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">District Director / Manager:</span>
                <span className="font-medium text-emerald-400">{viewingDistrict.managerName}</span>
              </div>
              {viewingDistrict.operationManager && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Operation / Business Mgr:</span>
                  <span className="font-medium text-cyan-300">{viewingDistrict.operationManager}</span>
                </div>
              )}
              {viewingDistrict.phone && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Fixed Tel Lines:</span>
                  <span className="font-mono text-amber-200">{viewingDistrict.phone}</span>
                </div>
              )}
              {viewingDistrict.email && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Outlook Email:</span>
                  <span className="font-mono text-amber-300">{viewingDistrict.email}</span>
                </div>
              )}
              {viewingDistrict.secEmail && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Secretary Email:</span>
                  <span className="font-mono text-amber-200">{viewingDistrict.secEmail}</span>
                </div>
              )}
              {viewingDistrict.location && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Office Location:</span>
                  <span className="text-gray-200 font-sans">{viewingDistrict.location}</span>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingDistrict(null)} className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT DISTRICT */}
      {editingDistrict && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#C89A2B]" />
                <span>Edit District Entry</span>
              </h3>
              <button onClick={() => setEditingDistrict(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDistrictSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">District Name</label>
                <input
                  type="text"
                  value={editingDistrict.name}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">District Code</label>
                <input
                  type="text"
                  value={editingDistrict.code}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Region / Location</label>
                <input
                  type="text"
                  value={editingDistrict.region}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, region: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">District Manager</label>
                <input
                  type="text"
                  value={editingDistrict.managerName}
                  onChange={(e) => setEditingDistrict({ ...editingDistrict, managerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditingDistrict(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW BRANCH DETAILS */}
      {viewingBranch && (
        <BranchPerformanceDetailsModal
          branch={viewingBranch}
          onClose={() => setViewingBranch(null)}
          users={employees}
          reports={reports}
          kpis={kpis}
          targets={targets}
        />
      )}

      {/* MODAL: EDIT BRANCH */}
      {editingBranch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#C89A2B]" />
                <span>Edit Branch Record</span>
              </h3>
              <button onClick={() => setEditingBranch(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateBranchSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Name</label>
                <input
                  type="text"
                  value={editingBranch.name}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Code / Sol ID</label>
                <input
                  type="text"
                  value={editingBranch.code}
                  onChange={(e) => setEditingBranch({ ...editingBranch, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Grade / Type</label>
                <select
                  value={editingBranch.type}
                  onChange={(e) => setEditingBranch({ ...editingBranch, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                >
                  <option value="Grade I">Grade I</option>
                  <option value="Grade II">Grade II</option>
                  <option value="Grade III">Grade III</option>
                  <option value="Special Branch">Special Branch</option>
                  <option value="IFB Special Branch">IFB Special Branch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={editingBranch.location}
                  onChange={(e) => setEditingBranch({ ...editingBranch, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Branch Manager</label>
                <input
                  type="text"
                  value={editingBranch.managerName}
                  onChange={(e) => setEditingBranch({ ...editingBranch, managerName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditingBranch(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW EMPLOYEE DETAILS */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-[#C89A2B] flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>{getUserFullName(viewingEmployee)}</span>
              </h3>
              <button onClick={() => setViewingEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-gray-200">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Staff User ID:</span>
                <span className="font-bold text-[#C89A2B] font-mono">{viewingEmployee.userId}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Access Role:</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{viewingEmployee.role}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Job Title:</span>
                <span className="font-semibold text-white">{viewingEmployee.jobTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Assigned Branch:</span>
                <span className="font-semibold text-emerald-300">{viewingEmployee.branchName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Contact Email:</span>
                <span className="font-medium text-gray-300">{viewingEmployee.email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-gray-400">Phone:</span>
                <span className="font-medium text-gray-300">{viewingEmployee.phone}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingEmployee(null)} className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-[#C89A2B]" />
                <span>Edit User Profile & Role</span>
              </h3>
              <button onClick={() => setEditingEmployee(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateEmployeeSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">First Name</label>
                <input
                  type="text"
                  value={editingEmployee.firstName}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, firstName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Last Name</label>
                <input
                  type="text"
                  value={editingEmployee.lastName}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, lastName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Access Role</label>
                <select
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                >
                  <option value="EMPLOYEE">EMPLOYEE (Staff Member)</option>
                  <option value="MANAGER">MANAGER (Branch Operations)</option>
                  <option value="ADMINISTRATOR">ADMINISTRATOR (HQ / District)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editingEmployee.jobTitle}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditingEmployee(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold">
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW REPORT DETAILS */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-lg text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-lg text-[#C89A2B]">Daily Report Details</h3>
                <p className="text-xs text-gray-300">{viewingReport.reportDate} • {viewingReport.employeeName}</p>
              </div>
              <button onClick={() => setViewingReport(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Deposits Mobilized</span>
                <strong className="text-emerald-400 text-sm font-bold">ETB {viewingReport.depositsETB.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Foreign Currency</span>
                <strong className="text-emerald-400 text-sm font-bold">USD {viewingReport.foreignCurrencyETB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Digital Financial Services</span>
                <strong className="text-[#C89A2B] text-sm font-bold">ETB {viewingReport.digitalFinancialServicesETB.toLocaleString()}</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Account Openings</span>
                <strong className="text-white text-sm font-bold">{viewingReport.accountOpenings} Accounts</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Mobile Banking</span>
                <strong className="text-white text-sm font-bold">{viewingReport.mobileBankingActivations} Users</strong>
              </div>
              <div className="p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 block text-[10px]">Internet Banking</span>
                <strong className="text-white text-sm font-bold">{viewingReport.internetBankingActivations} Users</strong>
              </div>
            </div>
            {viewingReport.managerComment && (
              <div className="p-3 bg-[#4A2C17] border border-[#C89A2B]/30 rounded-xl text-xs">
                <span className="text-[#C89A2B] font-bold block mb-0.5">Manager Feedback:</span>
                <p className="text-gray-200">{viewingReport.managerComment}</p>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button onClick={() => setViewingReport(null)} className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / DEFINE KPI */}
      {editingKpi && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <Award className="w-5 h-5 text-[#C89A2B]" />
                <span>Configure KPI Metric</span>
              </h3>
              <button onClick={() => setEditingKpi(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateKpiSubmit} className="space-y-3.5">
              {/* FIELD 1: KPI GROUP */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  1. KPI Group <span className="text-[#C89A2B]">*</span>
                </label>
                <KpiGroupDropdown
                  value={editingKpi.category}
                  onChange={(newCategory) => {
                    const groupPresets = KPI_CATALOG_BY_GROUP[newCategory] || [];
                    const matchingPreset = groupPresets.find(p => p.name.toLowerCase() === editingKpi.name.toLowerCase());
                    if (matchingPreset) {
                      setEditingKpi({
                        ...editingKpi,
                        category: newCategory,
                        code: matchingPreset.code,
                        weight: matchingPreset.defaultWeight,
                        unit: matchingPreset.unit,
                        description: matchingPreset.description
                      });
                    } else if (groupPresets.length > 0) {
                      const firstPreset = groupPresets[0];
                      setEditingKpi({
                        ...editingKpi,
                        category: newCategory,
                        name: firstPreset.name,
                        code: firstPreset.code,
                        weight: firstPreset.defaultWeight,
                        unit: firstPreset.unit,
                        description: firstPreset.description
                      });
                    } else {
                      setEditingKpi({
                        ...editingKpi,
                        category: newCategory,
                        name: '',
                        code: '',
                        description: ''
                      });
                    }
                  }}
                />
              </div>

              {/* FIELD 2: KPI NAME (DYNAMICALLY FILTERED BY GROUP) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  2. KPI Name <span className="text-[#C89A2B]">*</span>
                </label>
                <KpiNameDropdown
                  category={editingKpi.category}
                  value={editingKpi.name}
                  onChangePreset={(preset) => {
                    setEditingKpi({
                      ...editingKpi,
                      name: preset.name,
                      code: preset.code,
                      weight: preset.defaultWeight,
                      unit: preset.unit,
                      description: preset.description
                    });
                  }}
                  onCustomInput={(customName) => {
                    setEditingKpi({
                      ...editingKpi,
                      name: customName
                    });
                  }}
                />
              </div>

              {/* FIELD 3: KPI CODE */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  3. KPI Code <span className="text-[#C89A2B]">*</span>
                </label>
                <input
                  type="text"
                  value={editingKpi.code}
                  onChange={(e) => setEditingKpi({ ...editingKpi, code: e.target.value })}
                  placeholder="e.g. KPI-DEP"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C89A2B]"
                  required
                />
              </div>

              {/* FIELD 4: WEIGHTING PERCENTAGE (%) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  4. Weighting Percentage (%) <span className="text-[#C89A2B]">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={editingKpi.weight}
                  onChange={(e) => setEditingKpi({ ...editingKpi, weight: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C89A2B]"
                  required
                />
              </div>

              {/* FIELD 5: DESCRIPTION */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  5. Description
                </label>
                <textarea
                  value={editingKpi.description}
                  onChange={(e) => setEditingKpi({ ...editingKpi, description: e.target.value })}
                  placeholder="Description of key performance metric..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#C89A2B]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditingKpi(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300 hover:bg-white/20 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] text-xs font-bold transition-colors">
                  Save Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE HOLIDAY */}
      {editingHoliday && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl p-6 w-full max-w-md text-white space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-bold text-lg text-white flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-[#C89A2B]" />
                <span>Configure Bank Holiday</span>
              </h3>
              <button onClick={() => setEditingHoliday(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateHolidaySubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Holiday Name</label>
                <input
                  type="text"
                  value={editingHoliday.name}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Calendar Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={editingHoliday.date}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={editingHoliday.description}
                  onChange={(e) => setEditingHoliday({ ...editingHoliday, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setEditingHoliday(null)} className="px-4 py-2 rounded-xl bg-white/10 text-xs text-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#C89A2B] text-[#6B3F1D] text-xs font-bold">
                  Save Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
