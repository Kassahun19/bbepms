import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Globe
} from "lucide-react";
import { translations } from "../../i18n/translations";
import { BunnaBankLogo } from "./BunnaBankLogo";

export const Header = ({
  language = "en",
  onLanguageChange,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenProfile,
  currentNavView = "home",
  onNavigate
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileRef = useRef(null);

  const t = translations[language] || translations["en"];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (mobileRef.current && !mobileRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = (user) => {
    if (!user) return "U";
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.slice(0, 2).toUpperCase();
    }
    return (user.firstName?.[0] || user.username?.[0] || "U").toUpperCase();
  };

  const getUserFullName = (user) => {
    if (!user) return "User";
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.name || user.username || "Bunna Employee";
  };

  const getRoleBadgeLabel = (role) => {
    switch (role) {
      case "BANK_SUPER_ADMIN":
        return "Bank Super Admin";
      case "ADMINISTRATOR":
        return "HQ Administrator";
      case "CEO":
        return "Chief Executive Officer";
      case "BOARD_OF_DIRECTORS":
        return "Board of Directors";
      case "CHIEF_OFFICER":
        return "Chief Officer";
      case "DIRECTOR":
        return "Director";
      case "DISTRICT_DIRECTOR":
        return "District Director";
      case "MANAGER":
        return "Branch Manager";
      case "EMPLOYEE":
        return "Staff Member";
      default:
        return role ? role.replace(/_/g, " ") : "Member";
    }
  };

  const navLinks = [
    { id: "home", label: t.home || "Home" },
    { id: "about", label: t.about || "About" },
    { id: "howItWorks", label: t.howItWorks || "How It Works" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 text-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Side: Brand Logo & 3 Public Nav Links */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate && onNavigate("home")}
              className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-[#541818] p-1.5 shadow-sm flex items-center justify-center group-hover:opacity-95 transition-all">
                <BunnaBankLogo className="w-7 h-7" variant="gold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-lg tracking-tight text-[#541818]">
                    {t.bankName || "Bunna Bank"}
                  </span>
                  <span className="bg-[#541818]/10 text-[#541818] border border-[#541818]/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    EPMS
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">
                  {t.tagline || "Performance Management System"}
                </p>
              </div>
            </button>

            {/* Exactly 3 Public Navigation Links on Left */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = currentNavView === link.id || (link.id === "howItWorks" && currentNavView === "contact");
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate && onNavigate(link.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "text-[#541818] bg-[#541818]/10 font-bold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Side: Language Switcher + Login Button or Profile Avatar */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Clean Language Switcher */}
            {onLanguageChange && (
              <div className="flex items-center border border-gray-200 rounded-lg p-0.5 text-xs font-semibold text-gray-600">
                <button
                  onClick={() => onLanguageChange("en")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    language === "en" || language === "EN"
                      ? "bg-[#541818] text-white"
                      : "hover:text-gray-900"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => onLanguageChange("am")}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    language === "am" || language === "AM"
                      ? "bg-[#541818] text-white"
                      : "hover:text-gray-900"
                  }`}
                >
                  አማ
                </button>
              </div>
            )}

            {/* Unauthenticated: Show Brand Colored Login Button */}
            {!currentUser ? (
              <button
                onClick={onOpenLogin}
                className="px-5 py-2.5 rounded-xl bg-[#541818] hover:bg-[#3d1011] text-white font-semibold text-sm shadow-sm transition-all transform active:scale-95 cursor-pointer"
              >
                {t.login || "Login"}
              </button>
            ) : (
              /* Authenticated: Show Profile Avatar with Initial Fallback & Small Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none cursor-pointer"
                  title={getUserFullName(currentUser)}
                  aria-expanded={profileDropdownOpen}
                >
                  <div className="w-10 h-10 rounded-full bg-[#541818] text-white font-bold flex items-center justify-center text-sm shadow-sm border border-gray-200 ring-2 ring-[#541818]/20">
                    {getUserInitials(currentUser)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {/* Small Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 text-xs overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#541818] text-white font-bold flex items-center justify-center text-sm shadow shrink-0">
                          {getUserInitials(currentUser)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {getUserFullName(currentUser)}
                          </p>
                          <p className="text-gray-500 text-xs truncate">
                            {currentUser.email || currentUser.username}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#541818]/10 text-[#541818]">
                            {getRoleBadgeLabel(currentUser.role)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 space-y-1">
                      {onOpenProfile && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            onOpenProfile();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 flex items-center space-x-2.5 transition-colors font-medium cursor-pointer"
                        >
                          <UserIcon className="w-4 h-4 text-[#541818]" />
                          <span>My Profile</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          if (onLogout) onLogout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2.5 transition-colors font-semibold cursor-pointer border-t border-gray-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.logout || "Logout"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            {onLanguageChange && (
              <button
                onClick={() => onLanguageChange(language === "en" ? "am" : "en")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-[#541818] text-xs font-bold"
              >
                {language === "en" ? "አማርኛ" : "English"}
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Menu */}
      {mobileMenuOpen && (
        <div
          ref={mobileRef}
          className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3 shadow-lg"
        >
          {/* Exactly 3 Navigation Links: Home, About, How It Works */}
          <div className="grid grid-cols-3 gap-2 pb-3 border-b border-gray-100">
            {navLinks.map((link) => {
              const isActive = currentNavView === link.id || (link.id === "howItWorks" && currentNavView === "contact");
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    if (onNavigate) onNavigate(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold text-center transition-colors ${
                    isActive
                      ? "bg-[#541818] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* User Account / Login on Mobile */}
          <div className="pt-1">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 rounded-full bg-[#541818] text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {getUserInitials(currentUser)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {getUserFullName(currentUser)}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">
                      {getRoleBadgeLabel(currentUser.role)}
                    </p>
                  </div>
                </div>

                {onOpenProfile && (
                  <button
                    onClick={() => {
                      onOpenProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2"
                  >
                    <UserIcon className="w-4 h-4 text-[#541818]" />
                    <span>My Profile</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-red-50 text-red-600 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logout || "Logout"}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (onOpenLogin) onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#541818] text-white font-bold rounded-xl text-xs shadow-sm hover:bg-[#3d1011]"
              >
                {t.login || "Login"}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
