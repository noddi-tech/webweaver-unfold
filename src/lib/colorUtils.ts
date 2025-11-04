// Unified color utility system for consistent color handling across all components
// This ensures gradient-text and other color tokens work everywhere

/**
 * Maps color tokens to their corresponding CSS classes
 * This is the single source of truth for color mappings
 */
export const COLOR_TOKEN_MAP: Record<string, string> = {
  // Standard text colors
  'foreground': 'text-foreground',
  'muted-foreground': 'text-muted-foreground',
  'primary': 'text-primary',
  'secondary': 'text-secondary',
  'accent': 'text-accent',
  'destructive': 'text-destructive',
  'warning': 'text-warning',
  'success': 'text-success',
  'info': 'text-info',
  
  // Special gradient styles - use the CSS classes defined in index.css
  'gradient-text': 'gradient-text',
  'gradient-primary': 'gradient-text',
  'gradient-secondary': 'gradient-text',
  
  // Background colors (for completeness)
  'background': 'bg-background',
  'card': 'bg-card',
  'muted': 'bg-muted',
};

/**
 * Gets the appropriate CSS class for a color token
 * This is the main function to use across all components
 * 
 * @param colorToken - The color token from the CMS
 * @param fallback - Fallback color token if the primary one isn't found
 * @returns CSS class string
 */
export const getColorClass = (colorToken?: string, fallback: string = 'foreground'): string => {
  if (!colorToken) {
    return COLOR_TOKEN_MAP[fallback] || COLOR_TOKEN_MAP.foreground;
  }
  
  return COLOR_TOKEN_MAP[colorToken] || COLOR_TOKEN_MAP[fallback] || COLOR_TOKEN_MAP.foreground;
};

/**
 * Checks if a color token is a gradient style
 * Useful for applying additional styling or logic for gradients
 */
export const isGradientColor = (colorToken?: string): boolean => {
  return colorToken?.startsWith('gradient-') || false;
};

/**
 * Gets all available color token options for use in CMS components
 * This ensures consistency between the CMS interface and actual styling
 */
export const getColorTokenOptions = () => [
  { value: 'foreground', label: 'Foreground (Default)', description: 'Primary text color' },
  { value: 'muted-foreground', label: 'Muted Foreground', description: 'Secondary text color' },
  { value: 'primary', label: 'Primary', description: 'Brand primary color' },
  { value: 'secondary', label: 'Secondary', description: 'Secondary brand color' },
  { value: 'accent', label: 'Accent', description: 'Accent color' },
  { value: 'destructive', label: 'Destructive', description: 'Error/warning color' },
  { value: 'gradient-text', label: 'Gradient Text', description: 'Primary brand gradient effect' },
  { value: 'gradient-primary', label: 'Gradient Primary', description: 'Primary color gradient' },
  { value: 'gradient-secondary', label: 'Gradient Secondary', description: 'Secondary color gradient' },
];

/**
 * Legacy compatibility function - maps old color handling to new system
 * @deprecated Use getColorClass instead
 */
export const getImageColorClass = getColorClass;

// BACKWARD COMPATIBILITY FUNCTIONS
// These maintain compatibility with existing components

// Original function signatures for backward compatibility
export const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const sum = max + min;
  
  let h = 0;
  let s = 0;
  const l = sum / 2;

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - sum) : diff / sum;
    
    switch (max) {
      case r:
        h = ((g - b) / diff) + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }

  // Return CSS variable format: "H S% L%" (space-separated, no wrapper)
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const hslToHex = (hslString: string): string => {
  // Parse HSL string - supports both formats:
  // CSS variable format: "240 100% 50%" (space-separated, no wrapper)
  // Full HSL format: "hsl(240, 100%, 50%)" (comma-separated, with wrapper)
  let matches = hslString.match(/^(\d+)\s+(\d+)%\s+(\d+)%$/);
  
  if (!matches) {
    // Try the full hsl() format
    matches = hslString.match(/hsl\((\d+),?\s*(\d+)%,?\s*(\d+)%\)/);
  }
  
  if (!matches) return '#000000';
  
  let h = parseInt(matches[1]) / 360;
  let s = parseInt(matches[2]) / 100;
  let l = parseInt(matches[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const isValidHex = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

export const calculateContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (hex: string) => {
    const rgb = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ].map(val => {
      val /= 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const getOptimalTextColor = (backgroundColor: string): string => {
  const whiteContrast = calculateContrastRatio(backgroundColor, '#ffffff');
  const blackContrast = calculateContrastRatio(backgroundColor, '#000000');
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
};

export const getContrastLevel = (ratio: number): string => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
};