import React from 'react';
import { ArrowUp, Phone, Mail, MapPin, Globe, Shield, Heart } from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { BunnaBankLogo } from './BunnaBankLogo';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = translations[language];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#6B3F1D] text-gray-200 border-t border-[#C89A2B]/30 pt-16 pb-8 relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-[#C89A2B] to-transparent opacity-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#6B3F1D] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#6B3F1D] rounded-[10px] p-1 flex items-center justify-center">
                  <BunnaBankLogo className="w-6 h-6" variant="gold" />
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{t.bankName}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Bunna Bank S.C. Employee Performance Management System (EPMS). Driving digital transformation, performance excellence, and data-driven HR leadership across all nationwide branches.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs text-[#C89A2B]">
              <Shield className="w-4 h-4" />
              <span>Enterprise Grade Security & Audit Logging</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89A2B]">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-[#C89A2B] transition-colors">{t.about}</a></li>
              <li><a href="#features" className="hover:text-[#C89A2B] transition-colors">{t.features}</a></li>
              <li><a href="#kpis" className="hover:text-[#C89A2B] transition-colors">KPI Overview</a></li>
              <li><a href="#faq" className="hover:text-[#C89A2B] transition-colors">Frequently Asked Questions</a></li>
              <li><a href="#contact" className="hover:text-[#C89A2B] transition-colors">{t.contact}</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89A2B]">Governance & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#privacy" className="hover:text-[#C89A2B] transition-colors">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-[#C89A2B] transition-colors">Terms of Service</a></li>
              <li><a href="#security" className="hover:text-[#C89A2B] transition-colors">Banking Security Standards</a></li>
              <li><a href="#help" className="hover:text-[#C89A2B] transition-colors">HR Desk Support</a></li>
              <li><a href="#system" className="hover:text-[#C89A2B] transition-colors">System Status: Operational</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#C89A2B]">Headquarters</h4>
            <ul className="space-y-2.5 text-xs text-gray-200">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#C89A2B] shrink-0 mt-0.5" />
                <span>Bunna Bank S.C. HQ Building, Arat Kilo, Addis Ababa, Ethiopia</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-[#C89A2B] shrink-0" />
                <span>+251 11 126 4100 / 8522 (Shortcode)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#C89A2B] shrink-0" />
                <span>epms-support@bunnabanksc.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-[#C89A2B] shrink-0" />
                <span>www.bunnabanksc.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-300 gap-4">
          <p className="text-center sm:text-left">
            {t.copyright}
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-[#C89A2B] hover:text-[#6B3F1D] border border-white/20 transition-all font-semibold text-white"
          >
            <span>Back To Top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
