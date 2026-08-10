import React, { useState, useEffect } from 'react';
import {
  Building2,
  Target,
  ShieldCheck,
  Award,
  Users,
  Zap,
  CheckCircle2,
  Globe2,
  TrendingUp,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { BunnaBankLogo } from './BunnaBankLogo';
import { api } from '../../services/api';

interface AboutPageProps {
  language: Language;
  onGetStarted?: () => void;
  onOpenContact?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  language,
  onGetStarted,
  onOpenContact
}) => {
  const t = translations[language] || translations['en'];

  const [districtsCount, setDistrictsCount] = useState<number>(0);
  const [branchesCount, setBranchesCount] = useState<number>(0);
  const [employeesCount, setEmployeesCount] = useState<number>(0);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [dList, bList, eList] = await Promise.all([
          api.getDistricts(),
          api.getBranches(),
          api.getEmployees()
        ]);
        setDistrictsCount(dList.length);
        setBranchesCount(bList.length);
        setEmployeesCount(eList.length);
      } catch (err) {
        console.warn('Failed to load AboutPage live stats', err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-12 py-4 text-white">
      
      {/* Hero Banner Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#6B3F1D] via-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C89A2B]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] text-xs font-bold uppercase tracking-wider">
            <BunnaBankLogo className="w-4 h-4" variant="gold" />
            <span>Bunna Bank S.C. — Bank of the Visionaries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            Empowering Workforce Potential through Technology & Excellence
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            The Employee Performance Management System (EPMS) is Bunna Bank’s official enterprise framework designed to monitor, evaluate, and elevate performance across all 25+ Districts and 500+ Branches nationwide.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            {onGetStarted && (
              <button
                onClick={onGetStarted}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-bold text-sm shadow-xl hover:opacity-95 transition-all flex items-center space-x-2"
              >
                <span>Access EPMS Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {onOpenContact && (
              <button
                onClick={onOpenContact}
                className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition-all"
              >
                Contact EPMS Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Institutional Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#6B3F1D]/40 border border-[#C89A2B]/30 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C89A2B]/20 text-[#C89A2B] flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Objective Performance Tracking</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Eliminating guesswork by capturing quantifiable daily figures across 8 vital banking products: Deposits, FCY Inflows, Digital Financial Services, Account Acquisition, and Digital Channels.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#6B3F1D]/40 border border-[#C89A2B]/30 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C89A2B]/20 text-[#C89A2B] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Multi-Tier Approval Governance</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Ensuring data integrity through systematic Branch Manager review, district oversight, and comprehensive audit trails for every single daily submission.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#6B3F1D]/40 border border-[#C89A2B]/30 shadow-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#C89A2B]/20 text-[#C89A2B] flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">AI-Powered Performance Insights</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Equipped with Bunna AI Assistant to provide staff and branch managers with automated performance summaries, milestone projections, and policy compliance guidance.
          </p>
        </div>
      </div>

      {/* Institutional Statistics */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#6B3F1D] to-[#4A2C17] border border-[#C89A2B]/30 shadow-xl">
        <h3 className="text-xl font-bold text-[#C89A2B] text-center mb-8 uppercase tracking-wider">
          Bunna Bank EPMS at a Glance
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">{districtsCount > 0 ? `${districtsCount}` : 'Districts'}</p>
            <p className="text-xs text-[#C89A2B] font-semibold">Districts & Area Offices</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">{branchesCount > 0 ? `${branchesCount}` : 'Branches'}</p>
            <p className="text-xs text-[#C89A2B] font-semibold">Branches Nationwide</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">{employeesCount > 0 ? `${employeesCount}` : 'Staff'}</p>
            <p className="text-xs text-[#C89A2B] font-semibold">Active Employees</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-black text-white">100%</p>
            <p className="text-xs text-[#C89A2B] font-semibold">Audited Data Accuracy</p>
          </div>
        </div>
      </div>

      {/* Product Scope Overview Section */}
      <div className="bg-[#6B3F1D]/40 border border-[#C89A2B]/30 rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl font-bold text-white">Monitored Banking Products & KPIs</h3>
          <p className="text-xs text-gray-300">
            Bunna Bank EPMS evaluates employee productivity across 8 standardized Key Performance Indicators (KPIs):
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Deposits Mobilized', desc: 'Savings, Demand, and Fixed Deposits in ETB', icon: TrendingUp },
            { title: 'Foreign Currency Inflow', desc: 'Export trade earnings, SWIFT remittances & FCY deposits', icon: Globe2 },
            { title: 'Digital Financial Services', desc: 'Transaction volumes across Bunna Mobile & Internet Banking', icon: Zap },
            { title: 'Account Openings', desc: 'Individual, Joint, and Corporate new customer accounts', icon: Users },
            { title: 'Mobile Banking Activations', desc: 'Onboarded active users on Bunna Mobile App & USSD', icon: CheckCircle2 },
            { title: 'Internet Banking Activations', desc: 'Corporate and retail internet banking client activations', icon: Globe2 },
            { title: 'Merchant Solutions & QR', desc: 'Bunna Merchant POS terminals and QR code deployment', icon: Award },
            { title: 'ATM Card Activations', desc: 'Issued and activated Bunna Debit & Prepaid ATM Cards', icon: ShieldCheck }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#C89A2B]/20 text-[#C89A2B] flex items-center justify-center font-bold">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white">{item.title}</h4>
                <p className="text-[11px] text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
