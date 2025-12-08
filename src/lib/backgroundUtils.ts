import React from 'react';

/**
 * Builds inline style object for background rendering
 * Handles gradients, glass effects, and solid colors
 * Strips 'bg-' prefix for CSS variable references
 * 
 * Database stores preview_class values like:
 * - "bg-gradient-mesh-velvet" (with bg- prefix)
 * - "glass-card" (without prefix)
 * 
 * CSS variables are defined as:
 * - "--gradient-mesh-velvet"
 * - "--glass-card"
 * 
 * This function normalizes the token to match CSS variable naming.
 */
export function getBackgroundStyleFromToken(background: string): React.CSSProperties {
  if (!background) return {};
  
  // Normalize: strip 'bg-' prefix to get CSS variable name
  const cssVarName = background.startsWith('bg-') 
    ? background.slice(3) // More efficient than replace
    : background;
  
  // Gradients and mesh patterns
  if (cssVarName.includes('gradient') || cssVarName.includes('mesh')) {
    return { backgroundImage: `var(--${cssVarName})` };
  }
  
  // Glass effects
  if (cssVarName.includes('glass') || cssVarName.includes('liquid')) {
    return { 
      backgroundImage: `var(--${cssVarName})`,
      backdropFilter: 'blur(12px)',
    };
  }
  
  // Solid colors - handle opacity notation (e.g., primary/10)
  const colorToken = cssVarName.split('/')[0];
  const opacityMatch = cssVarName.match(/\/(\d+)$/);
  if (opacityMatch) {
    const opacity = parseInt(opacityMatch[1]) / 100;
    return { backgroundColor: `hsl(var(--${colorToken}) / ${opacity})` };
  }
  
  return { backgroundColor: `hsl(var(--${colorToken}))` };
}
