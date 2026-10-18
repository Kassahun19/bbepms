import React from "react";
import { ArrowUp, ShieldCheck } from "lucide-react";
import { translations } from "../../i18n/translations";
import { BunnaBankLogo } from "./BunnaBankLogo";

export const Footer = ({ language = "en" }) => {
  const t = translations[language] || translations["en"];
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Identity & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#541718] p-1.5 shadow-sm flex items-center justify-center">
              <BunnaBankLogo className="w-5 h-5" variant="gold" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#541718] tracking-tight">
                Daily KPI Performance Management System
              </span>
              <p className="text-xs text-gray-500 font-medium">
                {t.tagline || "Empowering Performance. Driving Excellence."}
              </p>
            </div>
          </div>

          {/* Status & Security Badge */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#425727]/10 border border-[#425727]/20 text-[#425727] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#425727] animate-pulse" />
              <span>System Operational &bull; 300 Banking Days Framework</span>
            </div>
            <div className="hidden sm:inline-flex items-center space-x-1 text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#541718]" />
              <span>Bank Audit Certified</span>
            </div>
          </div>

          {/* Copyright & Scroll to Top */}
          <div className="flex items-center space-x-4 text-xs">
            <p className="text-gray-500">
              {t.copyright || "© 2026 Bunna Bank S.C. All rights reserved."}
            </p>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-gray-100 hover:bg-[#541718] hover:text-white text-gray-600 transition-colors cursor-pointer"
              title="Back to Top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          <span>Bunna Bank S.C. &bull; bunnabanksc.com &bull; Addis Ababa, Ethiopia</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
