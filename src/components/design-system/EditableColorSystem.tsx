import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Save, Palette, AlertTriangle, CheckCircle2, Zap, Plus, Trash2, Sparkles, Download, Layers, Type, MousePointer, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { GradientEditor } from "./GradientEditor";
import { ColorCard } from "./ColorCard";
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
  category?: 'surfaces' | 'text' | 'interactive' | 'feedback' | 'gradients';
  usedIn?: string[];
  components?: string[];
}

const defaultColors: ColorToken[] = [
  // Surface Colors
  {
    name: "Background",
    cssVar: "--background",
    value: "0 0% 100%",
    className: "bg-background",
    description: "Pure white main background",
    type: "color",
    category: "surfaces",
    usedIn: ["All pages", "Main layout", "Sections"],
    components: ["Header", "Footer", "Content areas"]
  },
  {
    name: "Card",
    cssVar: "--card",
    value: "249 67% 24%",
    className: "bg-card",
    description: "Federal blue card background",
    type: "color",
    category: "surfaces",
    usedIn: ["Feature cards", "Product cards", "Metric cards"],
    components: ["Card (default)", "Hero sections", "Gradient backgrounds"]
  },
  {
    name: "Muted",
    cssVar: "--muted",
    value: "0 0% 96%",
    className: "bg-muted",
    description: "Light gray for disabled states",
    type: "color",
    category: "surfaces",
    usedIn: ["Disabled buttons", "Secondary sections", "Inactive states"],
    components: ["Button (disabled)", "Background (muted)"]
  },
  
  // Text Colors
  {
    name: "Foreground",
    cssVar: "--foreground",
    value: "249 67% 24%",
    className: "bg-foreground",
    isForeground: true,
    backgroundPair: "--background",
    description: "Federal blue text on white backgrounds",
    type: "color",
    category: "text",
    usedIn: ["Body text", "Headings on white", "Primary content"],
    components: ["All text elements", "Headings", "Paragraphs"]
  },
  {
    name: "Card Foreground",
    cssVar: "--card-foreground",
    value: "0 0% 100%",
    className: "bg-card-foreground",
    isForeground: true,
    backgroundPair: "--card",
    description: "White text on dark cards",
    type: "color",
    category: "text",
    usedIn: ["Card text", "Gradient backgrounds", "Dark sections"],
    components: ["Card content", "Hero text", "Metric labels"]
  },
  {
    name: "Muted Foreground",
    cssVar: "--muted-foreground",
    value: "0 0% 45%",
    className: "bg-muted-foreground",
    isForeground: true,
    backgroundPair: "--muted",
    description: "Gray text for secondary content",
    type: "color",
    category: "text",
    usedIn: ["Descriptions", "Labels", "Helper text"],
    components: ["Card descriptions", "Form labels", "Captions"]
  },
  
  // Interactive Colors
  {
    name: "Primary",
    cssVar: "--primary",
    value: "249 67% 24%",
    className: "bg-primary",
    description: "Federal blue for primary actions",
    type: "color",
    category: "interactive",
    usedIn: ["Primary buttons", "Active states", "CTAs"],
    components: ["Button (default)", "Links (hover)", "Active navigation"]
  },
  {
    name: "Primary Foreground",
    cssVar: "--primary-foreground",
    value: "0 0% 100%",
    className: "bg-primary-foreground",
    isForeground: true,
    backgroundPair: "--primary",
    description: "White text on primary buttons",
    type: "color",
    category: "interactive",
    usedIn: ["Button text", "Active link text"],
    components: ["Button text", "CTA text"]
  },
  {
    name: "Border",
    cssVar: "--border",
    value: "0 0% 90%",
    className: "border-border",
    description: "Light gray borders and dividers",
    type: "color",
    category: "interactive",
    usedIn: ["Input borders", "Card borders", "Dividers"],
    components: ["Input", "Card", "Separator"]
  },
  
  // Feedback Colors
  {
    name: "Destructive",
    cssVar: "--destructive",
    value: "0 84% 60%",
    className: "bg-destructive",
    description: "Red for errors and delete actions",
    type: "color",
    category: "feedback",
    usedIn: ["Error states", "Delete buttons", "Validation errors"],
    components: ["Button (destructive)", "Error messages", "Alerts"]
  },
  {
    name: "Destructive Foreground",
    cssVar: "--destructive-foreground",
    value: "0 0% 100%",
    className: "bg-destructive-foreground",
    isForeground: true,
    backgroundPair: "--destructive",
    description: "White text on destructive backgrounds",
    type: "color",
    category: "feedback",
    usedIn: ["Destructive button text", "Error text"],
    components: ["Button text", "Alert text"]
  },
  
  // Gradients
  {
    name: "Hero Gradient",
    cssVar: "--gradient-hero",
    value: "linear-gradient(135deg, hsl(249 67% 24%), hsl(266 85% 58%))",
    className: "bg-gradient-hero",
    type: "gradient",
    gradientDirection: "135deg",
    gradientStops: ["249 67% 24%", "266 85% 58%"],
    description: "Federal blue to vibrant purple gradient",
    category: "gradients",
    usedIn: ["Hero sections", "Feature cards", "Metric cards", "CTA backgrounds"],
    components: ["Hero", "Card backgrounds", "FinalCTA", "TrustProof metrics"]
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
    
    // CLEAR all inline style overrides first to read from CSS file
    defaultColors.forEach(color => {
      root.style.removeProperty(color.cssVar);
    });
    
    // NOW read the clean computed styles from CSS file
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

  // Categorize colors
  const surfaceColors = semanticColors.filter(c => c.category === 'surfaces');
  const textColors = semanticColors.filter(c => c.category === 'text');
  const interactiveColors = semanticColors.filter(c => c.category === 'interactive');
  const feedbackColors = semanticColors.filter(c => c.category === 'feedback');
  const gradientColors = semanticColors.filter(c => c.category === 'gradients');

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Colors & Design Tokens</h2>
          <p className="text-muted-foreground text-lg">
            Single source of truth for all colors. Organized by purpose with live previews and usage context.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fixAllContrast}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fix All
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-contrast" className="text-sm text-white">Auto</Label>
            <Switch 
              id="auto-contrast"
              checked={autoContrast} 
              onCheckedChange={setAutoContrast}
            />
          </div>
          <Button variant="outline" onClick={resetColors}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={exportToFigma} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm mb-1 text-white">Single Source of Truth</h4>
            <p className="text-xs text-white/80">
              All colors flow from index.css → These tokens → Components. Changes apply instantly via CSS variables.
              Each category shows WHERE colors are used and includes live previews.
            </p>
          </div>
        </div>
      </div>
      
      <Accordion type="multiple" defaultValue={["surfaces", "text", "interactive", "feedback", "gradients"]} className="space-y-4">
        
        {/* Surface Colors */}
        <AccordionItem value="surfaces" className="border border-border/50 rounded-lg px-6 bg-background">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-foreground">Surface Colors</div>
                <div className="text-sm font-normal text-muted-foreground">Backgrounds, cards, and containers</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-muted-foreground mb-6 text-sm">
              Foundation of your UI. Main backgrounds, card surfaces, and container colors.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {surfaceColors.map((color, index) => {
                const originalIndex = semanticColors.findIndex(c => c.cssVar === color.cssVar);
                return (
                  <ColorCard 
                    key={color.cssVar}
                    color={color}
                    index={originalIndex}
                    onUpdate={updateColor}
                    onCopy={copyColor}
                    onFixContrast={fixContrast}
                    contrastInfo={getContrastInfo(color)}
                    allColors={semanticColors}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Text Colors */}
        <AccordionItem value="text" className="border border-border/50 rounded-lg px-6 bg-background">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Type className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-foreground">Text Colors</div>
                <div className="text-sm font-normal text-muted-foreground">Foreground colors for all text</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-muted-foreground mb-6 text-sm">
              Text and foreground colors. Always paired with a background for proper contrast (WCAG AA minimum 4.5:1).
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {textColors.map((color, index) => {
                const originalIndex = semanticColors.findIndex(c => c.cssVar === color.cssVar);
                return (
                  <ColorCard 
                    key={color.cssVar}
                    color={color}
                    index={originalIndex}
                    onUpdate={updateColor}
                    onCopy={copyColor}
                    onFixContrast={fixContrast}
                    contrastInfo={getContrastInfo(color)}
                    showContrastPreview={true}
                    allColors={semanticColors}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Interactive Colors */}
        <AccordionItem value="interactive" className="border border-border/50 rounded-lg px-6 bg-background">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <MousePointer className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-foreground">Interactive Colors</div>
                <div className="text-sm font-normal text-muted-foreground">Buttons, links, inputs, and actions</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-muted-foreground mb-6 text-sm">
              Colors for interactive elements including buttons, links, inputs, and focus states.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {interactiveColors.map((color, index) => {
                const originalIndex = semanticColors.findIndex(c => c.cssVar === color.cssVar);
                return (
                  <ColorCard 
                    key={color.cssVar}
                    color={color}
                    index={originalIndex}
                    onUpdate={updateColor}
                    onCopy={copyColor}
                    onFixContrast={fixContrast}
                    contrastInfo={getContrastInfo(color)}
                    showButtonPreview={true}
                    allColors={semanticColors}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Feedback Colors */}
        <AccordionItem value="feedback" className="border border-border/50 rounded-lg px-6 bg-background">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-foreground">Feedback Colors</div>
                <div className="text-sm font-normal text-muted-foreground">Errors, success, warnings</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-muted-foreground mb-6 text-sm">
              Colors for system feedback including errors, success states, and warnings.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feedbackColors.map((color, index) => {
                const originalIndex = semanticColors.findIndex(c => c.cssVar === color.cssVar);
                return (
                  <ColorCard 
                    key={color.cssVar}
                    color={color}
                    index={originalIndex}
                    onUpdate={updateColor}
                    onCopy={copyColor}
                    onFixContrast={fixContrast}
                    contrastInfo={getContrastInfo(color)}
                    allColors={semanticColors}
                  />
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gradients */}
        <AccordionItem value="gradients" className="border border-border/50 rounded-lg px-6 bg-background">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-foreground">Gradients</div>
                <div className="text-sm font-normal text-muted-foreground">Brand gradient backgrounds</div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <p className="text-muted-foreground mb-6 text-sm">
              Federal blue to vibrant purple gradient. Used in hero sections, cards, and special elements. Always use white text.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {gradientColors.map((color, index) => {
                const originalIndex = semanticColors.findIndex(c => c.cssVar === color.cssVar);
                return (
                  <Card key={color.cssVar} className="bg-card/5 border-border/50">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg text-white">{color.name}</h3>
                            <code className="text-xs px-2 py-0.5 rounded bg-background/10 text-white/70">
                              {color.cssVar}
                            </code>
                          </div>
                          <p className="text-sm text-white/70">{color.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyColor(color)}
                          className="text-white/70 hover:text-white"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div 
                        className="w-full h-32 rounded-lg mb-4"
                        style={{ background: color.value }}
                      />

                      {color.usedIn && (
                        <div className="mb-4">
                          <Label className="text-xs text-white/70 mb-2 block">Used In:</Label>
                          <div className="flex flex-wrap gap-1">
                            {color.usedIn.map((usage, i) => (
                              <Badge key={i} variant="outline" className="text-xs text-white/80 border-white/20">
                                {usage}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <GradientEditor
                        value={color.value}
                        onChange={(newValue) => updateColor(originalIndex, newValue, 'hsl')}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </section>
  );
};