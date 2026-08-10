import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Globe
} from 'lucide-react';
import { Language } from '../../types';
import { translations } from '../../i18n/translations';
import { BunnaBankLogo } from './BunnaBankLogo';

interface ContactPageProps {
  language: Language;
}

export const ContactPage: React.FC<ContactPageProps> = ({ language }) => {
  const t = translations[language] || translations['en'];

  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [branchOrDistrict, setBranchOrDistrict] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          emailOrPhone,
          branchOrDistrict,
          subject,
          message
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit inquiry.');
      }

      setSuccessMsg('Your message has been dispatched successfully to the Bunna Bank EPMS Support Team. We will respond shortly.');
      setFullName('');
      setEmailOrPhone('');
      setBranchOrDistrict('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error sending message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 py-4 text-white">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#6B3F1D] via-[#4A2C17] to-[#2E1B0E] border border-[#C89A2B]/40 shadow-2xl">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-1 rounded-full bg-[#C89A2B]/20 border border-[#C89A2B]/40 text-[#C89A2B] text-xs font-bold uppercase">
            Official Contact Directory
          </span>
          <span className="text-xs text-gray-300">Bunna Bank S.C. Head Office</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Contact Bunna Bank EPMS Administration
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
          Have questions regarding KPI targets, daily report approvals, technical support, or district coordination? Get in touch with our dedicated support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Information Column */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="p-6 rounded-3xl bg-[#6B3F1D]/40 border border-[#C89A2B]/30 shadow-xl space-y-5">
            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
              <BunnaBankLogo className="w-5 h-5" variant="gold" />
              Headquarters Location
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#C89A2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Bunna Bank Building</p>
                  <p className="text-gray-300">Arat Kilo / Churchill Avenue</p>
                  <p className="text-gray-400">P.O. Box 20144 / 1000, Addis Ababa, Ethiopia</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#C89A2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Customer Contact Center</p>
                  <p className="text-[#C89A2B] font-bold text-sm">8501 (Toll-Free in Ethiopia)</p>
                  <p className="text-gray-300">+251 11 126 4100 / +251 11 126 4101</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#C89A2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Official Email Channels</p>
                  <p className="text-gray-300">info@bunnabanksc.com</p>
                  <p className="text-[#C89A2B] font-mono">epms-support@bunnabanksc.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Globe className="w-5 h-5 text-[#C89A2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">SWIFT & Web Portal</p>
                  <p className="text-gray-300 font-mono">SWIFT Code: BUNNETAA</p>
                  <p className="text-gray-400">www.bunnabanksc.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-[#C89A2B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">EPMS Support Hours</p>
                  <p className="text-gray-300">Monday – Friday: 8:00 AM – 5:00 PM</p>
                  <p className="text-gray-300">Saturday: 8:00 AM – 12:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support Guidelines Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#6B3F1D] to-[#4A2C17] border border-[#C89A2B]/20 shadow-xl space-y-3">
            <h4 className="font-bold text-sm text-[#C89A2B] flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Need Assistance with Submissions?
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              If you experience issues submitting daily figures on official bank holidays or need report corrections returned by your Branch Manager, contact your District EPMS Coordinator directly or send us a message.
            </p>
          </div>

        </div>

        {/* Interactive Direct Message Form Column */}
        <div className="lg:col-span-2">
          <div className="p-6 sm:p-8 rounded-3xl bg-[#6B3F1D]/40 border border-[#C89A2B]/30 shadow-2xl space-y-6">
            
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#C89A2B]" />
                Send Direct Message to EPMS Administration
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Fill out the form below for account help, metric inquiries, or district support request.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 text-xs flex items-center space-x-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#C89A2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Email Address or Staff Phone *</label>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="e.g. staff@bunnabanksc.com or +251..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#C89A2B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Branch or District Name</label>
                  <input
                    type="text"
                    value={branchOrDistrict}
                    onChange={(e) => setBranchOrDistrict(e.target.value)}
                    placeholder="e.g. Main HQ Branch / Addis Ababa North"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#C89A2B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Inquiry Subject *</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. KPI Target Revision, Login Issue, Report Return"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#C89A2B] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Message Details *</label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or request in detail..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:border-[#C89A2B] focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C89A2B] to-[#D8B45C] text-[#6B3F1D] font-bold text-xs shadow-xl hover:opacity-95 transition-all flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Dispatching Message...' : 'Submit Inquiry to EPMS Support'}</span>
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
