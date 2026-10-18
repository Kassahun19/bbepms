import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  Zap,
  Globe2,
  Users,
  CheckCircle2,
  ShieldCheck,
  Target,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { translations } from "../../i18n/translations";
import { BunnaBankLogo } from "./BunnaBankLogo";
import { api } from "../../services/api";

export const AboutPage = ({ language = "en", onGetStarted, onOpenContact }) => {
  const t = translations[language] || translations["en"];
  const [districtsCount, setDistrictsCount] = useState(34);
  const [branchesCount, setBranchesCount] = useState(565);
  const [employeesCount, setEmployeesCount] = useState(15);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dRes, bRes, uRes] = await Promise.all([
          api.getDistricts(),
          api.getBranches(),
          api.getUsers()
        ]);
        if (dRes && dRes.data) setDistrictsCount(dRes.data.length);
        if (bRes && bRes.data) setBranchesCount(bRes.data.length);
        if (uRes && uRes.data) setEmployeesCount(uRes.data.length);
      } catch (e) {
        // Fallbacks preserved
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 space-y-12 py-6">
      
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-white border border-gray-200 p-8 sm:p-12 overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#541818]/10 border border-[#541818]/20 text-[#541818] text-xs font-bold uppercase tracking-wider">
            <BunnaBankLogo className="w-4 h-4" variant="gold" />
            <span>Bunna Bank S.C. — Bank of the Visionaries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#541818] leading-tight">
            Daily KPI Management System
          </h1>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            The Daily KPI Management System is Bunna Bank S.C.’s enterprise platform for monitoring, recording, tracking, and evaluating employees’ daily performance. It provides accurate and transparent visibility into daily targets, achievements, performance gaps, and progress, enabling employees and managers to make data-driven decisions and continuously improve performance.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {onGetStarted && (
              <button
                onClick={onGetStarted}
                className="px-6 py-3 rounded-2xl bg-[#541818] hover:bg-[#3d1011] text-white font-bold text-sm shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Access EPMS Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm transition-all cursor-pointer"
              >
                Contact EPMS Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Institutional Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#541818] text-white flex items-center justify-center font-bold shadow-sm">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-wide">Objective Performance Tracking</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Eliminating guesswork by capturing quantifiable daily figures across 8 vital banking products: Deposits, FCY Inflows, Digital Financial Services, Account Acquisition, and Digital Channels.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#541818] text-white flex items-center justify-center font-bold shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-wide">Multi-Tier Approval Governance</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Ensuring data integrity through systematic Branch Manager review, district oversight, and comprehensive audit trails for every single daily submission.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-3 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-[#541818] text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-wide">AI-Powered Performance Insights</h3>
          <p className="text-xs text-gray-600 font-medium leading-relaxed">
            Equipped with Bunna AI Assistant to provide staff and branch managers with automated performance summaries, milestone projections, and policy compliance guidance.
          </p>
        </div>
      </div>

      {/* Institutional Statistics */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm">
        <h3 className="text-xl font-bold text-[#541818] text-center mb-8 uppercase tracking-wider">
          Bunna Bank EPMS at a Glance
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <p className="text-3xl font-extrabold text-[#541818]">{districtsCount > 0 ? `${districtsCount}` : "34"}</p>
            <p className="text-xs text-gray-600 font-semibold">Districts & Area Offices</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <p className="text-3xl font-extrabold text-[#541818]">{branchesCount > 0 ? `${branchesCount}` : "565"}</p>
            <p className="text-xs text-gray-600 font-semibold">Branches Nationwide</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <p className="text-3xl font-extrabold text-[#541818]">{employeesCount > 0 ? `${employeesCount}` : "Active"}</p>
            <p className="text-xs text-gray-600 font-semibold">Active Employees</p>
          </div>
          <div className="space-y-1 p-4 rounded-2xl bg-white border border-gray-200 shadow-xs">
            <p className="text-3xl font-extrabold text-[#425727]">100%</p>
            <p className="text-xs text-gray-600 font-semibold">Audited Data Accuracy</p>
          </div>
        </div>
      </div>

      {/* Product Scope Overview Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">Monitored Banking Products & KPIs</h3>
          <p className="text-xs text-gray-600 font-medium">
            Bunna Bank EPMS evaluates employee productivity across 8 standardized Key Performance Indicators (KPIs):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Deposits Mobilized", desc: "Savings, Demand, and Fixed Deposits in ETB", icon: TrendingUp },
            { title: "Foreign Currency Inflow", desc: "Export trade earnings, SWIFT remittances & FCY deposits", icon: Globe2 },
            { title: "Digital Financial Services", desc: "Transaction volumes across Bunna Mobile & Internet Banking", icon: Zap },
            { title: "Account Openings", desc: "Individual, Joint, and Corporate new customer accounts", icon: Users },
            { title: "Mobile Banking Activations", desc: "Onboarded active users on Bunna Mobile App & USSD", icon: CheckCircle2 },
            { title: "Internet Banking Activations", desc: "Corporate and retail internet banking client activations", icon: Globe2 },
            { title: "Merchant Solutions & QR", desc: "Bunna Merchant POS terminals and QR code deployment", icon: Award },
            { title: "ATM Card Activations", desc: "Issued and activated Bunna Debit & Prepaid ATM Cards", icon: ShieldCheck }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 space-y-2 shadow-xs transition-all">
                <div className="w-8 h-8 rounded-xl bg-[#541818] text-white flex items-center justify-center font-bold shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed font-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AboutPage;
