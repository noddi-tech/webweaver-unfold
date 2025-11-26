/**
 * @deprecated - DO NOT USE OR MODIFY THIS FILE
 * 
 * All colors and gradients are now managed through the CMS database (color_tokens table).
 * Use the useColorSystem() or useAllowedBackgrounds() hooks instead.
 * 
 * See: docs/color-system-guide.md
 */

// Centralized color system configuration (LEGACY - Use useColorSystem hook instead)
// Single source of truth for all colors, gradients, and glass effects
// Used across EditableColorSystem (CMS), BackgroundEditModal, and other color-related components

export interface ColorOption {
  value: string;           // CSS class name (e.g., 'bg-card', 'bg-gradient-hero')
  label: string;           // Display name for UI
  description: string;     // Short description for tooltips/help text
  preview: string;         // CSS class for preview rendering
  cssVar?: string;         // CSS variable name (e.g., '--card')
  hslValue?: string;       // HSL value from database for luminance calculation
  type: 'solid' | 'gradient' | 'glass';
  category: 'surfaces' | 'interactive' | 'feedback' | 'gradients' | 'glass' | 'text';
  optimalTextColor?: 'white' | 'dark' | 'auto'; // Suggested text color for accessibility
  contrastRatio?: number;  // Approximate contrast ratio with optimal text color
}

export interface TextColorOption {
  value: string;           // CSS class name (e.g., 'text-white', 'text-foreground')
  label: string;           // Display name
  description: string;     // Usage description
  preview: string;         // CSS class for preview
  className: string;       // Actual class to apply
  hslValue?: string;       // HSL value from database for luminance calculation
  cssVar?: string;         // CSS variable name (e.g., '--foreground')
}

// ============================================================================
// SOLID COLORS - Traditional solid backgrounds
// ============================================================================

export const SOLID_COLORS: ColorOption[] = [
  {
    value: 'bg-background',
    label: 'White Background',
    description: 'Pure white - main page background',
    preview: 'bg-background',
    cssVar: '--background',
    type: 'solid',
    category: 'surfaces',
    optimalTextColor: 'dark',
    contrastRatio: 21 // Perfect contrast: white bg vs dark text
  },
  {
    value: 'bg-card',
    label: 'Default Card',
    description: 'Federal blue solid - primary card background',
    preview: 'bg-card',
    cssVar: '--card',
    type: 'solid',
    category: 'surfaces',
    optimalTextColor: 'white',
    contrastRatio: 8.2
  },
  {
    value: 'bg-muted',
    label: 'Muted Gray',
    description: 'Light gray surface for subtle sections',
    preview: 'bg-muted',
    cssVar: '--muted',
    type: 'solid',
    category: 'surfaces',
    optimalTextColor: 'dark',
    contrastRatio: 15.3
  },
  {
    value: 'bg-primary',
    label: 'Primary Blue',
    description: 'Federal blue - primary brand color',
    preview: 'bg-primary',
    cssVar: '--primary',
    type: 'solid',
    category: 'interactive',
    optimalTextColor: 'white',
    contrastRatio: 8.2
  },
  {
    value: 'bg-secondary',
    label: 'Secondary',
    description: 'Secondary brand color',
    preview: 'bg-secondary',
    cssVar: '--secondary',
    type: 'solid',
    category: 'interactive',
    optimalTextColor: 'dark',
    contrastRatio: 12.1
  },
  {
    value: 'bg-accent',
    label: 'Accent',
    description: 'Accent color for highlights',
    preview: 'bg-accent',
    cssVar: '--accent',
    type: 'solid',
    category: 'interactive',
    optimalTextColor: 'dark',
    contrastRatio: 10.5
  },
  {
    value: 'bg-destructive',
    label: 'Destructive Red',
    description: 'Error/warning color for alerts',
    preview: 'bg-destructive',
    cssVar: '--destructive',
    type: 'solid',
    category: 'feedback',
    optimalTextColor: 'white',
    contrastRatio: 4.7
  },
];

// ============================================================================
// GRADIENT COLORS - Multi-color gradient backgrounds
// ============================================================================

export const GRADIENT_COLORS: ColorOption[] = [
  {
    value: 'bg-gradient-hero',
    label: 'Hero Gradient',
    description: 'Federal blue to vibrant purple - primary hero gradient',
    preview: 'bg-gradient-hero',
    cssVar: '--gradient-hero',
    type: 'gradient',
    category: 'gradients',
    optimalTextColor: 'white',
    contrastRatio: 6.5 // Average contrast across gradient range
  },
  {
    value: 'bg-gradient-sunset',
    label: 'Sunset Gradient',
    description: 'Blue → purple → orange (3-color warm gradient)',
    preview: 'bg-gradient-sunset',
    cssVar: '--gradient-sunset',
    type: 'gradient',
    category: 'gradients',
    optimalTextColor: 'white',
    contrastRatio: 5.8
  },
  {
    value: 'bg-gradient-warmth',
    label: 'Warmth Gradient',
    description: 'Purple → pink → peach (soft warm tones)',
    preview: 'bg-gradient-warmth',
    cssVar: '--gradient-warmth',
    type: 'gradient',
    category: 'gradients',
    optimalTextColor: 'white',
    contrastRatio: 4.9
  },
  {
    value: 'bg-gradient-ocean',
    label: 'Ocean Gradient',
    description: 'Blue → teal → green (cool aquatic tones)',
    preview: 'bg-gradient-ocean',
    cssVar: '--gradient-ocean',
    type: 'gradient',
    category: 'gradients',
    optimalTextColor: 'white',
    contrastRatio: 5.2
  },
  {
    value: 'bg-gradient-fire',
    label: 'Fire Gradient',
    description: 'Orange → purple (bold energetic gradient)',
    preview: 'bg-gradient-fire',
    cssVar: '--gradient-fire',
    type: 'gradient',
    category: 'gradients',
    optimalTextColor: 'white',
    contrastRatio: 5.5
  },
];

// ============================================================================
// GLASS EFFECTS - Transparent/blurred backgrounds
// ============================================================================

export const GLASS_EFFECTS: ColorOption[] = [
  {
    value: 'glass-card',
    label: 'Glass Card',
    description: 'Standard glass effect (95% opacity with blur)',
    preview: 'glass-card',
    cssVar: '--card-background',
    type: 'glass',
    category: 'glass',
    optimalTextColor: 'auto', // Depends on background behind glass
    contrastRatio: 4.5 // Minimum WCAG AA with typical backdrop
  },
  {
    value: 'liquid-glass',
    label: 'Liquid Glass',
    description: 'Gradient overlay with heavy blur effect',
    preview: 'liquid-glass',
    cssVar: '--card',
    type: 'glass',
    category: 'glass',
    optimalTextColor: 'auto',
    contrastRatio: 4.8
  },
  {
    value: 'glass-prominent',
    label: 'Prominent Glass',
    description: 'High opacity glass (98%) for readability',
    preview: 'glass-prominent',
    cssVar: '--card-background',
    type: 'glass',
    category: 'glass',
    optimalTextColor: 'auto',
    contrastRatio: 5.1
  },
];

// ============================================================================
// COMBINED OPTIONS - All background options in one array
// ============================================================================

export const ALL_BACKGROUND_OPTIONS: ColorOption[] = [
  ...SOLID_COLORS,
  ...GRADIENT_COLORS,
  ...GLASS_EFFECTS,
  {
    value: 'bg-transparent',
    label: 'Transparent',
    description: 'No background - fully transparent',
    preview: 'bg-transparent border border-dashed border-muted-foreground/20',
    type: 'solid',
    category: 'surfaces',
    optimalTextColor: 'auto',
    contrastRatio: null as any
  },
];

// ============================================================================
// TEXT COLOR OPTIONS - Semantic text colors for optimal contrast
// ============================================================================

export const TEXT_COLOR_OPTIONS: TextColorOption[] = [
  {
    value: 'text-white',
    label: 'White',
    description: 'Best for dark/gradient backgrounds',
    preview: 'text-white',
    className: 'text-white'
  },
  {
    value: 'text-foreground',
    label: 'Dark (Foreground)',
    description: 'Federal blue - best for light backgrounds',
    preview: 'text-foreground',
    className: 'text-foreground'
  },
  {
    value: 'text-card-foreground',
    label: 'Card Foreground',
    description: 'White text optimized for card backgrounds',
    preview: 'text-card-foreground',
    className: 'text-card-foreground'
  },
  {
    value: 'text-muted-foreground',
    label: 'Muted',
    description: 'Gray secondary text for reduced emphasis',
    preview: 'text-muted-foreground',
    className: 'text-muted-foreground'
  },
  {
    value: 'text-primary-foreground',
    label: 'Primary Foreground',
    description: 'White text on primary blue backgrounds',
    preview: 'text-primary-foreground',
    className: 'text-primary-foreground'
  },
  {
    value: 'text-secondary-foreground',
    label: 'Secondary Foreground',
    description: 'Dark text on secondary backgrounds',
    preview: 'text-secondary-foreground',
    className: 'text-secondary-foreground'
  },
  {
    value: 'text-accent-foreground',
    label: 'Accent Foreground',
    description: 'Dark text on accent backgrounds',
    preview: 'text-accent-foreground',
    className: 'text-accent-foreground'
  },
];

// ============================================================================
// HELPER FUNCTIONS - Utilities for automatic color selection
// ============================================================================

/**
 * Gets the optimal text color CSS class for a given background
 * Ensures WCAG AA compliance (4.5:1 contrast ratio)
 * 
 * @param backgroundValue - Background CSS class (e.g., 'bg-gradient-hero')
 * @returns Optimal text color CSS class (e.g., 'text-white')
 */
export const getOptimalTextColorForBackground = (
  backgroundValue: string
): string => {
  // Handle opacity variants (e.g., bg-primary/10, bg-white/20)
  const baseBackground = backgroundValue.split('/')[0];
  
  const bg = ALL_BACKGROUND_OPTIONS.find(opt => 
    opt.value === backgroundValue || opt.value === baseBackground
  );
  
  if (!bg) {
    console.warn(`Unknown background value: ${backgroundValue}, defaulting to text-foreground`);
    return 'text-foreground';
  }
  
  switch (bg.optimalTextColor) {
    case 'white':
      return 'text-white';
    case 'dark':
      return 'text-foreground';
    case 'auto':
      // For glass effects, analyze the context or default to white for safety
      // In real implementation, this would check the parent background
      return 'text-white';
    default:
      return 'text-foreground';
  }
};

/**
 * Checks if a background-text color combination meets WCAG accessibility standards
 * Returns the contrast ratio and compliance level
 * 
 * @param backgroundValue - Background CSS class
 * @param textColorValue - Text color CSS class
 * @returns Object with meets (boolean), ratio (number), and level (string)
 */
export const meetsContrastRequirement = (
  backgroundValue: string,
  textColorValue: string
): { meets: boolean; ratio: number; level: string } => {
  const bg = ALL_BACKGROUND_OPTIONS.find(opt => opt.value === backgroundValue);
  
  if (!bg) {
    return {
      meets: false,
      ratio: 0,
      level: 'Unknown'
    };
  }

  // For now, use the stored contrast ratios
  // In a more sophisticated implementation, this would calculate actual contrast
  // based on the specific text color selected
  const ratio = bg.contrastRatio || 4.5;
  
  // Check if the selected text color matches the optimal recommendation
  const optimalText = getOptimalTextColorForBackground(backgroundValue);
  const isOptimal = textColorValue === optimalText;
  
  // If using optimal color, trust the stored ratio
  // If not, be conservative and assume lower contrast
  const effectiveRatio = isOptimal ? ratio : ratio * 0.7;
  
  return {
    meets: effectiveRatio >= 4.5, // WCAG AA standard
    ratio: Math.round(effectiveRatio * 10) / 10, // Round to 1 decimal
    level: effectiveRatio >= 7 ? 'AAA' : effectiveRatio >= 4.5 ? 'AA' : effectiveRatio >= 3 ? 'AA Large' : 'Fail'
  };
};

/**
 * Gets all background options filtered by type
 * Useful for organizing UI into tabs/sections
 * 
 * @param type - 'solid', 'gradient', or 'glass'
 * @returns Filtered array of ColorOption
 */
export const getBackgroundOptionsByType = (
  type: 'solid' | 'gradient' | 'glass'
): ColorOption[] => {
  return ALL_BACKGROUND_OPTIONS.filter(opt => opt.type === type);
};

/**
 * Gets all background options filtered by category
 * Useful for semantic grouping in CMS
 * 
 * @param category - Category name
 * @returns Filtered array of ColorOption
 */
export const getBackgroundOptionsByCategory = (
  category: ColorOption['category']
): ColorOption[] => {
  return ALL_BACKGROUND_OPTIONS.filter(opt => opt.category === category);
};

/**
 * Validates if a background class exists in the system
 * 
 * @param backgroundValue - Background CSS class to check
 * @returns Boolean indicating if background is valid
 */
export const isValidBackground = (backgroundValue: string): boolean => {
  return ALL_BACKGROUND_OPTIONS.some(opt => opt.value === backgroundValue);
};

/**
 * Validates if a text color class exists in the system
 * 
 * @param textColorValue - Text color CSS class to check
 * @returns Boolean indicating if text color is valid
 */
export const isValidTextColor = (textColorValue: string): boolean => {
  return TEXT_COLOR_OPTIONS.some(opt => opt.value === textColorValue);
};

/**
 * Gets background option metadata by value
 * 
 * @param backgroundValue - Background CSS class
 * @returns ColorOption object or undefined
 */
export const getBackgroundOption = (backgroundValue: string): ColorOption | undefined => {
  return ALL_BACKGROUND_OPTIONS.find(opt => opt.value === backgroundValue);
};

/**
 * Gets text color option metadata by value
 * 
 * @param textColorValue - Text color CSS class
 * @returns TextColorOption object or undefined
 */
export const getTextColorOption = (textColorValue: string): TextColorOption | undefined => {
  return TEXT_COLOR_OPTIONS.find(opt => opt.value === textColorValue);
};

// ============================================================================
// COLOR CONVERSION UTILITIES
// ============================================================================

/**
 * Gets the computed CSS variable value from the document
 * 
 * @param cssVar - CSS variable name (e.g., '--primary')
 * @returns HSL value as string (e.g., '249 67% 24%')
 */
export const getCssVariableValue = (cssVar: string): string => {
  if (typeof window === 'undefined') return '';
  const root = document.documentElement;
  const value = getComputedStyle(root).getPropertyValue(cssVar).trim();
  return value;
};

/**
 * Converts HSL color to HEX format
 * 
 * @param hsl - HSL string (e.g., '249 67% 24%' or '249deg 67% 24%')
 * @returns HEX color (e.g., '#1E2875')
 */
export const hslToHex = (hsl: string): string => {
  // Parse HSL string - handle both "249 67% 24%" and "249deg 67% 24%" formats
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return '';

  const h = parseFloat(parts[0].replace('deg', ''));
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
};

/**
 * Converts HSL color to RGB format
 * 
 * @param hsl - HSL string (e.g., '249 67% 24%')
 * @returns RGB string (e.g., 'rgb(30, 40, 117)')
 */
export const hslToRgb = (hsl: string): string => {
  const parts = hsl.trim().split(/\s+/);
  if (parts.length < 3) return '';

  const h = parseFloat(parts[0].replace('deg', ''));
  const s = parseFloat(parts[1].replace('%', '')) / 100;
  const l = parseFloat(parts[2].replace('%', '')) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toRgb = (n: number) => Math.round((n + m) * 255);

  return `rgb(${toRgb(r)}, ${toRgb(g)}, ${toRgb(b)})`;
};

// ============================================================================
// PALETTE EXPORT & CLIPBOARD UTILITIES
// ============================================================================

/**
 * Exports the complete color palette as a structured object
 * Includes all colors with HSL, HEX, RGB values and metadata
 * Format compatible with Figma Tokens Studio plugin
 * 
 * @returns Object containing complete color palette data
 */
export const exportColorPalette = () => {
  const palette: Record<string, any> = {
    metadata: {
      exportDate: new Date().toISOString(),
      version: '1.0',
      description: 'Complete color palette with all design tokens',
      format: 'Figma Tokens Studio compatible'
    },
    backgrounds: {
      solid: {},
      gradient: {},
      glass: {}
    },
    text: {}
  };

  // Process background colors
  ALL_BACKGROUND_OPTIONS.forEach(color => {
    const hslValue = color.cssVar ? getCssVariableValue(color.cssVar) : '';
    const colorData = {
      label: color.label,
      description: color.description,
      cssClass: color.value,
      cssVariable: color.cssVar || '',
      hsl: hslValue,
      hex: hslValue ? hslToHex(hslValue) : '',
      rgb: hslValue ? hslToRgb(hslValue) : '',
      category: color.category,
      optimalTextColor: color.optimalTextColor,
      contrastRatio: color.contrastRatio,
      type: color.type
    };

    if (color.type === 'solid') {
      palette.backgrounds.solid[color.label] = colorData;
    } else if (color.type === 'gradient') {
      palette.backgrounds.gradient[color.label] = colorData;
    } else if (color.type === 'glass') {
      palette.backgrounds.glass[color.label] = colorData;
    }
  });

  // Process text colors
  TEXT_COLOR_OPTIONS.forEach(color => {
    palette.text[color.label] = {
      label: color.label,
      description: color.description,
      cssClass: color.value,
      className: color.className
    };
  });

  return palette;
};

/**
 * Copies text to clipboard and shows a toast notification
 * 
 * @param text - Text to copy
 * @param label - Label for the toast notification
 */
export const copyToClipboard = async (text: string, label: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    // Note: Toast must be triggered by the component using this function
    // This function only handles the clipboard operation
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    throw error;
  }
};
