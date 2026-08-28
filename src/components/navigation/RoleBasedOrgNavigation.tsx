import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Crown, 
  ChevronDown, 
  Search, 
  X, 
  Filter, 
  Building, 
  Layers,
  ExternalLink
} from 'lucide-react';
import { User, District, Branch, DailyPerformanceReport, KPI, PerformanceTarget, getUserFullName } from '../../types';
import { DistrictDetailsModal } from './DistrictDetailsModal';
import { ChiefDetailsModal } from './ChiefDetailsModal';
import { CeoDetailsModal } from './CeoDetailsModal';
import { BranchPerformanceDetailsModal } from '../dashboard/BranchPerformanceDetailsModal';
import { EmployeePerformanceModal } from '../dashboard/EmployeePerformanceModal';

interface Props {
  currentUser: User;
  districts: District[];
  branches: Branch[];
  employees: User[];
  kpis: KPI[];
  reports: DailyPerformanceReport[];
  targets: PerformanceTarget[];
  language?: string;
}

type NavTab = 'ceo' | 'chiefs' | 'districts' | 'branches' | 'employees' | null;

export const RoleBasedOrgNavigation: React.FC<Props> = ({
  currentUser,
  districts,
  branches,
  employees,
  kpis,
  reports,
  targets,
  language = 'en'
}) => {
  const [activeTab, setActiveTab] = useState<NavTab>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedChief, setSelectedChief] = useState<User | null>(null);
  const [selectedCeo, setSelectedCeo] = useState<User | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setActiveTab(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveTab(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute user role capabilities & limits
  const isBoard = currentUser.role === 'BOARD_OF_DIRECTORS';
  const isCeo = currentUser.role === 'CEO';
  const isChief = currentUser.role === 'CHIEF_OFFICER' || currentUser.role === 'DIRECTOR';
  const isDistrictDirector = currentUser.role === 'DISTRICT_DIRECTOR';

  // Allowed nav tabs per role
  const availableTabs: { id: NavTab; label: string; icon: any; count?: number }[] = useMemo(() => {
    const tabs = [];

    if (isBoard) {
      tabs.push({ id: 'ceo' as NavTab, label: 'CEO', icon: Crown, count: 1 });
    }

    if (isBoard || isCeo) {
      tabs.push({ id: 'chiefs' as NavTab, label: 'Chiefs', icon: ShieldCheck, count: 8 });
    }

    if (isBoard || isCeo || isChief) {
      tabs.push({ id: 'districts' as NavTab, label: 'Districts', icon: Building2, count: districts.length });
    }

    // Both District Directors and higher roles can see Branches & Employees
    tabs.push({ id: 'branches' as NavTab, label: 'Branches', icon: Building, count: branches.length });
    tabs.push({ id: 'employees' as NavTab, label: 'Employees', icon: Users, count: employees.length });

    return tabs;
  }, [isBoard, isCeo, isChief, isDistrictDirector, districts.length, branches.length, employees.length]);

  // Data Filtering with Data Isolation Enforcement:
  // 1. Authorized Districts
  const filteredDistricts = useMemo(() => {
    let list = districts;
    if (isDistrictDirector) {
      list = districts.filter(d => 
        d.id === currentUser.districtId || 
        d.code === currentUser.districtId || 
        (d.name && currentUser.districtName && d.name.toLowerCase().trim() === currentUser.districtName.toLowerCase().trim()) ||
        (d.name && currentUser.districtId && d.name.toLowerCase().includes(currentUser.districtId.toLowerCase()))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        (d.code && d.code.toLowerCase().includes(q)) || 
        (d.region && d.region.toLowerCase().includes(q)) ||
        (d.solId && d.solId.toLowerCase().includes(q))
      );
    }
    return list;
  }, [districts, isDistrictDirector, currentUser, searchQuery]);

  // 2. Authorized Branches
  const filteredBranches = useMemo(() => {
    let list = branches;

    // Strict isolation for District Director
    if (isDistrictDirector) {
      list = branches.filter(b => {
        if (b.districtId === currentUser.districtId) return true;
        if (currentUser.districtName && b.districtName && b.districtName.toLowerCase().trim() === currentUser.districtName.toLowerCase().trim()) return true;
        if (currentUser.districtId && b.districtId && b.districtId.includes(currentUser.districtId)) return true;
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b => 
        b.name.toLowerCase().includes(q) || 
        (b.code && b.code.toLowerCase().includes(q)) || 
        (b.solId && b.solId.toLowerCase().includes(q)) ||
        (b.districtName && b.districtName.toLowerCase().includes(q)) ||
        (b.managerName && b.managerName.toLowerCase().includes(q))
      );
    }
    return list;
  }, [branches, isDistrictDirector, currentUser, searchQuery]);

  // Grouped Branches by District
  const branchesByDistrict = useMemo(() => {
    const map: Record<string, Branch[]> = {};
    filteredBranches.forEach(b => {
      const distName = b.districtName || 'Main / Head Office';
      if (!map[distName]) map[distName] = [];
      map[distName].push(b);
    });
    return map;
  }, [filteredBranches]);

  // 3. Authorized Employees
  const filteredEmployees = useMemo(() => {
    let list = employees;

    if (isDistrictDirector) {
      list = employees.filter(e => {
        if (e.districtId === currentUser.districtId) return true;
        if (currentUser.districtName && e.districtName && e.districtName.toLowerCase().trim() === currentUser.districtName.toLowerCase().trim()) return true;
        return false;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e => {
        const fullName = getUserFullName(e).toLowerCase();
        return (
          fullName.includes(q) || 
          (e.jobTitle && e.jobTitle.toLowerCase().includes(q)) ||
          (e.branchName && e.branchName.toLowerCase().includes(q)) ||
          (e.userId && e.userId.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [employees, isDistrictDirector, currentUser, searchQuery]);

  // Grouped Employees by Branch
  const employeesByBranch = useMemo(() => {
    const map: Record<string, User[]> = {};
    filteredEmployees.forEach(e => {
      const branchLabel = e.branchName || 'District Leadership / Head Office';
      if (!map[branchLabel]) map[branchLabel] = [];
      map[branchLabel].push(e);
    });
    return map;
  }, [filteredEmployees]);

  // 4. CEOs & Chiefs lists
  const ceoList = useMemo<User[]>(() => {
    const list = employees.filter(u => u.role === 'CEO' || (u.jobTitle && u.jobTitle.toUpperCase().includes('CHIEF EXECUTIVE OFFICER')));
    if (list.length === 0) {
      return [{
        id: 'USR-CEO-001',
        userId: 'CEO',
        firstName: 'Chief',
        middleName: '',
        lastName: 'Executive Officer',
        email: 'ceo@bunnabanket.com',
        role: 'CEO' as const,
        jobTitle: 'Chief Executive Officer (CEO)',
        districtId: 'DIST-HO',
        districtName: 'Head Office',
        branchId: 'BR-HO',
        branchName: 'Head Office',
        status: 'Active' as const,
        phone: '+251 11 126 2600',
        gender: 'Male',
        age: 50,
        createdAt: '2026-01-01'
      }];
    }
    return list;
  }, [employees]);

  const chiefList = useMemo<User[]>(() => {
    const list = employees.filter(u => u.role === 'CHIEF_OFFICER' || u.role === 'DIRECTOR' || (u.jobTitle && u.jobTitle.toLowerCase().includes('chief')));
    if (list.length === 0) {
      return [
        { id: 'C1', userId: 'Finance', firstName: 'Chief', middleName: '', lastName: 'Finance Officer', email: 'finance@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Finance Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Male', age: 45, createdAt: '2026-01-01' },
        { id: 'C2', userId: 'Strategy', firstName: 'Chief', middleName: '', lastName: 'Strategy Officer', email: 'strategy@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Strategy Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Female', age: 42, createdAt: '2026-01-01' },
        { id: 'C3', userId: 'Digital', firstName: 'Chief', middleName: '', lastName: 'Digital Officer', email: 'digital@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Digital Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Male', age: 40, createdAt: '2026-01-01' },
        { id: 'C4', userId: 'Corporate', firstName: 'Chief', middleName: '', lastName: 'Corporate Officer', email: 'corporate@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Corporate Banking Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Male', age: 48, createdAt: '2026-01-01' },
        { id: 'C5', userId: 'People', firstName: 'Chief', middleName: '', lastName: 'People Officer', email: 'people@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief People & Culture Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Female', age: 44, createdAt: '2026-01-01' },
        { id: 'C6', userId: 'Product', firstName: 'Chief', middleName: '', lastName: 'Product Officer', email: 'product@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Product & Innovation Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Male', age: 43, createdAt: '2026-01-01' },
        { id: 'C7', userId: 'Transformation', firstName: 'Chief', middleName: '', lastName: 'Transformation Officer', email: 'transformation@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Transformation Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Male', age: 46, createdAt: '2026-01-01' },
        { id: 'C8', userId: 'Retail', firstName: 'Chief', middleName: '', lastName: 'Retail Officer', email: 'retail@bunnabanket.com', role: 'CHIEF_OFFICER' as const, jobTitle: 'Chief Retail Banking Officer', districtId: 'DIST-HO', districtName: 'Head Office', branchId: 'BR-HO', branchName: 'Head Office', status: 'Active' as const, phone: '+251 11 126 2600', gender: 'Female', age: 47, createdAt: '2026-01-01' },
      ];
    }
    return list;
  }, [employees]);

  const toggleTab = (tab: NavTab) => {
    if (activeTab === tab) {
      setActiveTab(null);
    } else {
      setActiveTab(tab);
      setSearchQuery('');
    }
  };

  return (
    <div ref={containerRef} className="w-full mb-8">
      {/* Navigation Toolbar Banner */}
      <div className="bg-gradient-to-r from-[#5C3A21] via-[#4A2E1A] to-[#382213] rounded-2xl shadow-xl p-4 md:p-5 border border-amber-900/40 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Section Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                  Bunna Bank EPMS Portal
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {isBoard ? 'Board Portal' : isCeo ? 'CEO Portal' : isChief ? 'Chief Portal' : isDistrictDirector ? 'District Director' : 'Hierarchical Navigation'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Hierarchical Organizational Access & Performance Drill-Down
              </h3>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-2">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => toggleTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs md:text-sm transition-all duration-200 border shadow-sm ${
                    isActive
                      ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-400/20 shadow-md font-bold scale-[1.02]'
                      : 'bg-white/10 hover:bg-white/20 text-amber-100 border-white/20 hover:border-amber-300/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-950' : 'text-amber-300'}`} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-950/20 text-amber-950' : 'bg-white/15 text-amber-200'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Menu Overlay Container */}
        {activeTab && (
          <div className="mt-4 pt-4 border-t border-white/15 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header & Search Bar inside dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Select {activeTab.toUpperCase()} to inspect performance details:
                </span>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-amber-200/60" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toUpperCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/30 border border-white/20 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-amber-200/50 focus:outline-none focus:border-amber-400 transition-colors"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-amber-200/60 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content per active tab */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 text-slate-800 dark:text-slate-100 max-h-[60vh] overflow-y-auto shadow-inner border border-amber-900/20">
              
              {/* TAB: CEO */}
              {activeTab === 'ceo' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ceoList.map(ceo => (
                    <div
                      key={ceo.id || ceo.userId}
                      onClick={() => {
                        setSelectedCeo(ceo);
                        setActiveTab(null);
                      }}
                      className="group bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white font-bold flex items-center justify-center text-base shadow">
                          <Crown className="w-5 h-5 text-amber-950" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                            {getUserFullName(ceo)}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{ceo.jobTitle || 'Chief Executive Officer'}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-[#5C3A21] text-amber-300 text-xs font-bold rounded-lg group-hover:bg-[#4A2E1A] transition-colors">
                        Inspect CEO
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: CHIEFS */}
              {activeTab === 'chiefs' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {chiefList.map(chief => (
                    <div
                      key={chief.id || chief.userId}
                      onClick={() => {
                        setSelectedChief(chief);
                        setActiveTab(null);
                      }}
                      className="group bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#5C3A21] text-amber-300 font-bold flex items-center justify-center text-sm shadow-sm">
                          {(chief.firstName || 'C').charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                            {chief.jobTitle || getUserFullName(chief)}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{getUserFullName(chief)}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-300 text-xs font-semibold rounded-lg group-hover:bg-[#5C3A21] group-hover:text-amber-300 transition-colors">
                        View Details
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: DISTRICTS */}
              {activeTab === 'districts' && (
                <div>
                  {filteredDistricts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">No matching districts found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {filteredDistricts.map(d => (
                        <div
                          key={d.id}
                          onClick={() => {
                            setSelectedDistrict(d);
                            setActiveTab(null);
                          }}
                          className="group bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#5C3A21] dark:group-hover:text-amber-400 transition-colors">
                                {d.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-[#5C3A21] dark:text-amber-300 rounded font-bold">
                                SOL: {d.solId || d.code}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Director: {d.managerName || 'District Director'}
                            </p>
                          </div>
                          
                          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                            <span>{d.branchCount || 0} Branches</span>
                            <span className="text-[#5C3A21] dark:text-amber-400 font-semibold group-hover:underline flex items-center gap-1">
                              Inspect <ExternalLink className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: BRANCHES */}
              {activeTab === 'branches' && (
                <div className="space-y-4">
                  {Object.keys(branchesByDistrict).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">No authorized branches found.</div>
                  ) : (
                    Object.entries(branchesByDistrict).map(([distName, bList]) => (
                      <div key={distName} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700/80 text-xs font-bold text-[#5C3A21] dark:text-amber-400 uppercase tracking-wider">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{distName} ({bList.length} Branches)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {bList.map(b => (
                            <div
                              key={b.id}
                              onClick={() => {
                                setSelectedBranch(b);
                                setActiveTab(null);
                              }}
                              className="group bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#5C3A21] dark:group-hover:text-amber-400">
                                  {b.name}
                                </span>
                                {b.solId && (
                                  <span className="ml-1.5 text-[10px] font-mono text-slate-400">
                                    [{b.solId}]
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#5C3A21] dark:text-amber-400 font-semibold group-hover:underline">
                                Details &rarr;
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB: EMPLOYEES */}
              {activeTab === 'employees' && (
                <div className="space-y-4">
                  {Object.keys(employeesByBranch).length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">No authorized employees found.</div>
                  ) : (
                    Object.entries(employeesByBranch).map(([branchLabel, empList]) => (
                      <div key={branchLabel} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-700/80 text-xs font-bold text-[#5C3A21] dark:text-amber-400 uppercase tracking-wider">
                          <Building className="w-3.5 h-3.5" />
                          <span>{branchLabel} ({empList.length} Employees)</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {empList.map(emp => (
                            <div
                              key={emp.id || emp.userId}
                              onClick={() => {
                                setSelectedEmployee(emp);
                                setActiveTab(null);
                              }}
                              className="group bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#5C3A21] dark:group-hover:text-amber-400">
                                  {getUserFullName(emp)}
                                </span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                                  {emp.jobTitle || emp.role}
                                </p>
                              </div>
                              <span className="text-[10px] text-[#5C3A21] dark:text-amber-400 font-semibold group-hover:underline">
                                Profile &rarr;
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {/* RENDER MODALS WHEN SELECTED */}
      {selectedDistrict && (
        <DistrictDetailsModal
          district={selectedDistrict}
          branches={branches}
          employees={employees}
          reports={reports}
          kpis={kpis}
          targets={targets}
          onClose={() => setSelectedDistrict(null)}
          onSelectBranch={(b) => {
            setSelectedDistrict(null);
            setSelectedBranch(b);
          }}
          onSelectEmployee={(e) => {
            setSelectedDistrict(null);
            setSelectedEmployee(e);
          }}
        />
      )}

      {selectedChief && (
        <ChiefDetailsModal
          chief={selectedChief}
          districts={districts}
          branches={branches}
          reports={reports}
          onClose={() => setSelectedChief(null)}
          onSelectDistrict={(d) => {
            setSelectedChief(null);
            setSelectedDistrict(d);
          }}
        />
      )}

      {selectedCeo && (
        <CeoDetailsModal
          ceo={selectedCeo}
          chiefs={chiefList}
          districts={districts}
          branches={branches}
          reports={reports}
          onClose={() => setSelectedCeo(null)}
          onSelectChief={(c) => {
            setSelectedCeo(null);
            setSelectedChief(c);
          }}
        />
      )}

      {selectedBranch && (
        <BranchPerformanceDetailsModal
          branch={selectedBranch}
          users={employees}
          reports={reports}
          kpis={kpis}
          targets={targets}
          onClose={() => setSelectedBranch(null)}
        />
      )}

      {selectedEmployee && (
        <EmployeePerformanceModal
          isOpen={true}
          onClose={() => setSelectedEmployee(null)}
          employees={employees}
          reports={reports}
          targets={targets}
          initialEmployeeId={selectedEmployee.id || selectedEmployee.userId}
        />
      )}
    </div>
  );
};
