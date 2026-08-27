import React from 'react';
import { ArrowUp, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { BunnaBankLogo } from './BunnaBankLogo';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language] || translations['en'];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#4A2C17] text-gray-300 border-t border-[#C89A2B]/20 py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Identity & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#6B3F1D] border border-[#C89A2B]/40 p-1 flex items-center justify-center">
              <BunnaBankLogo className="w-5 h-5" variant="gold" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">
                Daily KPI Performance Management System
              </span>
              <p className="text-[11px] text-[#C89A2B]/80 font-medium">
                {t.tagline || 'Empowering Performance. Driving Excellence.'}
              </p>
            </div>
          </div>

          {/* Status & Security Badge */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational &bull; v2.4</span>
            </div>
            <div className="hidden sm:inline-flex items-center space-x-1 text-gray-400">
              <ShieldCheck className="w-4 h-4 text-[#C89A2B]" />
              <span>Audit Certified</span>
            </div>
          </div>

          {/* Copyright & Scroll to Top */}
          <div className="flex items-center space-x-4 text-xs">
            <p className="text-gray-400">
              {t.copyright}
            </p>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-[#C89A2B] hover:text-[#6B3F1D] text-gray-300 transition-colors"
              title="Back to Top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};

