/**
 * Text Color Utilities - Scalable color resolution and contrast handling
 * Single source of truth for text color rendering across all components
 */

/**
 * Parse HSL string and extract lightness value
 */
export function getLightnessFromHSL(hslValue?: string): number {
  if (!hslValue) return 50;
  const parts = hslValue.split(' ');
  return parseFloat(parts[2]?.replace('%', '') || '50');
}

/**
 * Check if a color is "light" (lightness > 70%)
 * Used to determine if swatch needs dark background for visibility
 */
export function isLightColor(hslValue?: string): boolean {
  return getLightnessFromHSL(hslValue) > 70;
}

/**
 * Resolve a color token to a valid CSS color value
 * Handles all edge cases: white, foreground, CSS variables, etc.
 * 
 * @param colorToken - Token name (e.g., 'white', 'foreground', 'primary')
 * @param hslValue - Optional direct HSL value from database
 * @returns Valid CSS color string
 */
export function resolveTextColor(colorToken: string, hslValue?: string): string {
  // Handle explicit white
  if (colorToken === 'white') {
    return 'hsl(0 0% 100%)';
  }
  
  // If we have a direct HSL value and it's pure white, use it directly
  if (hslValue && hslValue.trim() === '0 0% 100%') {
    return 'hsl(0 0% 100%)';
  }
  
  // Standard CSS variable reference for all other colors
  return `hsl(var(--${colorToken}))`;
}

/**
 * Determine if a swatch needs a dark background for visibility
 * 
 * @param colorToken - Token name
 * @param hslValue - Optional HSL value from database
 * @returns True if dark background needed, false otherwise
 */
export function needsDarkSwatchBackground(colorToken: string, hslValue?: string): boolean {
  if (colorToken === 'white') return true;
  return isLightColor(hslValue);
}
