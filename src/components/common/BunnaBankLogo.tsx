import React from 'react';

interface BunnaBankLogoProps {
  className?: string;
  variant?: 'maroon' | 'gold' | 'white' | 'dual';
  badgeBackground?: boolean;
}

export const BunnaBankLogo: React.FC<BunnaBankLogoProps> = ({
  className = "w-10 h-10",
  variant = 'maroon',
  badgeBackground = false
}) => {
  // Color palette selection
  // Coffee Brown: #6B3F1D (official Bunna Bank coffee brown)
  // Gold Accent: #C89A2B (official Bunna Bank gold)
  let mainColor = "#6B3F1D";
  let cutoutColor = "#FFFFFF";

  if (variant === 'gold') {
    mainColor = "#C89A2B";
    cutoutColor = "#6B3F1D"; // Brown cutout for header integration
  } else if (variant === 'white') {
    mainColor = "#FFFFFF";
    cutoutColor = "#6B3F1D";
  } else if (variant === 'dual') {
    mainColor = "#6B3F1D";
    cutoutColor = "#C89A2B";
  }

  const svgContent = (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Base Circle */}
      <circle cx="50" cy="50" r="48" fill={mainColor} />

      {/* Upper Central Arch / Dome Cutout */}
      <path
        d="M 30 57 L 30 42 A 20 20 0 0 1 70 42 L 70 57 Z"
        fill={cutoutColor}
      />

      {/* Curved Separator Ribbon with Notched End Tabs */}
      <path
        d="M 6 62 
           C 25 68 75 68 94 62 
           L 91 67 
           C 73 73 27 73 9 67 
           L 6 62 Z"
        fill={cutoutColor}
      />
    </svg>
  );

  if (badgeBackground) {
    return (
      <div className={`rounded-xl bg-gradient-to-br from-[#C89A2B] via-[#D8B45C] to-[#6B3F1D] p-0.5 shadow-md flex items-center justify-center shrink-0 ${className}`}>
        <div className="w-full h-full bg-[#6B3F1D] rounded-[10px] p-1 flex items-center justify-center">
          {svgContent}
        </div>
      </div>
    );
  }

  return <div className={`shrink-0 flex items-center justify-center ${className}`}>{svgContent}</div>;
};
