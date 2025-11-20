import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Copy, Download, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Type definitions
interface ColorOption {
  value: string;
  label: string;
  description: string;
  preview: string;
  cssVar?: string;
  type: 'solid' | 'gradient' | 'glass';
  category: string;
  optimalTextColor?: 'white' | 'dark' | 'auto';
  hslValue?: string;
}

interface TextColorOption {
  value: string;
  label: string;
  description: string;
  preview: string;
  className: string;
}

interface ColorCategory {
  title: string;
  description: string;
  colors: ColorOption[];
}

// Category metadata for dynamic grouping
const CATEGORY_METADATA: Record<string, { title: string; description: string }> = {
  surfaces: {
    title: "Surface Colors",
    description: "Background and surface colors for layouts, cards, and containers"
  },
  interactive: {
    title: "Interactive Colors",
    description: "Brand and action colors for buttons, links, and interactive elements"
  },
  feedback: {
    title: "Feedback Colors",
    description: "Status colors for success, warning, and error states"
  },
  gradients: {
    title: "Standard Gradients",
    description: "Multi-color gradient backgrounds for heroes and accents"
  },
  experimental: {
    title: "Experimental Gradients",
    description: "Advanced mesh gradients inspired by OpenAI & Mixpanel"
  },
  glass: {
    title: "Glass Effects",
    description: "Frosted glass and translucent overlay effects"
  },
  text: {
    title: "Text Colors",
    description: "Foreground text colors for various contexts"
  }
};

// Helper function to convert HSL to HEX
const hslToHex = (hsl: string): string => {
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

// Helper function to convert HSL to RGB
const hslToRgb = (hsl: string): string => {
  const match = hsl.match(/(\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%/);
  if (!match) return 'rgb(0, 0, 0)';
  
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
  
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};

// Helper function to copy to clipboard
const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  } catch (err) {
    toast({
      title: "Copy Failed",
      description: "Could not copy to clipboard",
      variant: "destructive",
    });
  }
};

// Map text colors to their intended backgrounds for accurate preview and contrast checking
const TEXT_COLOR_BACKGROUND_MAP: Record<string, Array<{ bg: string; label: string }>> = {
  'text-white': [
    { bg: 'bg-card', label: 'Card' },
    { bg: 'bg-gradient-hero', label: 'Hero Gradient' }
  ],
  'text-foreground': [
    { bg: 'bg-background', label: 'Background' }
  ],
  'text-card-foreground': [
    { bg: 'bg-card', label: 'Card' }
  ],
  'text-muted-foreground': [
    { bg: 'bg-background', label: 'Background' },
    { bg: 'bg-muted', label: 'Muted' }
  ],
  'text-primary-foreground': [
    { bg: 'bg-primary', label: 'Primary' }
  ],
  'text-secondary-foreground': [
    { bg: 'bg-secondary', label: 'Secondary' }
  ],
  'text-accent-foreground': [
    { bg: 'bg-accent', label: 'Accent' }
  ],
  'text-destructive-foreground': [
    { bg: 'bg-destructive', label: 'Destructive' }
  ]
};

interface ColorCategory {
  title: string;
  description: string;
  items: (ColorOption | TextColorOption)[];
  type: 'background' | 'text';
}

export function ColorPaletteTab() {
  const [copiedValue, setCopiedValue] = useState<string>("");

  const handleCopy = async (value: string, label: string, format: 'hex' | 'hsl' | 'css' = 'hex') => {
    await copyToClipboard(value, `${label} (${format.toUpperCase()})`);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(""), 2000);
  };

  const handleExport = () => {
    const paletteData = exportColorPalette();
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `color-palette-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "Palette Exported (Legacy)",
      description: "Color palette downloaded as JSON file",
    });
  };

  const handleDatabaseExport = async () => {
    try {
      // Fetch all active color tokens from database
      const { data: colorTokens, error } = await supabase
        .from('color_tokens')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (!colorTokens || colorTokens.length === 0) {
        toast({
          title: "No Colors Found",
          description: "No active color tokens in database",
          variant: "destructive",
        });
        return;
      }

      // Organize colors by category
      const organizedColors: Record<string, any> = {};
      
      colorTokens.forEach((token) => {
        const category = token.category || 'other';
        
        if (!organizedColors[category]) {
          organizedColors[category] = {};
        }

        // Build color entry with all formats
        const colorEntry: any = {
          label: token.label || token.css_var,
          description: token.description || '',
          cssVar: token.css_var,
          value: token.value,
          type: token.color_type || 'solid',
          optimalTextColor: token.optimal_text_color || 'auto',
          previewClass: token.preview_class || ''
        };

        // Add format conversions for solid colors
        if (token.color_type === 'solid' && token.value) {
          colorEntry.hsl = token.value;
          colorEntry.hex = hslToHex(token.value);
          colorEntry.rgb = hslToRgb(token.value);
        }

        organizedColors[category][token.css_var] = colorEntry;
      });

      // Build export data with metadata
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "2.0",
          source: "Navio Design System - Live Database",
          totalColors: colorTokens.length,
          format: "Figma Tokens Studio compatible"
        },
        colors: organizedColors
      };

      // Generate download
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `navio-colors-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Navio Colors Exported",
        description: `${colorTokens.length} colors exported from database`,
      });
    } catch (error) {
      console.error('Database export error:', error);
      toast({
        title: "Export Failed",
        description: "Could not export colors from database",
        variant: "destructive",
      });
    }
  };

  // Organize colors by category
  const categories: ColorCategory[] = [
    {
      title: "Brand Colors",
      description: "Primary, secondary, and accent colors",
      items: ALL_BACKGROUND_OPTIONS.filter(c => 
        c.category === 'interactive' && c.type === 'solid'
      ),
      type: 'background'
    },
    {
      title: "Surface Colors",
      description: "Backgrounds, cards, and muted surfaces",
      items: ALL_BACKGROUND_OPTIONS.filter(c => 
        c.category === 'surfaces' && c.type === 'solid'
      ),
      type: 'background'
    },
    {
      title: "Feedback Colors",
      description: "Success, error, and warning states",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.category === 'feedback'),
      type: 'background'
    },
    {
      title: "Gradients",
      description: "Multi-color gradient backgrounds",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.type === 'gradient'),
      type: 'background'
    },
    {
      title: "Glass Effects",
      description: "Transparent and blurred backgrounds",
      items: ALL_BACKGROUND_OPTIONS.filter(c => c.type === 'glass'),
      type: 'background'
    },
    {
      title: "Text Colors",
      description: "Semantic text color options",
      items: TEXT_COLOR_OPTIONS,
      type: 'text'
    }
  ];

  const renderBackgroundColor = (color: ColorOption) => {
    const hslValue = color.cssVar ? getCssVariableValue(color.cssVar) : '';
    const hexValue = hslValue ? hslToHex(hslValue) : '';
    const rgbValue = hslValue ? hslToRgb(hslValue) : '';

    return (
      <Card key={color.value} className="p-4 space-y-3 hover:shadow-md transition-shadow bg-background text-foreground border">
        {/* Color Preview */}
        <div className={`h-24 rounded-lg ${color.preview} border relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-medium ${
              color.optimalTextColor === 'white' ? 'text-white' : 'text-foreground'
            }`}>
              {color.label}
            </span>
          </div>
        </div>

        {/* Color Info */}
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-sm">{color.label}</h4>
            <p className="text-xs text-muted-foreground">{color.description}</p>
          </div>

          {/* CSS Variable */}
          {color.cssVar && (
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {color.cssVar}
              </code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => handleCopy(color.cssVar!, color.label, 'css')}
              >
                {copiedValue === color.cssVar ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          )}

          {/* CSS Class */}
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
              {color.value}
            </code>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => handleCopy(color.value, color.label, 'css')}
            >
              {copiedValue === color.value ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          </div>

          {/* Color Values */}
          {hslValue && (
            <>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">HSL</p>
                  <code className="text-xs">{hslValue}</code>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => handleCopy(hslValue, color.label, 'hsl')}
                >
                  {copiedValue === hslValue ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              
              {hexValue && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">HEX</p>
                    <code className="text-xs font-semibold">{hexValue}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopy(hexValue, color.label, 'hex')}
                  >
                    {copiedValue === hexValue ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}

              {rgbValue && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">RGB</p>
                    <code className="text-xs">{rgbValue}</code>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => handleCopy(rgbValue, color.label, 'css')}
                  >
                    {copiedValue === rgbValue ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Optimal Text Color & Contrast */}
          {color.optimalTextColor && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Best with: <span className="font-medium">{color.optimalTextColor} text</span>
              </p>
              {color.contrastRatio && (
                <p className="text-xs text-muted-foreground">
                  Contrast: <span className="font-medium">{color.contrastRatio}:1</span>
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  };

  const renderTextColor = (color: TextColorOption) => {
    const backgrounds = TEXT_COLOR_BACKGROUND_MAP[color.value] || [
      { bg: 'bg-background', label: 'Background' }
    ];

    return (
      <Card key={color.value} className="p-4 space-y-3 hover:shadow-md transition-shadow bg-background text-foreground border">
        {/* Color Info Header */}
        <div>
          <h4 className="font-semibold text-sm">{color.label}</h4>
          <p className="text-xs text-muted-foreground">{color.description}</p>
        </div>

        {/* Preview on intended backgrounds with contrast info */}
        <div className="space-y-3">
          {backgrounds.map((bgInfo) => {
            // Calculate contrast using the function from colorSystem
            const contrastInfo = meetsContrastRequirement(bgInfo.bg, color.value);
            
            return (
              <div key={bgInfo.bg} className="space-y-1.5">
                {/* Background label and contrast info */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">On {bgInfo.label}</span>
                  <div className="flex items-center gap-2">
                    {/* Contrast ratio */}
                    <span className="font-mono font-semibold text-foreground">{contrastInfo.ratio.toFixed(2)}:1</span>
                    
                    {/* WCAG Level Badge */}
                    <Badge 
                      variant={
                        contrastInfo.level === 'AAA' ? 'default' : 
                        contrastInfo.level === 'AA' || contrastInfo.level === 'AA Large' ? 'secondary' : 
                        'destructive'
                      }
                      className="text-xs h-5 gap-1"
                    >
                      {contrastInfo.level === 'AAA' && <CheckCircle2 className="h-3 w-3" />}
                      {contrastInfo.level === 'Fail' && <AlertCircle className="h-3 w-3" />}
                      {contrastInfo.level}
                    </Badge>
                    
                    {/* Fix button for insufficient contrast */}
                    {contrastInfo.level !== 'AAA' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs"
                        onClick={() => {
                          toast({
                            title: "Contrast Improvement Needed",
                            description: `${color.label} on ${bgInfo.label} has ${contrastInfo.ratio.toFixed(2)}:1 contrast (${contrastInfo.level}). For AAA compliance, aim for 7:1 or higher. Consider adjusting colors in your theme settings.`,
                            duration: 5000,
                          });
                        }}
                      >
                        Fix
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Preview box with actual background */}
                <div className={`h-16 rounded-lg ${bgInfo.bg} border flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${color.className}`}>Aa</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CSS Class - copyable */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
            {color.value}
          </code>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={() => handleCopy(color.value, color.label, 'css')}
          >
            {copiedValue === color.value ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Complete Color Palette</h3>
          <p className="text-sm text-muted-foreground">
            Reference guide for all available colors with copyable values
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDatabaseExport} variant="default" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Navio Colors (Database)
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export (Legacy)
          </Button>
        </div>
      </div>

      {/* Collapsible Categories */}
      <Accordion type="multiple" defaultValue={["brand-colors", "surface-colors", "text-colors"]} className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.title} value={category.title.toLowerCase().replace(/\s+/g, '-')}>
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">{category.title}</h4>
                <Badge variant="outline" className="text-xs">{category.items.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-muted-foreground mb-4">{category.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => 
                  category.type === 'background' 
                    ? renderBackgroundColor(item as ColorOption)
                    : renderTextColor(item as TextColorOption)
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
