// Color contrast and accessibility utilities
export const calculateLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const calculateContrastRatio = (color1: string, color2: string): number => {
  const hex1 = color1.startsWith('#') ? color1 : hslToHex(color1);
  const hex2 = color2.startsWith('#') ? color2 : hslToHex(color2);
  
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = calculateLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = calculateLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

export const getOptimalTextColor = (backgroundColor: string): string => {
  const contrastWithWhite = calculateContrastRatio(backgroundColor, '#ffffff');
  const contrastWithBlack = calculateContrastRatio(backgroundColor, '#000000');
  
  return contrastWithWhite > contrastWithBlack ? '0 0% 100%' : '0 0% 0%';
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const hexToHsl = (hex: string): string => {
  const rgb = hexToRgb(hex);
  if (!rgb) return '0 0% 0%';
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const hslToHex = (hsl: string): string => {
  const [h, s, l] = hsl.split(' ').map(v => parseInt(v));
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((hNorm * 6) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;
  if (0 <= hNorm && hNorm < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= hNorm && hNorm < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= hNorm && hNorm < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= hNorm && hNorm < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= hNorm && hNorm < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= hNorm && hNorm < 1) {
    r = c; g = 0; b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const getContrastLevel = (ratio: number): { level: string; badge: 'default' | 'secondary' | 'destructive' } => {
  if (ratio >= 7) return { level: 'AAA', badge: 'default' };
  if (ratio >= 4.5) return { level: 'AA', badge: 'default' };
  if (ratio >= 3) return { level: 'AA Large', badge: 'secondary' };
  return { level: 'Fail', badge: 'destructive' };
};