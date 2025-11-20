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

/**
 * Convert RGB (0-1 range) to HSL string
 */
const rgbToHSL = (r: number, g: number, b: number): string => {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

/**
 * Parse color from various formats (HSL, HEX, RGB) to HSL string
 */
export const parseColorToHSL = (color: string): string | null => {
  color = color.trim();
  
  // Already HSL format "249 67% 24%"
  if (/^\d+\.?\d*\s+\d+\.?\d*%\s+\d+\.?\d*%$/.test(color)) {
    return color;
  }
  
  // HEX format "#201466" or "201466"
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    const r = parseInt(hexMatch[1], 16) / 255;
    const g = parseInt(hexMatch[2], 16) / 255;
    const b = parseInt(hexMatch[3], 16) / 255;
    return rgbToHSL(r, g, b);
  }
  
  // RGB format "rgb(32, 20, 102)" or "32, 20, 102"
  const rgbMatch = color.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i) || 
                   color.match(/^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]) / 255;
    const g = parseInt(rgbMatch[2]) / 255;
    const b = parseInt(rgbMatch[3]) / 255;
    return rgbToHSL(r, g, b);
  }
  
  return null;
};

/**
 * Adjust lightness of HSL color to achieve target contrast ratio
 */
export const adjustColorForContrast = (
  colorToAdjust: string,
  fixedColor: string,
  targetRatio: number = 7,
  adjustDarker: boolean = true
): string => {
  const match = colorToAdjust.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return colorToAdjust;
  
  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  let l = parseFloat(match[3]);
  
  // Binary search for optimal lightness
  let minL = adjustDarker ? 0 : l;
  let maxL = adjustDarker ? l : 100;
  let bestL = l;
  let iterations = 0;
  const maxIterations = 50;
  
  while (iterations < maxIterations && maxL - minL > 0.5) {
    const testL = (minL + maxL) / 2;
    const testColor = `${h} ${s}% ${testL}%`;
    const ratio = getContrastRatio(testColor, fixedColor);
    
    if (ratio >= targetRatio) {
      bestL = testL;
      if (adjustDarker) {
        minL = testL;
      } else {
        maxL = testL;
      }
    } else {
      if (adjustDarker) {
        maxL = testL;
      } else {
        minL = testL;
      }
    }
    
    iterations++;
  }
  
  return `${h} ${s}% ${Math.round(bestL)}%`;
};

/**
 * Fix background color to achieve AAA contrast with text
 */
export const fixBackgroundForAAA = (backgroundColor: string, textColor: string): string => {
  const currentRatio = getContrastRatio(backgroundColor, textColor);
  if (currentRatio >= 7) return backgroundColor;
  
  const darkened = adjustColorForContrast(backgroundColor, textColor, 7, true);
  const darkenedRatio = getContrastRatio(darkened, textColor);
  
  if (darkenedRatio >= 7) return darkened;
  
  const lightened = adjustColorForContrast(backgroundColor, textColor, 7, false);
  return lightened;
};

/**
 * Fix text color to achieve AAA contrast with background
 */
export const fixTextForAAA = (textColor: string, backgroundColor: string): string => {
  const currentRatio = getContrastRatio(backgroundColor, textColor);
  if (currentRatio >= 7) return textColor;
  
  const bgLuminance = getLuminanceFromHSL(backgroundColor);
  const adjustDarker = bgLuminance > 0.5;
  
  return adjustColorForContrast(textColor, backgroundColor, 7, adjustDarker);
};

/**
 * Convert HSL string to HEX format
 */
export const hslToHex = (hsl: string): string => {
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return '#000000';
  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;
  
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
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
