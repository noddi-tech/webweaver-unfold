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
  const parts = backgroundColor.trim().split(/\s+/);
  if (parts.length !== 3) return "0 0% 100%"; // Default to white
  
  const h = parseFloat(parts[0]);
  const s = parseFloat(parts[1]) / 100;
  const l = parseFloat(parts[2]) / 100;
  
  // Calculate perceived brightness using saturation-aware threshold
  // Saturated colors need higher lightness to appear bright enough for dark text
  const threshold = 0.5 + (s * 0.15); // Range: 0.5 (grays) to 0.65 (vivid colors)
  
  // Special handling for yellow/orange hues (30-90 degrees) - they appear brighter
  const isYellowOrange = h >= 30 && h <= 90;
  const adjustedThreshold = isYellowOrange ? threshold - 0.1 : threshold;
  
  // Use dark text if lightness is above the adjusted threshold
  if (l > adjustedThreshold) {
    return "249 67% 24%"; // Federal blue (dark)
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
