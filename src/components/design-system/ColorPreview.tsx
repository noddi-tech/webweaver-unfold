import React from "react";

interface ColorPreviewProps {
  backgroundColor: string;
  foregroundColor?: string;
  colorName: string;
}

// Calculate relative luminance from HSL values
const getLuminanceFromHSL = (hsl: string): number => {
  // Parse HSL string like "0 0% 100%" or "249 67% 24%"
  const parts = hsl.trim().split(/\s+/);
  if (parts.length !== 3) return 0.5; // Default to mid-range if can't parse
  
  const l = parseFloat(parts[2]) / 100;
  
  // Lightness is the primary factor for luminance in HSL
  return l;
};

// Determine if we need dark or light text based on background luminance
const getContrastingTextColor = (backgroundColor: string): string => {
  const luminance = getLuminanceFromHSL(backgroundColor);
  
  // WCAG threshold: backgrounds with >50% lightness get dark text
  if (luminance > 0.5) {
    return "249 67% 24%"; // Federal blue (--foreground)
  } else {
    return "0 0% 100%"; // White
  }
};

export const ColorPreview = ({ backgroundColor, foregroundColor, colorName }: ColorPreviewProps) => {
  // Use provided foreground color, or intelligently choose based on background luminance
  const textColor = foregroundColor || getContrastingTextColor(backgroundColor);
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {/* Text preview */}
      <div 
        style={{ 
          background: `hsl(${backgroundColor})`, 
          color: `hsl(${textColor})`
        }} 
        className="p-3 rounded border border-border/30"
      >
        <p className="text-xs mb-1">Small (12px)</p>
        <p className="text-base font-semibold">Heading</p>
      </div>
      
      {/* Button preview */}
      <div className="flex items-center justify-center p-3 border border-border/30 rounded bg-background/50">
        <button 
          style={{ 
            background: `hsl(${backgroundColor})`, 
            color: `hsl(${textColor})`
          }} 
          className="px-4 py-2 rounded text-sm font-medium"
        >
          Button
        </button>
      </div>
      
      {/* Card preview */}
      <div 
        style={{ 
          background: `hsl(${backgroundColor})`, 
          color: `hsl(${textColor})`
        }} 
        className="p-3 rounded border border-border/30"
      >
        <h4 className="font-bold text-sm mb-1">Card Title</h4>
        <p className="text-xs opacity-80">Card content</p>
      </div>
    </div>
  );
};
