import React from 'react';
import {
  FileCheck2,
  CalendarCheck,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Building,
  UserCheck,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';

interface HowItWorksPageProps {
  language: Language;
  onNavigateHome?: () => void;
  onOpenLogin?: () => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
  language,
  onNavigateHome,
  onOpenLogin
}) => {
  const t = translations[language];

  const steps = [
    {
      step: "01",
      title: "Daily KPI Performance Submission",
      badge: "Employee Action",
      badgeColor: "bg-amber-500/20 text-[#C89A2B] border-amber-500/30",
      icon: FileCheck2,
      description: "Employees record their daily achievements across core performance indicators including deposit mobilization, foreign currency inflow, digital banking activations, and new accounts.",
      details: [
        "Select valid working date from the interactive calendar picker",
        "Input accurate daily figures with automated input validation",
        "Save drafts for review or click 'Submit for Approval'",
        "Receive instant confirmation with a unique reference ID"
      ]
    },
    {
      step: "02",
      title: "Reporting Calendar & Business Day Rules",
      badge: "System Rule Enforcement",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: CalendarCheck,
      description: "The system enforces official banking operational rules, preventing accidental or erroneous submissions during non-working periods.",
      details: [
        "Submissions are restricted strictly to official working days (Monday - Saturday)",
        "Automated blackout for Sundays and recognized official bank holidays",
        "Duplicate report prevention: one verified submission per working day",
        "Real-time countdown and deadline monitoring for daily submissions"
      ]
    },
    {
      step: "03",
      title: "Authorized Multi-Level Review & Approval",
      badge: "Manager Governance",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: ShieldCheck,
      description: "Branch managers and authorized supervisors review submitted performance reports, verify accuracy against core branch records, and take approval actions.",
      details: [
        "One-click 'Approve' to certify and lock performance records",
        "'Return for Correction' with feedback comments for required adjustments",
        "'Reject' with documented rationale for unverified submissions",
        "Strict Report Immutability: Approved reports become permanently read-only"
      ]
    },
    {
      step: "04",
      title: "Automated Metric Aggregation & Privacy",
      badge: "Analytics Engine",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      icon: TrendingUp,
      description: "The analytics engine automatically compiles approved records into individual, branch, and district dashboards with strict role-based privacy.",
      details: [
        "Only approved reports are counted in completion rates and achievement graphs",
        "Pending or returned reports are strictly excluded from performance totals",
        "Employee Privacy: Employees view their personal performance and branch aggregates",
        "Managers monitor branch teams; Executives access district and nationwide rollups"
      ]
    }
  ];

  const rules = [
    {
      icon: Lock,
      title: "Strict Data Immutability",
      desc: "Once a daily report is Approved by a supervisor, it is permanently locked. No further modifications or edits can be made, ensuring 100% audit integrity."
    },
    {
      icon: BarChart3,
      title: "Approved-Only Calculations",
      desc: "All graphs, achievement meters, periodic summaries, and district rankings strictly aggregate certified 'Approved' reports. Drafts and pending reports are never counted as completed."
    },
    {
      icon: UserCheck,
      title: "Role-Based Data Privacy",
      desc: "Backend API security ensures individual employee performance records remain private to that employee and their authorized supervisors, while branch-level totals remain transparent."
    }
  ];

  return (
    <div className="min-h-screen bg-[#2D180C] text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#C89A2B]/10 border border-[#C89A2B]/30 text-[#C89A2B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How the Daily KPI Performance System Works
          </h1>
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
            A secure, standardized, and transparent 4-stage operational workflow designed for daily employee KPI tracking, supervisor verification, and certified performance analytics.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-[#3A1F0D] border-2 border-[#C89A2B]/40 shadow-2xl space-y-5 flex flex-col justify-between hover:border-[#C89A2B] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#C89A2B] text-[#3A1F0D] shadow flex items-center justify-center font-black text-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <span className="text-xl font-black text-[#C89A2B]/60">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-100 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#C89A2B]/20">
                  {item.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start space-x-2.5 text-xs text-amber-100/90">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Architectural Principles */}
        <div className="p-8 rounded-3xl bg-[#3A1F0D] border-2 border-[#C89A2B]/60 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-white">
              Core Principles & Data Integrity Rules
            </h2>
            <p className="text-xs text-amber-100 max-w-xl mx-auto font-medium">
              Built on banking-grade governance, auditability, and clear operational controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {rules.map((rule, idx) => {
              const RuleIcon = rule.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#4A2C17] border border-[#C89A2B]/40 hover:border-[#C89A2B] space-y-3 shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#C89A2B] text-[#3A1F0D] flex items-center justify-center font-bold shadow">
                    <RuleIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-black text-white">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-amber-100/90 leading-relaxed font-normal">
                    {rule.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-[#4A2C17] to-[#6B3F1D] border border-[#C89A2B]/40 shadow-xl gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">
              Ready to submit or view your daily KPI performance?
            </h3>
            <p className="text-xs text-gray-300">
              Access the dashboard to record today's achievements or view your certified performance metrics.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl bg-[#C89A2B] hover:bg-[#D8B45C] text-[#6B3F1D] font-bold text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
