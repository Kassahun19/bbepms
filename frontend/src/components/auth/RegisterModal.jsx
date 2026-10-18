import React, { useState, useEffect } from "react";
import { X, Check, AlertCircle, Shield, Building, MapPin, User as UserIcon, Lock, Search, Filter, RotateCcw } from "lucide-react";
import { api } from "../../services/api";
import { initialDistricts, initialBranches } from "../../data/mockData";
import { ModalCloseButton } from "../common/ModalCloseButton";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export const RegisterModal = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onOpenLogin
}) => {
  const [step, setStep] = useState(1);
  const [districts, setDistricts] = useState(initialDistricts);
  const [branches, setBranches] = useState(initialBranches);
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [districtSearchQuery, setDistrictSearchQuery] = useState("");
  const [selectedRegionFilter, setSelectedRegionFilter] = useState("ALL");
  const [branchSearchQuery, setBranchSearchQuery] = useState("");
  const [selectedBranchTypeFilter, setSelectedBranchTypeFilter] = useState("ALL");

  const availableRegions = Array.from(new Set(districts.map((d) => d.region).filter(Boolean)));
  
  const filteredDistricts = districts.filter((d) => {
    const query = (districtSearchQuery || "").toLowerCase().trim();
    const matchesQuery = !query || 
      (d.name && d.name.toLowerCase().includes(query)) || 
      (d.solId && d.solId.toLowerCase().includes(query)) || 
      (d.code && d.code.toLowerCase().includes(query)) || 
      (d.region && d.region.toLowerCase().includes(query)) || 
      (d.managerName && d.managerName.toLowerCase().includes(query)) || 
      (d.type && d.type.toLowerCase().includes(query));
    const matchesRegion = selectedRegionFilter === "ALL" || d.region === selectedRegionFilter;
    return matchesQuery && matchesRegion;
  });

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId) || initialDistricts.find((d) => d.id === selectedDistrictId);

  // Bulletproof districtBranches memo with robust fallback so it's never 0 Available
  const districtBranches = React.useMemo(() => {
    let matched = [];
    if (selectedDistrictId) {
      matched = branches.filter((b) => {
        if (!b) return false;
        if (b.districtId === selectedDistrictId) return true;
        if (selectedDistrict) {
          if (b.districtId === selectedDistrict.id || b.districtId === selectedDistrict.code) return true;
          if (b.districtName && selectedDistrict.name && b.districtName.toLowerCase().trim() === selectedDistrict.name.toLowerCase().trim()) return true;
          if (selectedDistrict.code && b.districtId && b.districtId.includes(selectedDistrict.code)) return true;
        }
        return false;
      });
    }

    if (matched.length === 0) {
      // Fallback to all branches or initial branches so user always has branches available
      matched = branches.length > 0 ? branches : initialBranches;
    }
    return matched;
  }, [branches, selectedDistrictId, selectedDistrict]);

  const availableBranchTypes = Array.from(new Set(districtBranches.map((b) => b.type).filter(Boolean)));

  const filteredBranches = React.useMemo(() => {
    return districtBranches.filter((b) => {
      const query = (branchSearchQuery || "").toLowerCase().trim();
      const matchesQuery = !query || 
        (b.name && b.name.toLowerCase().includes(query)) || 
        (b.code && b.code.toLowerCase().includes(query)) || 
        (b.solId && b.solId.toLowerCase().includes(query)) || 
        (b.type && b.type.toLowerCase().includes(query)) || 
        (b.location && b.location.toLowerCase().includes(query)) || 
        (b.managerName && b.managerName.toLowerCase().includes(query));
      const matchesType = selectedBranchTypeFilter === "ALL" || b.type === selectedBranchTypeFilter;
      return matchesQuery && matchesType;
    });
  }, [districtBranches, branchSearchQuery, selectedBranchTypeFilter]);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState(28);
  const [phone, setPhone] = useState("+251911223344");
  const [email, setEmail] = useState("");
  const [roleType, setRoleType] = useState("Non-Managerial");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [userIdStatus, setUserIdStatus] = useState({
    checked: false,
    available: false,
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      api.getDistricts().then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDistricts(data);
        } else {
          setDistricts(initialDistricts);
        }
      }).catch((err) => {
        console.error("Failed to load districts:", err);
        setDistricts(initialDistricts);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDistrictId) {
      api.getBranches(selectedDistrictId).then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
        } else {
          setBranches(initialBranches);
        }
      }).catch((err) => {
        console.error("Failed to load branches:", err);
        setBranches(initialBranches);
      });
    }
  }, [selectedDistrictId]);

  useEffect(() => {
    const trimmed = userId.trim();
    if (!trimmed) {
      setUserIdStatus({ checked: false, available: false, message: "" });
      return;
    }
    if (trimmed.length < 2) {
      setUserIdStatus({ checked: true, available: false, message: "User Name must be at least 2 characters." });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.validateUserId(trimmed);
        setUserIdStatus({ checked: true, available: res.available, message: res.message });
      } catch (err) {
        setUserIdStatus({ checked: true, available: true, message: "Ready" });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [userId]);

  const pwdCriteria = {
    minLen: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNum: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "None", color: "bg-gray-300" };
    let score = 0;
    if (pwdCriteria.minLen) score++;
    if (pwdCriteria.hasUpper) score++;
    if (pwdCriteria.hasLower) score++;
    if (pwdCriteria.hasNum) score++;
    if (pwdCriteria.hasSpecial) score++;
    if (score <= 2) return { score: 30, label: "Weak", color: "bg-rose-500" };
    if (score <= 4) return { score: 70, label: "Fair / Good", color: "bg-amber-500" };
    return { score: 100, label: "Strong (Compliant)", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleNext = () => {
    setError("");
    if (step === 1 && !selectedDistrictId) {
      setError("Please select a District or Area Office.");
      return;
    }
    if (step === 2 && !selectedBranchId) {
      setError("Please select a Branch.");
      return;
    }
    if (step === 3) {
      if (!firstName || !lastName || !email || !phone) {
        setError("Please complete all personal information fields.");
        return;
      }
      if (!email.includes("@")) {
        setError("Please provide a valid email address.");
        return;
      }
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }
    if (!acceptTerms) {
      setError("You must accept the terms and security policies to register.");
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
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const hasUnsavedChanges = Boolean(
    selectedDistrictId || selectedBranchId || firstName || lastName || phone || email || userId || step > 1
  );

  const { contentRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
    hasUnsavedChanges,
    unsavedMessage: "You have entered registration data. Are you sure you want to close without completing registration?"
  });

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-start justify-center pt-6 sm:pt-12 md:pt-16 pb-8 px-4"
    >
      <div
        ref={contentRef}
        className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl text-gray-900 overflow-hidden p-6 sm:p-8 relative"
      >
        <div className="absolute top-5 right-5 z-10">
          <ModalCloseButton onClose={onClose} ariaLabel="Close registration dialog" />
        </div>

        {/* Wizard Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-bold text-[#541818] mb-2">
            <span>Step {step} of 5</span>
            <span>
              {step === 1 && "District Selection"}
              {step === 2 && "Branch Selection"}
              {step === 3 && "Personal Details"}
              {step === 4 && "Role Selection"}
              {step === 5 && "Account Credentials"}
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-[#541818] h-full transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: District Search Engine */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-6 h-6 text-[#541818]" />
                  <h3 className="text-lg font-bold text-gray-900">Step 1: Select District / Area Office</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#541818]/10 text-[#541818] border border-[#541818]/20">
                  Search Active
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Use the search engine below to quickly locate your assigned District Office by Name, SOL ID, Region, or Code.
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={districtSearchQuery}
                    onChange={(e) => setDistrictSearchQuery(e.target.value)}
                    placeholder="Search district by name, SOL ID, region, or code..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541818] text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                  />
                  {districtSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDistrictSearchQuery("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {availableRegions.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    <span className="text-gray-700 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#541818]" /> Region:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRegionFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${selectedRegionFilter === "ALL" ? "bg-[#541818] text-white font-bold shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      All ({districts.length})
                    </button>
                    {availableRegions.map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setSelectedRegionFilter(reg)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${selectedRegionFilter === reg ? "bg-[#541818] text-white font-bold shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {reg} ({districts.filter((d) => d.region === reg).length})
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-600 px-1">
                  <span>
                    Found <strong className="text-[#541818]">{filteredDistricts.length}</strong> district{filteredDistricts.length === 1 ? "" : "s"} matching criteria
                  </span>
                  {(districtSearchQuery || selectedRegionFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictSearchQuery("");
                        setSelectedRegionFilter("ALL");
                      }}
                      className="text-[#541818] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-52 overflow-y-auto pr-1 space-y-2 rounded-2xl p-1.5 bg-gray-50 border border-gray-200">
                {filteredDistricts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-600 space-y-2">
                    <MapPin className="w-8 h-8 mx-auto opacity-40 text-[#541818]" />
                    <p>No district or area office found matching "{districtSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setDistrictSearchQuery("");
                        setSelectedRegionFilter("ALL");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#541818] text-white font-bold text-[11px] inline-block hover:bg-[#3d1011]"
                    >
                      Clear Search Query
                    </button>
                  </div>
                ) : (
                  filteredDistricts.map((d) => {
                    const isSelected = selectedDistrictId === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => {
                          setSelectedDistrictId(d.id);
                          setSelectedBranchId("");
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${isSelected ? "bg-[#541818]/10 border-[#541818] shadow-md ring-1 ring-[#541818]/30" : "bg-white border-gray-200 hover:border-[#541818]/50 hover:bg-gray-50"}`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-gray-950 truncate">{d.name}</span>
                            {d.solId && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#541818]/10 text-[#541818] border border-[#541818]/20">
                                SOL {d.solId}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>Region: <strong className="text-gray-900">{d.region}</strong></span>
                            <span>Code: <strong className="text-gray-900">{d.code}</strong></span>
                            {d.managerName && <span>Manager: <strong className="text-gray-900">{d.managerName}</strong></span>}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center space-x-2 pt-0.5">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#541818] text-white flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 hover:border-[#541818]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Or select directly from District dropdown:
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => {
                    setSelectedDistrictId(e.target.value);
                    setSelectedBranchId("");
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541818] text-xs text-gray-900 focus:outline-none shadow-sm"
                >
                  <option key="empty-district" value="">-- Choose District Office --</option>
                  {districts.map((d, index) => (
                    <option key={d.id || d.districtId || `dist-opt-${index}`} value={d.id}>
                      {d.name} {d.solId ? `(SOL ${d.solId})` : `(${d.code})`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDistrictId && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800">
                  <div className="font-bold text-[#541818] mb-1">Selected Location:</div>
                  {(() => {
                    const sel = districts.find((d) => d.id === selectedDistrictId);
                    if (!sel) return null;
                    return (
                      <div>
                        <span className="font-semibold text-gray-900">{sel.name}</span> • Region: {sel.region} • Managed by {sel.managerName}
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
                  <Building className="w-6 h-6 text-[#541818]" />
                  <h3 className="text-lg font-bold text-gray-900">Step 2: Select Branch</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#541818]/10 text-[#541818] border border-[#541818]/20">
                  Search Active
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Use the branch search engine below to locate your specific branch under <span className="text-[#541818] font-semibold">{districts.find((d) => d.id === selectedDistrictId)?.name || "Selected District"}</span>.
              </p>

              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={branchSearchQuery}
                    onChange={(e) => setBranchSearchQuery(e.target.value)}
                    placeholder="Search branch by name, code, type (Grade I, Grade II)..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541818] text-xs text-gray-900 placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                  />
                  {branchSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setBranchSearchQuery("")}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-700"
                      title="Clear branch search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {availableBranchTypes.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    <span className="text-gray-700 text-[10px] font-semibold shrink-0 flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#541818]" /> Type:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedBranchTypeFilter("ALL")}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${selectedBranchTypeFilter === "ALL" ? "bg-[#541818] text-white font-bold shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      All ({districtBranches.length})
                    </button>
                    {availableBranchTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedBranchTypeFilter(type)}
                        className={`px-2.5 py-1 rounded-lg shrink-0 font-medium transition-all ${selectedBranchTypeFilter === type ? "bg-[#541818] text-white font-bold shadow" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        {type} ({districtBranches.filter((b) => b.type === type).length})
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-600 px-1">
                  <span>
                    Found <strong className="text-[#541818]">{filteredBranches.length}</strong> branch{filteredBranches.length === 1 ? "" : "es"} in <span className="text-gray-900 font-semibold">{districts.find((d) => d.id === selectedDistrictId)?.name || "District"}</span>
                  </span>
                  {(branchSearchQuery || selectedBranchTypeFilter !== "ALL") && (
                    <button
                      type="button"
                      onClick={() => {
                        setBranchSearchQuery("");
                        setSelectedBranchTypeFilter("ALL");
                      }}
                      className="text-[#541818] hover:underline flex items-center gap-1 text-[10px] font-semibold"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-56 overflow-y-auto pr-1 space-y-2 rounded-2xl p-1.5 bg-gray-50 border border-gray-200">
                {filteredBranches.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-600 space-y-2">
                    <Building className="w-8 h-8 mx-auto opacity-40 text-[#541818]" />
                    <p>No branch found matching "{branchSearchQuery}"</p>
                    <button
                      type="button"
                      onClick={() => {
                        setBranchSearchQuery("");
                        setSelectedBranchTypeFilter("ALL");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#541818] text-white font-bold text-[11px] inline-block hover:bg-[#3d1011]"
                    >
                      Clear Branch Search
                    </button>
                  </div>
                ) : (
                  filteredBranches.map((b) => {
                    const isSelected = selectedBranchId === b.id;
                    const cleanName = b.name.replace(/Branch/gi, "").trim();
                    return (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBranchId(b.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${isSelected ? "bg-[#541818]/10 border-[#541818] shadow-md ring-1 ring-[#541818]/30" : "bg-white border-gray-200 hover:border-[#541818]/50 hover:bg-gray-50"}`}
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-gray-950 truncate">{cleanName} Branch</span>
                            {b.solId && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#541818]/10 text-[#541818] border border-[#541818]/20">
                                SOL {b.solId}
                              </span>
                            )}
                            {b.type && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-gray-100 text-gray-700">
                                {b.type}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-600 flex flex-wrap gap-x-3 gap-y-0.5">
                            {b.location && <span>Location: <strong className="text-gray-900">{b.location}</strong></span>}
                            {b.managerName && <span>Manager: <strong className="text-gray-900">{b.managerName}</strong></span>}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center space-x-2">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#541818] text-white flex items-center justify-center font-bold">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-gray-300 hover:border-[#541818]" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Or select directly from Branch dropdown:
                </label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 focus:border-[#541818] text-xs text-gray-900 focus:outline-none shadow-sm"
                >
                  <option key="empty-branch" value="">-- Choose Branch ({districtBranches.length} Available) --</option>
                  {districtBranches.map((b, index) => {
                    const cleanName = b.name.replace(/Branch/gi, "").trim();
                    return (
                      <option key={b.id || b.branchId || `branch-opt-${index}`} value={b.id}>
                        {cleanName} Branch — {b.solId ? `SOL ID: ${b.solId}` : `Code: ${b.code}`} ({b.type || "Standard"})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBranchId && (
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800">
                  {(() => {
                    const b = districtBranches.find((br) => br.id === selectedBranchId) || branches.find((br) => br.id === selectedBranchId) || initialBranches.find((br) => br.id === selectedBranchId);
                    if (!b) return null;
                    return (
                      <div className="space-y-1">
                        <div className="font-bold text-[#541818] flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{b.name.replace(/Branch/gi, "").trim()} Branch</span>
                          {b.solId && <span className="font-mono text-xs text-gray-600">(SOL {b.solId})</span>}
                        </div>
                        <div className="text-gray-700">
                          Branch Code: <span className="font-mono text-gray-900">{b.code}</span> • Type: <span className="text-gray-900">{b.type}</span>
                        </div>
                        <div className="text-gray-700">
                          Location: <span className="text-gray-900">{b.location}</span> • Branch Manager: <span className="text-gray-900">{b.managerName}</span>
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
                <UserIcon className="w-6 h-6 text-[#541818]" />
                <h3 className="text-lg font-bold text-gray-900">Step 3: Personal Information</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Abebe"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="e.g. Kebede"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Teso"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@bunnabanksc.com"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Choose Role */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-6 h-6 text-[#541818]" />
                <h3 className="text-lg font-bold text-gray-900">Step 4: Select Employment Category & Role Access</h3>
              </div>

              <p className="text-xs text-gray-600">
                Please select your employment role type at Bunna Bank S.C. Selecting Managerial grants you full Managerial Role access (Manager Dashboard, Team Approvals, Reports). Selecting Non-Managerial grants you Employee Role access (Employee Dashboard, My Performance, My Reports).
              </p>

              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-800 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-gray-600">Assigned Location:</span>{" "}
                  <strong className="text-gray-900">{selectedDistrict?.name || "District"}</strong>{" "}
                  • <strong className="text-[#541818]">{(districtBranches.find((b) => b.id === selectedBranchId) || branches.find((b) => b.id === selectedBranchId) || initialBranches.find((b) => b.id === selectedBranchId))?.name || "Branch"}</strong>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#541818]/10 border border-[#541818]/20 text-[#541818]">
                  Automatic Role Routing
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setRoleType("Managerial")}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${roleType === "Managerial" ? "bg-[#541818] text-white border-[#541818] shadow-xl ring-2 ring-[#541818]/50" : "bg-white text-gray-900 border-gray-200 hover:border-[#541818]/50 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base">Managerial Track</h4>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${roleType === "Managerial" ? "bg-white text-[#541818]" : "bg-[#541818]/10 text-[#541818]"}`}>
                      Manager Role
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${roleType === "Managerial" ? "text-gray-100" : "text-gray-600"}`}>Role Access: MANAGER</p>
                  <p className={`text-[11px] mt-2 leading-relaxed ${roleType === "Managerial" ? "text-gray-200" : "text-gray-600"}`}>
                    Designed for Branch Operations Managers & Supervisors. Automatically assigns you as the official Manager of <strong>{(districtBranches.find((b) => b.id === selectedBranchId) || branches.find((b) => b.id === selectedBranchId) || initialBranches.find((b) => b.id === selectedBranchId))?.name || "this Branch"}</strong>.
                  </p>
                  {roleType === "Managerial" && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs font-extrabold text-[#D4A017]">
                      <Check className="w-4 h-4" />
                      <span>Assigned as Official Branch Manager</span>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRoleType("Non-Managerial")}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden ${roleType === "Non-Managerial" ? "bg-[#541818] text-white border-[#541818] shadow-xl ring-2 ring-[#541818]/50" : "bg-white text-gray-900 border-gray-200 hover:border-[#541818]/50 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-base">Non-Managerial Track</h4>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md ${roleType === "Non-Managerial" ? "bg-white text-[#541818]" : "bg-[#541818]/10 text-[#541818]"}`}>
                      Employee Role
                    </span>
                  </div>
                  <p className={`text-xs font-semibold ${roleType === "Non-Managerial" ? "text-gray-100" : "text-gray-600"}`}>Role Access: EMPLOYEE</p>
                  <p className={`text-[11px] mt-2 leading-relaxed ${roleType === "Non-Managerial" ? "text-gray-200" : "text-gray-600"}`}>
                    Designed for Customer Service Officers & Tellers. Automatically assigns you as an employee under <strong>{(districtBranches.find((b) => b.id === selectedBranchId) || branches.find((b) => b.id === selectedBranchId) || initialBranches.find((b) => b.id === selectedBranchId))?.name || "this Branch"}</strong>.
                  </p>
                  {roleType === "Non-Managerial" && (
                    <div className="mt-3 flex items-center space-x-1.5 text-xs font-extrabold text-[#D4A017]">
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
                <Lock className="w-6 h-6 text-[#541818]" />
                <h3 className="text-lg font-bold text-gray-900">Step 5: Account Credentials & Security</h3>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-semibold text-gray-700">User Name</label>
                  {userIdStatus.checked && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${userIdStatus.available ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`}>
                      {userIdStatus.available ? "✓ User Name Available" : `✕ ${userIdStatus.message || "Invalid User Name"}`}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter User Name"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-semibold text-gray-700">Confirm Password</label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-bold ${password === confirmPassword ? "text-emerald-600" : "text-rose-600"}`}>
                        {password === confirmPassword ? "✓ Match" : "✕ Mismatch"}
                      </span>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#541818] shadow-sm"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] space-y-2">
                <p className="font-bold text-gray-800 text-[10px]">Password Complexity Rules:</p>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.minLen ? "text-emerald-700" : "text-gray-500"}`}>
                    {pwdCriteria.minLen ? "✓" : "○"} Min 8 Characters
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasUpper ? "text-emerald-700" : "text-gray-500"}`}>
                    {pwdCriteria.hasUpper ? "✓" : "○"} Uppercase Letter (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasLower ? "text-emerald-700" : "text-gray-500"}`}>
                    {pwdCriteria.hasLower ? "✓" : "○"} Lowercase Letter (a-z)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold ${pwdCriteria.hasNum ? "text-emerald-700" : "text-gray-500"}`}>
                    {pwdCriteria.hasNum ? "✓" : "○"} Number (0-9)
                  </span>
                  <span className={`flex items-center gap-1 font-semibold col-span-2 ${pwdCriteria.hasSpecial ? "text-emerald-700" : "text-gray-500"}`}>
                    {pwdCriteria.hasSpecial ? "✓" : "○"} Special Symbol (!@#$%^&*)
                  </span>
                </div>
              </div>

              {password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-gray-700">
                    <span>Password Security Level:</span>
                    <span className="font-bold text-[#541818]">{strength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`${strength.color} h-full transition-all`} style={{ width: `${strength.score}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <label className="flex items-center space-x-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="rounded border-gray-300 text-[#541818] focus:ring-[#541818]"
                  />
                  <span>I accept Bunna Bank S.C. EPMS Terms of Service & Security Guidelines.</span>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-200">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs hover:bg-gray-200 transition-all"
              >
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="text-xs text-[#541818] font-semibold hover:underline"
              >
                Already have an account? Login
              </button>
            )}

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-[#541818] text-white font-bold text-xs hover:bg-[#3d1011] transition-all shadow-md"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#541818] text-white font-bold text-xs hover:bg-[#3d1011] transition-all shadow-xl"
              >
                {loading ? "Creating Account..." : "Submit Registration"}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
