import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

export const FloatingAiCoachButton = ({ onClick, language = "en", isDrawerOpen = false }) => {
  const isAmharic = language === "am";
  const labelText = isAmharic ? "ቡና AIን ይጠይቁ" : "Ask Bunna AI";

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
          ease: "easeInOut"
        },
        scale: { type: "spring", stiffness: 400, damping: 20 }
      }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-2 sm:space-x-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#541818] via-[#c17540] to-[#D4A017] text-white font-extrabold text-xs sm:text-sm shadow-[0_10px_25px_rgba(84,23,24,0.55)] border-2 border-[#D4A017]/80 cursor-pointer hover:shadow-amber-500/50 transition-shadow duration-300 group focus:outline-none focus:ring-4 focus:ring-[#D4A017]/50 backdrop-blur-sm"
      aria-label="Ask Bunna AI"
      title={isAmharic ? "የ ቡና AI አፈጻጸም አሰልጣኝ እና አማካሪ" : "Ask Bunna AI Performance Coach & Advisor"}
    >
      <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A017] opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#D4A017]" />
      </span>
      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A017] group-hover:rotate-12 transition-transform duration-300" />
      <span className="tracking-wide select-none drop-shadow-sm">{labelText}</span>
    </motion.button>
  );
};
