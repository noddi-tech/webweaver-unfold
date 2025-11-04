import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Save, Palette, AlertTriangle, CheckCircle2, Zap, Plus, Trash2, Sparkles, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { GradientEditor } from "./GradientEditor";
import { 
  calculateContrastRatio, 
  getOptimalTextColor, 
  hexToHsl, 
  hslToHex, 
  getContrastLevel,
  isValidHex 
} from "@/lib/colorUtils";

interface ColorToken {
  name: string;
  cssVar: string;
  value: string;
  className: string;
  isForeground?: boolean;
  backgroundPair?: string;
  description: string;
  type?: 'color' | 'gradient';
  gradientDirection?: string;
  gradientStops?: string[];
}

const defaultColors: ColorToken[] = [
  {
    name: "Background",
    cssVar: "--background",
    value: "0 0% 100%",
    className: "bg-background",
    description: "Pure white main background",
    type: "color"
  },
  {
    name: "Foreground",
    cssVar: "--foreground",
    value: "264 58% 20%",
    className: "bg-foreground",
    isForeground: true,
    backgroundPair: "--background",
    description: "Dark blue text on white backgrounds",
    type: "color"
  },
  {
    name: "Card",
    cssVar: "--card",
    value: "264 60% 15%",
    className: "bg-card",
    description: "Dark blue card background",
    type: "color"
  },
  {
    name: "Card Foreground",
    cssVar: "--card-foreground",
    value: "0 0% 100%",
    className: "bg-card-foreground",
    isForeground: true,
    backgroundPair: "--card",
    description: "White text on dark cards",
    type: "color"
  },
  {
    name: "Border",
    cssVar: "--border",
    value: "0 0% 90%",
    className: "border-border",
    description: "Light gray borders",
    type: "color"
  },
  {
    name: "Primary",
    cssVar: "--primary",
    value: "264 58% 20%",
    className: "bg-primary",
    description: "Primary dark blue for buttons",
    type: "color"
  },
  {
    name: "Primary Foreground",
    cssVar: "--primary-foreground",
    value: "0 0% 100%",
    className: "bg-primary-foreground",
    isForeground: true,
    backgroundPair: "--primary",
    description: "White text on primary",
    type: "color"
  },
  {
    name: "Muted",
    cssVar: "--muted",
    value: "0 0% 96%",
    className: "bg-muted",
    description: "Light gray for disabled states",
    type: "color"
  },
  {
    name: "Muted Foreground",
    cssVar: "--muted-foreground",
    value: "0 0% 45%",
    className: "bg-muted-foreground",
    isForeground: true,
    backgroundPair: "--muted",
    description: "Gray text for muted content",
    type: "color"
  },
  {
    name: "Destructive",
    cssVar: "--destructive",
    value: "0 84% 60%",
    className: "bg-destructive",
    description: "Red for errors and delete actions",
    type: "color"
  },
  {
    name: "Destructive Foreground",
    cssVar: "--destructive-foreground",
    value: "0 0% 100%",
    className: "bg-destructive-foreground",
    isForeground: true,
    backgroundPair: "--destructive",
    description: "White text on destructive",
    type: "color"
  },
  {
    name: "Hero Gradient",
    cssVar: "--gradient-hero",
    value: "linear-gradient(135deg, hsl(264 60% 15%), hsl(252 70% 25%))",
    className: "bg-gradient-hero",
    type: "gradient",
    gradientDirection: "135deg",
    gradientStops: ["264 60% 15%", "252 70% 25%"],
    description: "Dark blue to purple gradient for cards and headings"
  }
];

export const EditableColorSystem = () => {
  const [colors, setColors] = useState<ColorToken[]>(defaultColors);
  const [colorFormat, setColorFormat] = useState<'hsl' | 'hex' | 'rgb'>('hsl');
  const [autoContrast, setAutoContrast] = useState(true);
  const [hexInputValues, setHexInputValues] = useState<Record<number, string>>({});
  const { toast } = useToast();

  // Filter to show only semantic tokens (hide primitives from CMS)
  const semanticColors = colors.filter(color => {
    const isPrimitive = 
      color.cssVar.includes('color-primary-') ||
      color.cssVar.includes('color-accent-') ||
      color.cssVar.includes('color-neutral-') ||
      color.cssVar.includes('color-success-') ||
      color.cssVar.includes('color-warning-') ||
      color.cssVar.includes('color-error-');
    
    return !isPrimitive; // Only show non-primitive tokens
  });

  useEffect(() => {
    const root = document.documentElement;
    const computed = getComputedStyle(root);
    const initial = defaultColors.map((c) => ({
      ...c,
      value: (computed.getPropertyValue(c.cssVar) || c.value).trim(),
    }));
    setColors(initial);
  }, []);

  const updateColor = (index: number, value: string, format: 'hsl' | 'hex' = 'hsl') => {
    const newColors = [...colors];
    
    // Convert to HSL if input is HEX
    if (format === 'hex') {
      // Ensure hex value starts with #
      if (!value.startsWith('#')) {
        value = '#' + value;
      }
      // Only convert if it's a valid hex color
      if (!isValidHex(value)) {
        return; // Don't update if hex is invalid
      }
      value = hexToHsl(value);
    }
    
    newColors[index].value = value;
    
    // Auto-contrast: Update foreground colors automatically when background changes
    if (autoContrast && !newColors[index].isForeground) {
      const relatedForeground = newColors.find(color => 
        color.backgroundPair === newColors[index].cssVar
      );
      if (relatedForeground) {
        const optimalTextColor = getOptimalTextColor(value);
        const foregroundIndex = newColors.findIndex(color => 
          color.cssVar === relatedForeground.cssVar
        );
        if (foregroundIndex !== -1) {
          newColors[foregroundIndex].value = optimalTextColor;
        }
      }
    }
    
    setColors(newColors);
    
    // Apply to CSS variables immediately
    const root = document.documentElement;
    newColors.forEach(color => {
      root.style.setProperty(color.cssVar, color.value);
    });
  };

  const fixContrast = (colorIndex: number) => {
    const newColors = [...colors];
    const color = newColors[colorIndex];
    
    // Only fix foreground colors that have a background pair
    if (color.isForeground && color.backgroundPair) {
      const backgroundColor = newColors.find(c => c.cssVar === color.backgroundPair);
      if (backgroundColor) {
        const optimalTextColor = getOptimalTextColor(backgroundColor.value);
        newColors[colorIndex].value = optimalTextColor;
        setColors(newColors);
        
        // Apply to CSS variables immediately
        const root = document.documentElement;
        root.style.setProperty(color.cssVar, optimalTextColor);
        
        toast({
          title: "Contrast fixed",
          description: `${color.name} color automatically adjusted for better accessibility.`,
        });
      }
    } else {
      toast({
        title: "Cannot fix contrast",
        description: "This color is not a text color or doesn't have a background pair.",
        variant: "destructive",
      });
    }
  };

  const fixAllContrast = () => {
    const newColors = [...colors];
    let fixedCount = 0;
    const failures: string[] = [];

    newColors.forEach((color, index) => {
      if (color.isForeground && color.backgroundPair) {
        const backgroundColor = newColors.find(c => c.cssVar === color.backgroundPair);
        if (backgroundColor) {
          const bgHex = hslToHex(backgroundColor.value);
          const fgHex = hslToHex(color.value);
          const currentRatio = calculateContrastRatio(bgHex, fgHex);
          
          if (currentRatio < 4.5) {
            const optimalTextColor = getOptimalTextColor(backgroundColor.value);
            newColors[index].value = optimalTextColor;
            fixedCount++;
            failures.push(`${color.name} (was ${currentRatio.toFixed(2)}:1)`);
          }
        }
      }
    });

    if (fixedCount > 0) {
      setColors(newColors);
      
      // Apply to CSS variables immediately
      const root = document.documentElement;
      newColors.forEach(color => {
        root.style.setProperty(color.cssVar, color.value);
      });
      
      toast({
        title: `🎯 Fixed ${fixedCount} Contrast Issue${fixedCount > 1 ? 's' : ''}`,
        description: (
          <div className="mt-2 text-xs">
            <p className="font-semibold mb-1">Updated to meet WCAG AA (4.5:1):</p>
            <ul className="list-disc list-inside space-y-1">
              {failures.slice(0, 3).map((f, i) => (
                <li key={i}>{f}</li>
              ))}
              {failures.length > 3 && <li>...and {failures.length - 3} more</li>}
            </ul>
          </div>
        ),
        duration: 6000,
      });
    } else {
      toast({
        title: "✅ All Contrast Ratios Pass",
        description: "All text-background pairs meet WCAG AA accessibility standards (4.5:1 minimum)",
        variant: "default",
      });
    }
  };

  const saveColors = () => {
    toast({
      title: "Applied",
      description: "Changes apply instantly via CSS variables (no storage).",
    });
  };

  const resetColors = () => {
    const root = document.documentElement;
    // Remove inline overrides to fall back to CSS defaults
    defaultColors.forEach(color => {
      root.style.removeProperty(color.cssVar);
    });
    // Re-read computed styles after reset
    const computed = getComputedStyle(root);
    const refreshed = defaultColors.map(c => ({
      ...c,
      value: (computed.getPropertyValue(c.cssVar) || c.value).trim(),
    }));
    setColors(refreshed);
    toast({
      title: "Colors reset",
      description: "Reverted to CSS defaults from index.css.",
    });
  };

  const copyColor = (color: ColorToken) => {
    navigator.clipboard.writeText(`${color.cssVar}: ${color.value};`);
    toast({
      title: "Copied to clipboard",
      description: `${color.name} color copied`,
    });
  };

  const getContrastInfo = (color: ColorToken) => {
    if (!color.backgroundPair) return null;
    
    const backgroundColor = colors.find(c => c.cssVar === color.backgroundPair);
    if (!backgroundColor) return null;
    
    // Convert HSL to HEX for contrast calculation
    const fgHex = hslToHex(color.value);
    const bgHex = hslToHex(backgroundColor.value);
    const ratio = calculateContrastRatio(fgHex, bgHex);
    const level = getContrastLevel(ratio);
    
    // Determine badge variant based on contrast level
    let badge: "default" | "secondary" | "destructive" | "outline" = "default";
    if (level === 'AAA') badge = "default";
    else if (level === 'AA') badge = "secondary";
    else if (level === 'AA Large') badge = "outline";
    else badge = "destructive";
    
    return { ratio: ratio.toFixed(2), level, badge };
  };

  const formatColorValue = (value: string, format: 'hsl' | 'hex' | 'rgb') => {
    switch (format) {
      case 'hex':
        return hslToHex(value);
      case 'rgb':
        const hex = hslToHex(value);
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
      default:
        return `hsl(${value})`;
    }
  };

  const handleHexInputChange = (index: number, hexValue: string) => {
    // Store the raw input value
    setHexInputValues(prev => ({ ...prev, [index]: hexValue }));
    
    // Only update the color if it's a valid hex
    if (isValidHex(hexValue)) {
      updateColor(index, hexValue, 'hex');
    }
  };

  const handleHexInputBlur = (index: number) => {
    const hexValue = hexInputValues[index];
    if (hexValue && !isValidHex(hexValue)) {
      // Reset to current color value if invalid
      setHexInputValues(prev => {
        const newValues = { ...prev };
        delete newValues[index];
        return newValues;
      });
    }
  };

  const getHexInputValue = (index: number, color: ColorToken) => {
    return hexInputValues[index] ?? formatColorValue(color.value, 'hex');
  };

  const exportToFigma = () => {
    const figmaTokens = {
      name: "Noddi Tech Design Tokens",
      version: "1.0.0",
      updated: new Date().toISOString(),
      description: "Semantic color tokens for Noddi Tech design system",
      colors: semanticColors
        .filter(c => !c.type || c.type === 'color')  // Exclude gradients
        .map(c => {
          const hexValue = c.value.includes('/') 
            ? hslToHex(`hsl(${c.value.split('/')[0].trim()})`) 
            : hslToHex(`hsl(${c.value})`);
          
          return {
            name: c.name,
            cssVar: c.cssVar,
            value: hexValue,
            hslValue: c.value,
            description: c.description,
            category: c.isForeground ? 'Text Colors' : 
                      c.cssVar.includes('bg-') ? 'Surface Colors' :
                      c.cssVar.includes('interactive-') ? 'Interactive Colors' :
                      'Other',
          };
        })
    };

    const blob = new Blob([JSON.stringify(figmaTokens, null, 2)], 
      { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `noddi-design-tokens-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "✅ Tokens Exported to Figma",
      description: (
        <div className="text-xs mt-2">
          <p>Import this JSON file into Figma using:</p>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Install "Tokens Studio" plugin</li>
            <li>Click "Import" → Select JSON file</li>
            <li>Map tokens to Figma styles</li>
          </ol>
        </div>
      ),
      duration: 8000,
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Colors & Design Tokens</h2>
          <p className="text-muted-foreground text-lg">
            The single source of truth for all colors and design tokens used throughout the application.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={fixAllContrast}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fix All Contrast
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-contrast" className="text-sm">Auto Contrast</Label>
            <Switch 
              id="auto-contrast"
              checked={autoContrast} 
              onCheckedChange={setAutoContrast}
            />
          </div>
          <Select value={colorFormat} onValueChange={(value: 'hsl' | 'hex' | 'rgb') => setColorFormat(value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hsl">HSL</SelectItem>
              <SelectItem value="hex">HEX</SelectItem>
              <SelectItem value="rgb">RGB</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetColors}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveColors}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={exportToFigma} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export to Figma
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1">Editing Semantic Tokens</h4>
            <p className="text-xs text-muted-foreground">
              You're editing semantic tokens that control the design system. 
              Primitive color scales (e.g., primary-500, neutral-700) are hidden to prevent accidental changes. 
              Changes here will update both light and dark themes automatically.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {semanticColors.map((color, index) => {
          const contrastInfo = getContrastInfo(color);
          
          return (
            <Card key={color.cssVar} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">{color.name}</h3>
                    {color.isForeground && <Palette className="w-3 h-3 text-muted-foreground" />}
                    {color.type === 'gradient' && <Sparkles className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <code className="text-xs font-mono text-muted-foreground">
                    {color.cssVar}
                  </code>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {color.description}
                  </p>
                  {contrastInfo && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={contrastInfo.badge}>
                        {contrastInfo.level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {contrastInfo.ratio}:1
                      </span>
                      {parseFloat(contrastInfo.ratio) < 4.5 && color.isForeground && (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-destructive" />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => fixContrast(index)}
                            className="text-xs h-6 px-2"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Fix
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="icon" onClick={() => copyColor(color)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            
            <div className="space-y-3">
              <div 
                className="w-full h-16 rounded-lg border border-border shadow-sm"
                style={{ 
                  background: color.type === 'gradient' ? color.value : `hsl(${color.value})` 
                }}
              />
              
              <div className="flex gap-2">
                {color.type !== 'gradient' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Palette className="w-3 h-3 mr-1" />
                        Pick Color
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker
                        color={hslToHex(color.value)}
                        onChange={(hex) => updateColor(index, hex, 'hex')}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <GradientEditor
                    value={color.value}
                    onChange={(newValue) => updateColor(index, newValue, 'hsl')}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`color-${index}`} className="text-xs text-muted-foreground">
                  {color.type === 'gradient' ? 'CSS Gradient' : `${colorFormat.toUpperCase()} Value`}
                </Label>
                {color.type === 'gradient' ? (
                  <Textarea
                    id={`color-${index}`}
                    value={color.value}
                    onChange={(e) => updateColor(index, e.target.value, 'hsl')}
                    className="font-mono text-xs min-h-[60px]"
                    placeholder="linear-gradient(135deg, hsl(...), hsl(...))"
                  />
                ) : colorFormat === 'hsl' ? (
                  <Input
                    id={`color-${index}`}
                    value={color.value}
                    onChange={(e) => updateColor(index, e.target.value, 'hsl')}
                    className="font-mono text-xs"
                    placeholder="0 0% 0%"
                  />
                ) : colorFormat === 'hex' ? (
                  <Input
                    id={`color-${index}`}
                    value={getHexInputValue(index, color)}
                    onChange={(e) => handleHexInputChange(index, e.target.value)}
                    onBlur={() => handleHexInputBlur(index)}
                    className="font-mono text-xs"
                    placeholder="#000000"
                  />
                ) : (
                  <Input
                    id={`color-${index}`}
                    value={formatColorValue(color.value, colorFormat)}
                    className="font-mono text-xs"
                    placeholder="rgb(0, 0, 0)"
                    readOnly
                  />
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                <code>className: {color.className}</code>
              </div>
            </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};