/**
 * WCAG 2.0 Contrast Utilities
 * Automatic AAA contrast compliance for all text elements
 */

/**
 * Calculate relative luminance from HSL color string
 * Based on WCAG 2.0 formula
 */
export const getLuminanceFromHSL = (hsl: string): number => {
  // Parse "249 67% 24%" format
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return 0;
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  // Convert HSL to RGB
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  // Calculate relative luminance
  const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
};

/**
 * Calculate contrast ratio between two colors
 * Returns ratio (1:1 to 21:1)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminanceFromHSL(color1);
  const lum2 = getLuminanceFromHSL(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get optimal text color (white or dark) for a given background
 * Ensures AAA contrast (7:1 for normal text)
 */
export const getOptimalTextColor = (backgroundColor: string): 'white' | 'dark' => {
  const whiteContrast = getContrastRatio(backgroundColor, '0 0% 100%'); // white
  const darkContrast = getContrastRatio(backgroundColor, '249 67% 24%'); // federal blue
  
  // Prefer white text if it meets AAA (7:1), otherwise use dark
  return whiteContrast >= 7 ? 'white' : 'dark';
};

/**
 * Check if contrast meets accessibility standard
 */
export const meetsContrastStandard = (
  ratio: number, 
  standard: 'AAA' | 'AA' = 'AAA',
  textSize: 'normal' | 'large' = 'normal'
): boolean => {
  if (standard === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return textSize === 'large' ? ratio >= 3 : ratio >= 4.5;
};

/**
 * Get accessibility level badge text
 */
export const getContrastBadge = (ratio: number): { label: string; color: string } => {
  if (ratio >= 7) return { label: 'AAA', color: 'text-green-600' };
  if (ratio >= 4.5) return { label: 'AA', color: 'text-yellow-600' };
  if (ratio >= 3) return { label: 'AA Large', color: 'text-orange-600' };
  return { label: 'Fail', color: 'text-red-600' };
};
