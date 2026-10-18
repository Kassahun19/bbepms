import React from "react";
import {
  Calendar,
  CheckCircle2,
  FileText,
  TrendingUp,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
  Lock,
  UserCheck
} from "lucide-react";
import { translations } from "../../i18n/translations";

export const HowItWorksPage = ({ language = "en", onNavigateHome, onOpenLogin }) => {
  const t = translations[language] || translations["en"];

  const steps = [
    {
      step: "01",
      title: "Daily Activity Logging",
      badge: "Staff Action",
      badgeColor: "bg-[#541818]/10 text-[#541818] border-[#541818]/20",
      icon: Calendar,
      description:
        "Every working day, branch and district staff record completed transactions, CASA deposit mobilizations, account openings, digital banking enrollments, and other key banking activities.",
      details: [
        "Reports submitted against assigned daily quotas calculated from annual targets",
        "Operating framework strictly follows 300 banking days per fiscal year",
        "Submissions are time-stamped and locked to prevent post-cutoff tampering"
      ]
    },
    {
      step: "02",
      title: "Automated KPI Scoring & Validation",
      badge: "System Intelligence",
      badgeColor: "bg-[#425727]/10 text-[#425727] border-[#425727]/20",
      icon: TrendingUp,
      description:
        "As soon as activities are entered, the system automatically validates entries against target baselines, calculates weighted achievement scores, and alerts managers to outliers.",
      details: [
        "Instant calculation of achievement percentages vs annual 300-day targets",
        "Automatic validation against historical branch trends and sanity limits",
        "Dynamic categorization: Exceeding, Strong, Satisfactory, or Underperforming"
      ]
    },
    {
      step: "03",
      title: "Supervisor Verification & Multi-Level Approvals",
      badge: "Governance & Audit",
      badgeColor: "bg-[#c17540]/10 text-[#c17540] border-[#c17540]/20",
      icon: Shield,
      description:
        "Branch Managers, District Directors, and HQ Operations review daily logs, certify numbers against core banking journals, and formally approve or request corrections.",
      details: [
        "Strict 10:00 AM daily cutoff for previous banking day approvals",
        "Supervisor commentary and audit logging for every approval or revision",
        "Automated notifications and reminders sent to approvers and staff"
      ]
    },
    {
      step: "04",
      title: "Executive Analytics & Performance Benchmarking",
      badge: "Executive Leadership",
      badgeColor: "bg-[#541818]/10 text-[#541818] border-[#541818]/20",
      icon: Award,
      description:
        "Approved daily records roll up in real-time to executive dashboards for the CEO, Board of Directors, Chiefs, and District Directors for proactive management decisions.",
      details: [
        "Rankings across 34 Districts and 565 Branches nationwide",
        "Automated branch-to-branch comparisons and performance gap identification",
        "AI-assisted coaching insights and management intervention recommendations"
      ]
    }
  ];

  const rules = [
    {
      icon: Clock,
      title: "300 Banking Days Framework",
      desc: "Daily targets are calibrated dividing annual goals by 300 verified operational banking days, excluding Sundays and National Bank of Ethiopia official public holidays."
    },
    {
      icon: Lock,
      title: "Strict 10:00 AM Daily Cutoff",
      desc: "Reports for the previous operating day must be submitted and approved by 10:00 AM next morning to ensure reliable daily management reporting."
    },
    {
      icon: UserCheck,
      title: "Role-Based Data Privacy",
      desc: "Backend security ensures individual employee performance records remain private to that employee and their authorized supervisors, while branch-level totals remain transparent."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#541818]/10 border border-[#541818]/20 text-[#541818] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Workflow & Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#541818] tracking-tight">
            How the Daily KPI Performance System Works
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
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
                className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#541818] text-white shadow flex items-center justify-center font-black text-lg">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                      <span className="text-xl font-black text-gray-300">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  {item.details.map((detail, dIdx) => (
                    <div key={dIdx} className="flex items-start space-x-2.5 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#425727] shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Core Architectural Principles */}
        <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Core Principles & Data Integrity Rules
            </h2>
            <p className="text-xs text-gray-500 max-w-xl mx-auto font-medium">
              Built on banking-grade governance, auditability, and clear operational controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {rules.map((rule, idx) => {
              const RuleIcon = rule.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-300 space-y-3 shadow-xs transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#541818] text-white flex items-center justify-center font-bold shadow">
                    <RuleIcon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-normal">
                    {rule.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Callout */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl bg-white border border-gray-200 shadow-sm gap-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              Ready to submit or view your daily KPI performance?
            </h3>
            <p className="text-xs text-gray-500">
              Access the dashboard to record today's achievements or view your certified performance metrics.
            </p>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-5 py-2.5 rounded-xl bg-[#541818] hover:bg-[#3d1011] text-white font-bold text-xs flex items-center space-x-2 transition-all shadow-sm active:scale-95 cursor-pointer"
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

export default HowItWorksPage;
