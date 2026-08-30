import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Language } from '../../types';

interface FloatingAiCoachButtonProps {
  onClick: () => void;
  language?: Language;
  isDrawerOpen?: boolean;
}

export const FloatingAiCoachButton: React.FC<FloatingAiCoachButtonProps> = ({ onClick, language = 'en', isDrawerOpen = false }) => {
  const isAmharic = language === 'am';
  const labelText = isAmharic ? 'ቡና AIን ይጠይቁ' : 'Ask Bunna AI';

  if (isDrawerOpen) return null;

  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{
        scale: 1,
        opacity: 1,
        y: [0, -6, 0]
      }}
      whileHover={{ scale: 1.08, y: -8 }}
      whileTap={{ scale: 0.93 }}
      transition={{
        y: {
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        },
        scale: { type: 'spring', stiffness: 400, damping: 20 }
      }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-2 sm:space-x-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#D9A514] via-[#F2C230] to-[#C89A2B] text-[#3D1E0B] font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(217,165,20,0.45)] border-2 border-[#FFE899] cursor-pointer hover:shadow-amber-500/60 transition-shadow duration-300 group focus:outline-none focus:ring-4 focus:ring-amber-400/50 backdrop-blur-sm"
      aria-label="Ask Bunna AI"
      title={isAmharic ? 'የ ቡና AI አፈፃፀም አሰልጣኝ እና አማካሪ' : 'Ask Bunna AI Performance Coach & Advisor'}
    >
      <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3D1E0B] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#3D1E0B]"></span>
      </span>
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D1E0B] group-hover:rotate-12 transition-transform duration-300" />
      <span className="tracking-wide select-none">{labelText}</span>
    </motion.button>
  );
};
