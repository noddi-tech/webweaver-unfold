import React from "react";

interface ColorPreviewProps {
  backgroundColor: string;
  foregroundColor?: string;
  colorName: string;
}

export const ColorPreview = ({ backgroundColor, foregroundColor, colorName }: ColorPreviewProps) => {
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {/* Text preview */}
      <div 
        style={{ 
          background: `hsl(${backgroundColor})`, 
          color: foregroundColor ? `hsl(${foregroundColor})` : 'inherit' 
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
            color: foregroundColor ? `hsl(${foregroundColor})` : 'inherit' 
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
          color: foregroundColor ? `hsl(${foregroundColor})` : 'inherit' 
        }} 
        className="p-3 rounded border border-border/30"
      >
        <h4 className="font-bold text-sm mb-1">Card Title</h4>
        <p className="text-xs opacity-80">Card content</p>
      </div>
    </div>
  );
};
