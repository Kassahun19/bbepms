import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Shield, Building, MapPin, User as UserIcon, Lock, Phone, Mail, Search, Filter, RotateCcw } from 'lucide-react';
import { District, Branch, User } from '../../types';
import { api } from '../../services/api';
import { initialDistricts, initialBranches } from '../../data/mockData';
import { ModalCloseButton } from '../common/ModalCloseButton';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: User) => void;
  onOpenLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin
}) => {
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState<District[]>(initialDistricts);
  const [branches, setBranches] = useState<Branch[]>(initialBranches);

  // Form State
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('ALL');
  const [branchSearchQuery, setBranchSearchQuery] = useState('');
  const [selectedBranchTypeFilter, setSelectedBranchTypeFilter] = useState('ALL');

  // Derived search engine filter computations for Step 1 (Districts)
  const availableRegions = Array.from(new Set(districts.map(d => d.region).filter(Boolean))) as string[];
  const filteredDistricts = districts.filter(d => {
    const query = (districtSearchQuery || '').toLowerCase().trim();
    const matchesQuery = !query || (
      (d.name && d.name.toLowerCase().includes(query)) ||
      (d.solId && d.solId.toLowerCase().includes(query)) ||
      (d.code && d.code.toLowerCase().includes(query)) ||
      (d.region && d.region.toLowerCase().includes(query)) ||
      (d.managerName && d.managerName.toLowerCase().includes(query)) ||
      (d.type && d.type.toLowerCase().includes(query))
    );
    const matchesRegion = selectedRegionFilter === 'ALL' || d.region === selectedRegionFilter;
    return matchesQuery && matchesRegion;
  });

  const selectedDistrict = districts.find(d => d.id === selectedDistrictId) || initialDistricts.find(d => d.id === selectedDistrictId);

  // Derived search engine filter computations for Step 2 (Branches)
  const districtBranches = React.useMemo(() => {
    if (!selectedDistrictId) return branches;

    // Filter from loaded branches
    let matched = branches.filter(b => {
      if (!b) return false;
      if (b.districtId === selectedDistrictId) return true;
      if (selectedDistrict) {
        if (b.districtId === selectedDistrict.id || b.districtId === selectedDistrict.code) return true;
        if (b.districtName && selectedDistrict.name && b.districtName.toLowerCase().trim() === selectedDistrict.name.toLowerCase().trim()) return true;
        if (selectedDistrict.code && b.districtId && b.districtId.includes(selectedDistrict.code)) return true;
      }
      return false;
    });

    // If branches state already holds filtered branches for this district
    if (matched.length === 0 && branches.length > 0 && branches.length <= 100) {
      matched = branches;
    }

    // Fallback to initialBranches directory if needed
    if (matched.length === 0) {
      matched = initialBranches.filter(b => {
        if (b.districtId === selectedDistrictId) return true;
        if (selectedDistrict) {
          if (b.districtId === selectedDistrict.id || b.districtId === selectedDistrict.code) return true;
          if (b.districtName && selectedDistrict.name && b.districtName.toLowerCase().trim() === selectedDistrict.name.toLowerCase().trim()) return true;
          if (selectedDistrict.code && b.districtId && b.districtId.includes(selectedDistrict.code)) return true;
        }
        return false;
      });
    }

    return matched;
  }, [branches, selectedDistrictId, selectedDistrict]);

  const availableBranchTypes = Array.from(new Set(districtBranches.map(b => b.type).filter(Boolean))) as string[];

  const filteredBranches = React.useMemo(() => {
    return districtBranches.filter(b => {
      const query = (branchSearchQuery || '').toLowerCase().trim();
      const matchesQuery = !query || (
        (b.name && b.name.toLowerCase().includes(query)) ||
        (b.code && b.code.toLowerCase().includes(query)) ||
        (b.solId && b.solId.toLowerCase().includes(query)) ||
        (b.type && b.type.toLowerCase().includes(query)) ||
        (b.location && b.location.toLowerCase().includes(query)) ||
        (b.managerName && b.managerName.toLowerCase().includes(query))
      );
      const matchesType = selectedBranchTypeFilter === 'ALL' || b.type === selectedBranchTypeFilter;
      return matchesQuery && matchesType;
    });
  }, [districtBranches, branchSearchQuery, selectedBranchTypeFilter]);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState<number | ''>(28);
  const [phone, setPhone] = useState('+251911223344');
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState<'Managerial' | 'Non-Managerial'>('Non-Managerial');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Live validation state
  const [userIdStatus, setUserIdStatus] = useState<{ checked: boolean; available: boolean; message: string }>({
    checked: false,
    available: false,
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getDistricts()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setDistricts(data);
          } else {
            setDistricts(initialDistricts);
          }
        })
        .catch(err => {
          console.error('Failed to load districts:', err);
          setDistricts(initialDistricts);
        });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDistrictId) {
      api.getBranches(selectedDistrictId)
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
          } else {
            setBranches(initialBranches.filter(b => 
              b.districtId === selectedDistrictId || 
              (selectedDistrict && (b.districtId === selectedDistrict.id || b.districtId === selectedDistrict.code || b.districtName === selectedDistrict.name))
            ));
          }
        })
        .catch(err => {
          console.error('Failed to load branches:', err);
          setBranches(initialBranches.filter(b => 
            b.districtId === selectedDistrictId || 
            (selectedDistrict && (b.districtId === selectedDistrict.id || b.districtId === selectedDistrict.code || b.districtName === selectedDistrict.name))
          ));
        });
    }
  }, [selectedDistrictId, selectedDistrict]);

  // Live User ID Validation check debounce
  useEffect(() => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setUserIdStatus({ checked: false, available: false, message: '' });
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setUserIdStatus({ checked: true, available: false, message: 'Staff ID must contain numbers only (e.g. 4994, 1245, 687).' });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.validateUserId(trimmed);
        setUserIdStatus({ checked: true, available: res.available, message: res.message });
      } catch (err) {
        setUserIdStatus({ checked: true, available: true, message: 'Ready' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userId]);

  if (!isOpen) return null;

  // Password requirement flags
  const pwdCriteria = {
    minLen: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNum: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordValid = Object.values(pwdCriteria).every(Boolean);

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-600' };
    let score = 0;
    if (pwdCriteria.minLen) score++;
    if (pwdCriteria.hasUpper) score++;
    if (pwdCriteria.hasLower) score++;
    if (pwdCriteria.hasNum) score++;
    if (pwdCriteria.hasSpecial) score++;

    if (score <= 2) return { score: 30, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 4) return { score: 70, label: 'Fair / Good', color: 'bg-[#C89A2B]' };
    return { score: 100, label: 'Strong (Compliant)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleNext = () => {
    setError('');
    if (step === 1 && !selectedDistrictId) {
      setError('Please select a District or Area Office.');
      return;
    }
    if (step === 2 && !selectedBranchId) {
      setError('Please select a Branch.');
      return;
    }
    if (step === 3) {
      if (!firstName || !lastName || !email || !phone) {
        setError('Please complete all personal information fields.');
        return;
      }
      if (!email.includes('@')) {
        setError('Please provide a valid email address.');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 5));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the terms and security policies to register.');
      return;
    }

    setLoading(true);

    try {
      const data = await api.register({
        districtId: selectedDistrictId,
        branchId: selectedBranchId,
        firstName,
        middleName,
        lastName,
        gender,
        age,
        phone,
        email,
        roleType,
        userId,
        password
      });

      onRegisterSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedChanges = Boolean(
    selectedDistrictId ||
    selectedBranchId ||
    firstName ||
    lastName ||
    phone ||
    email ||
    userId ||
    step > 1
  );

  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
    hasUnsavedChanges,
    unsavedMessage: 'You have entered registration data. Are you sure you want to close without completing registration?'
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-xl bg-[#6B3F1D] border border-[#C89A2B]/40 rounded-3xl shadow-2xl text-white overflow-hidden p-6 sm:p-8 relative"
      >
        <div className="absolute top-5 right-5 z-10">
          <ModalCloseButton onClose={onClose} ariaLabel="Close registration dialog" />
        </div>

        {/* Wizard Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-[#C89A2B] mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && 'District Selection'}
              {step === 2 && 'Branch Selection'}
              {step === 3 && 'Personal Details'}
              {step === 4 && 'Role Selection'}
              {step === 5 && 'Account Credentials'}
            </span>
          </div>
          <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: District Search Engine */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-[#C89A2B]" />
                  <h3 className="text-lg font-bold text-white">Step 1: Select District / Area Office</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/40">
                  Search Engine Active
                </span>
              </div>
              <p className="text-xs text-gray-200">
                Use the search engine below to quickly locate your assigned District Office by Name, SOL ID, Region, or Code across Ethiopia.
              </p>

              {/* District Search Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={districtSearchQuery}
                    onChange={(e) => setDistrictSearchQuery(e.target.value)}
                    placeholder="Search district by name, SOL ID (e.g. 0101), region, or code..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 focus:border-[#C89A2B] text-xs text-white placeholder-gray-400 focus:outline-none transition-all"
                  />
                  {districtSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDistrictSearchQuery('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Region Filter Tags */}
                {availableRegions.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    <span className="text-gray-300 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#C89A2B]" /> Region:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegionFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedRegionFilter === 'ALL'
                          ? 'bg-[#C89A2B] text-[#6B3F1D] font-bold shadow'
                          : 'bg-white/10 text-gray-200 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      All ({districts.length})
                    </button>
                    {availableRegions.map(reg => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setSelectedRegionFilter(reg)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                          selectedRegionFilter === reg
                            ? 'bg-[#C89A2B] text-[#6B3F1D] font-bold shadow'
                            : 'bg-white/10 text-gray-200 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        {reg} ({districts.filter(d => d.region === reg).length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Results Stats & Reset */}
                <div className="flex items-center justify-between text-[11px] text-gray-300 px-1">
                  <span>
                    Found <strong className="text-[#C89A2B]">{filteredDistricts.length}</strong> district{filteredDistricts.length === 1 ? '' : 's'} matching criteria
                  </span>
                  {(districtSearchQuery || selectedRegionFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictSearchQuery('');
                        setSelectedRegionFilter('ALL');
                      }}
                      className="text-[#C89A2B] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* District Search Results List */}
              <div className="max-h-52 overflow-y-auto pr-1 space-y-2 rounded-2xl p-1.5 bg-black/30 border border-white/10">
                {filteredDistricts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-300 space-y-2">
                    <MapPin className="w-8 h-8 mx-auto opacity-40 text-[#C89A2B]" />
                    <p>No district or area office found matching "{districtSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictSearchQuery('');
                        setSelectedRegionFilter('ALL');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-[11px] inline-block hover:bg-[#D8B45C]"
                    >
                      Clear Search Query
                    </button>
                  </div>
                ) : (
                  filteredDistricts.map(d => {
                    const isSelected = selectedDistrictId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDistrictId(d.id);
                          setSelectedBranchId('');
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#C89A2B]/20 border-[#C89A2B] shadow-lg ring-1 ring-[#C89A2B]/40'
                            : 'bg-white/5 border-white/10 hover:border-[#C89A2B]/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white truncate">{d.name}</span>
                            {d.solId && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/30">
                                SOL {d.solId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-300 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Region: <strong className="text-white">{d.region}</strong></span>
                            <span>Code: <strong className="text-white">{d.code}</strong></span>
                            {d.managerName && <span>Manager: <strong className="text-gray-200">{d.managerName}</strong></span>}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center space-x-2 pt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#C89A2B] text-[#6B3F1D] flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-white/30 hover:border-[#C89A2B]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Dropdown Sync */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Or select directly from District dropdown:
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    setSelectedDistrictId(e.target.value);
                    setSelectedBranchId('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 focus:border-[#C89A2B] text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose District Office --</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.solId ? `(SOL ${d.solId})` : `(${d.code})`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistrictId && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-[#C89A2B]/30 text-xs text-gray-200">
                  <div className="font-bold text-[#C89A2B] mb-1">Selected Location:</div>
                  {(() => {
                    const sel = districts.find(d => d.id === selectedDistrictId);
                    if (!sel) return null;
                    return (
                      <div>
                        <span className="font-semibold text-white">{sel.name}</span> • Region: {sel.region} • Managed by {sel.managerName}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Branch Search Engine */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <Building className="w-6 h-6 text-[#C89A2B]" />
                  <h3 className="text-lg font-bold text-white">Step 2: Select Branch</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/40">
                  Search Engine Active
                </span>
              </div>
              <p className="text-xs text-gray-200">
                Use the branch search engine below to locate your specific branch under <span className="text-[#C89A2B] font-semibold">{districts.find(d => d.id === selectedDistrictId)?.name || 'Selected District'}</span>.
              </p>

              {/* Branch Search Bar */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={branchSearchQuery}
                    onChange={(e) => setBranchSearchQuery(e.target.value)}
                    placeholder="Search branch by name, code, type (Grade I, Grade II), location..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 focus:border-[#C89A2B] text-xs text-white placeholder-gray-400 focus:outline-none transition-all"
                  />
                  {branchSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBranchSearchQuery('')}
                      className="absolute right-3 top-3 text-gray-400 hover:text-white"
                      title="Clear branch search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Branch Type Filter Tags */}
                {availableBranchTypes.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    <span className="text-gray-300 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#C89A2B]" /> Type:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBranchTypeFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                        selectedBranchTypeFilter === 'ALL'
                          ? 'bg-[#C89A2B] text-[#6B3F1D] font-bold shadow'
                          : 'bg-white/10 text-gray-200 hover:text-white hover:bg-white/20'
                      }`}
                    >
                      All ({districtBranches.length})
                    </button>
                    {availableBranchTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedBranchTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${
                          selectedBranchTypeFilter === type
                            ? 'bg-[#C89A2B] text-[#6B3F1D] font-bold shadow'
                            : 'bg-white/10 text-gray-200 hover:text-white hover:bg-white/20'
                        }`}
                      >
                        {type} ({districtBranches.filter(b => b.type === type).length})
                      </button>
                    ))}
                  </div>
                )}

                {/* Branch Results Stats & Reset */}
                <div className="flex items-center justify-between text-[11px] text-gray-300 px-1">
                  <span>
                    Found <strong className="text-[#C89A2B]">{filteredBranches.length}</strong> branch{filteredBranches.length === 1 ? '' : 'es'} in <span className="text-white font-semibold">{districts.find(d => d.id === selectedDistrictId)?.name || 'District'}</span>
                  </span>
                  {(branchSearchQuery || selectedBranchTypeFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setBranchSearchQuery('');
                        setSelectedBranchTypeFilter('ALL');
                      }}
                      className="text-[#C89A2B] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              {/* Branch Search Results List */}
              <div className="max-h-56 overflow-y-auto pr-1 space-y-2 rounded-2xl p-1.5 bg-black/30 border border-white/10">
                {filteredBranches.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-300 space-y-2">
                    <Building className="w-8 h-8 mx-auto opacity-40 text-[#C89A2B]" />
                    <p>No branch found matching "{branchSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setBranchSearchQuery('');
                        setSelectedBranchTypeFilter('ALL');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-[11px] inline-block hover:bg-[#D8B45C]"
                    >
                      Clear Branch Search
                    </button>
                  </div>
                ) : (
                  filteredBranches.map(b => {
                    const isSelected = selectedBranchId === b.id;
                    const cleanName = b.name.replace(/Branch/gi, '').trim();
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#C89A2B]/20 border-[#C89A2B] shadow-lg ring-1 ring-[#C89A2B]/40'
                            : 'bg-white/5 border-white/10 hover:border-[#C89A2B]/50 hover:bg-white/10'
                        }`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-white truncate">{cleanName} Branch</span>
                            {b.solId && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#C89A2B]/20 text-[#C89A2B] border border-[#C89A2B]/30">
                                SOL {b.solId}
                              </span>
                            )}
                            {b.type && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-white/10 text-gray-200">
                                {b.type}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-300 flex flex-wrap gap-x-3 gap-y-0.5">
                            {b.location && <span>Location: <strong className="text-gray-200">{b.location}</strong></span>}
                            {b.managerName && <span>Manager: <strong className="text-gray-200">{b.managerName}</strong></span>}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center space-x-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#C89A2B] text-[#6B3F1D] flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-white/30 hover:border-[#C89A2B]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Branch Dropdown Sync */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Or select directly from Branch dropdown:
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#4A2C17] border border-white/20 focus:border-[#C89A2B] text-xs text-white focus:outline-none"
                >
                  <option value="">-- Choose Branch ({districtBranches.length} Available) --</option>
                  {districtBranches.map(b => {
                    const cleanName = b.name.replace(/Branch/gi, '').trim();
                    return (
                      <option key={b.id} value={b.id}>
                        {cleanName} Branch — {b.solId ? `SOL ID: ${b.solId}` : `Code: ${b.code}`} ({b.type || 'Standard'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBranchId && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-[#C89A2B]/30 text-xs text-gray-200">
                  {(() => {
                    const b = districtBranches.find(br => br.id === selectedBranchId) || 
                              branches.find(br => br.id === selectedBranchId) || 
                              initialBranches.find(br => br.id === selectedBranchId);
                    if (!b) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-[#C89A2B] flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{b.name.replace(/Branch/gi, '').trim()} Branch</span>
                          {b.solId && <span className="font-mono text-xs text-gray-200">(SOL {b.solId})</span>}
                        </div>
                        <div className="text-gray-200">
                          Branch Code: <span className="font-mono text-white">{b.code}</span> • Type: <span className="text-white">{b.type}</span>
                        </div>
                        <div className="text-gray-200">
                          Location: <span className="text-white">{b.location}</span> • Branch Manager: <span className="text-white">{b.managerName}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Personal Information */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 mb-2">
                <UserIcon className="w-6 h-6 text-[#C89A2B]" />
                <h3 className="text-lg font-bold text-white">Step 3: Personal Information</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Abebe"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kebede"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Teso"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#4A2C17] border border-white/20 text-xs text-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@bunnabanksc.com"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Choose Role */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-6 h-6 text-[#C89A2B]" />
                <h3 className="text-lg font-bold text-white">Step 4: Select Employment Category & Role Access</h3>
              </div>

              <p className="text-xs text-gray-200">
                Please select your employment role type at Bunna Bank S.C. Selecting Managerial grants you full Managerial Role access (Manager Dashboard, Team Approvals, Reports, Employee Tracking). Selecting Non-Managerial grants you Employee Role access (Employee Dashboard, My Performance, MY KPIs, My Reports).
              </p>

              {/* District & Branch Confirmation Badge */}
              <div className="p-3.5 rounded-2xl bg-white/10 border border-[#C89A2B]/30 text-xs text-gray-200 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-gray-300">Assigned Location:</span>{" "}
                  <strong className="text-white">{selectedDistrict?.name || 'District'}</strong>{" "}
                  • <strong className="text-[#C89A2B]">{(districtBranches.find(b => b.id === selectedBranchId) || branches.find(b => b.id === selectedBranchId) || initialBranches.find(b => b.id === selectedBranchId))?.name || 'Branch'}</strong>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B]">
                  Automatic Role Routing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setRoleType('Managerial')}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    roleType === 'Managerial'
                      ? 'bg-[#C89A2B] text-[#6B3F1D] border-[#C89A2B] shadow-xl ring-2 ring-[#C89A2B]/50'
                      : 'bg-white/10 text-white border-white/20 hover:border-[#C89A2B]/50 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base">Managerial Track</h4>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                      roleType === 'Managerial' ? 'bg-[#6B3F1D] text-[#C89A2B]' : 'bg-[#C89A2B]/20 text-[#C89A2B]'
                    }`}>
                      Manager Role
                    </span>
                  </div>
                  <p className="text-xs font-semibold opacity-90">Role Access: MANAGER</p>
                  <p className="text-[11px] opacity-80 mt-2 leading-relaxed">
                    Designed for Branch Operations Managers & Supervisors. Automatically assigns you as the official Manager of <strong>{(districtBranches.find(b => b.id === selectedBranchId) || branches.find(b => b.id === selectedBranchId) || initialBranches.find(b => b.id === selectedBranchId))?.name || 'this Branch'}</strong> with full authority over branch staff.
                  </p>
                  {roleType === 'Managerial' && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs font-extrabold text-[#6B3F1D]">
                      <Check className="w-4 h-4" />
                      <span>Assigned as Official Branch Manager</span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRoleType('Non-Managerial')}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    roleType === 'Non-Managerial'
                      ? 'bg-[#C89A2B] text-[#6B3F1D] border-[#C89A2B] shadow-xl ring-2 ring-[#C89A2B]/50'
                      : 'bg-white/10 text-white border-white/20 hover:border-[#C89A2B]/50 hover:bg-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base">Non-Managerial Track</h4>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${
                      roleType === 'Non-Managerial' ? 'bg-[#6B3F1D] text-[#C89A2B]' : 'bg-[#C89A2B]/20 text-[#C89A2B]'
                    }`}>
                      Employee Role
                    </span>
                  </div>
                  <p className="text-xs font-semibold opacity-90">Role Access: EMPLOYEE</p>
                  <p className="text-[11px] opacity-80 mt-2 leading-relaxed">
                    Designed for Customer Service Officers & Tellers. Automatically assigns you as an employee under <strong>{(districtBranches.find(b => b.id === selectedBranchId) || branches.find(b => b.id === selectedBranchId) || initialBranches.find(b => b.id === selectedBranchId))?.name || 'this Branch'}</strong>'s designated manager.
                  </p>
                  {roleType === 'Non-Managerial' && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs font-extrabold text-[#6B3F1D]">
                      <Check className="w-4 h-4" />
                      <span>Assigned as Branch Employee</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Account & Validation */}
          {step === 5 && (
            <div className="space-y-3.5">
              <div className="flex items-center space-x-3 mb-2">
                <Lock className="w-6 h-6 text-[#C89A2B]" />
                <h3 className="text-lg font-bold text-white">Step 5: Account Credentials & Security</h3>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-gray-200">User ID / Staff ID (Numerals Only)</label>
                  {userIdStatus.checked && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      userIdStatus.available 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    }`}>
                      {userIdStatus.available ? '✓ User ID Available' : `✕ ${userIdStatus.message || 'Invalid User ID'}`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. 4994, 1245, 687"
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-200 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-gray-200">Confirm Password</label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-bold ${
                        password === confirmPassword ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {password === confirmPassword ? '✓ Match' : '✕ Mismatch'}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-xs text-white focus:outline-none focus:border-[#C89A2B]"
                  />
                </div>
              </div>

              {/* Password Requirement Checklist */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 text-[11px] space-y-2">
                <p className="font-bold text-gray-200 text-[10px]">Password Complexity Rules:</p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.minLen ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {pwdCriteria.minLen ? '✓' : '○'} Min 8 Characters
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasUpper ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {pwdCriteria.hasUpper ? '✓' : '○'} Uppercase Letter (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasLower ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {pwdCriteria.hasLower ? '✓' : '○'} Lowercase Letter (a-z)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasNum ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {pwdCriteria.hasNum ? '✓' : '○'} Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold col-span-2 ${pwdCriteria.hasSpecial ? 'text-emerald-400' : 'text-gray-300'}`}>
                    {pwdCriteria.hasSpecial ? '✓' : '○'} Special Symbol (!@#$%^&*)
                  </span>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-200">
                    <span>Password Security Level:</span>
                    <span className="font-bold text-[#C89A2B]">{strength.label}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className={`${strength.color} h-full transition-all`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs text-gray-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="rounded border-white/20 bg-white/10 text-[#C89A2B]"
                  />
                  <span>I accept Bunna Bank S.C. EPMS Terms of Service & Security Guidelines.</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-white/10">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { onClose(); onOpenLogin(); }}
                className="text-xs text-[#C89A2B] font-semibold hover:underline"
              >
                Already have an account? Login
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#C89A2B] text-[#6B3F1D] font-bold text-xs hover:bg-[#D8B45C]"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-bold text-xs shadow-xl"
              >
                {loading ? 'Creating Account...' : 'Submit Registration'}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
