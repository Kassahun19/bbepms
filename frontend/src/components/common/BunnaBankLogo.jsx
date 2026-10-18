export const BunnaBankLogo = ({
  className = "w-10 h-10",
  variant = "maroon",
  badgeBackground = false
}) => {
  let mainColor = "#541818"; // Official Coffee Berry Burgundy (#541818)
  let cutoutColor = "#FFFFFF";

  if (variant === "gold" || variant === "olive") {
    mainColor = "#726732"; // Official Olive Gold
    cutoutColor = "#FFFFFF";
  } else if (variant === "amber" || variant === "terracotta") {
    mainColor = "#c17540"; // Official Coffee Amber
    cutoutColor = "#FFFFFF";
  } else if (variant === "green") {
    mainColor = "#425727"; // Official Coffee Leaf Green
    cutoutColor = "#FFFFFF";
  } else if (variant === "white") {
    mainColor = "#FFFFFF";
    cutoutColor = "#541818";
  } else if (variant === "dual") {
    mainColor = "#541818";
    cutoutColor = "#c17540";
  } else if (variant === "slate") {
    mainColor = "#1d2b32";
    cutoutColor = "#c17540";
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
      <div className={`rounded-xl bg-white p-0.5 shadow-sm border border-gray-200 flex items-center justify-center shrink-0 ${className}`}>
        <div className="w-full h-full bg-white rounded-[10px] p-1 flex items-center justify-center">
          {svgContent}
        </div>
      </div>
    );
  }

  return <div className={`shrink-0 flex items-center justify-center ${className}`}>{svgContent}</div>;
};
