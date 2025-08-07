import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Copy, RotateCcw, Save, Palette, AlertTriangle, CheckCircle2, Zap, Plus, Trash2, Sparkles } from "lucide-react";
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
  getContrastLevel 
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
  { name: "Primary", cssVar: "--primary", value: "252 87% 58%", className: "bg-primary", description: "Main brand color used for primary actions and key UI elements" },
  { name: "Primary Foreground", cssVar: "--primary-foreground", value: "0 0% 100%", className: "bg-primary-foreground", isForeground: true, backgroundPair: "--primary", description: "Text color that appears on primary backgrounds" },
  { name: "Secondary", cssVar: "--secondary", value: "321 59% 85%", className: "bg-secondary", description: "Secondary brand color for less prominent elements and backgrounds" },
  { name: "Secondary Foreground", cssVar: "--secondary-foreground", value: "264 58% 28%", className: "bg-secondary-foreground", isForeground: true, backgroundPair: "--secondary", description: "Text color that appears on secondary backgrounds" },
  { name: "Background", cssVar: "--background", value: "266 42% 96%", className: "bg-background", description: "Main page background color" },
  { name: "Foreground", cssVar: "--foreground", value: "264 58% 28%", className: "bg-foreground", isForeground: true, backgroundPair: "--background", description: "Primary text color for body content" },
  { name: "Muted", cssVar: "--muted", value: "266 42% 92%", className: "bg-muted", description: "Subtle background color for less prominent areas" },
  { name: "Muted Foreground", cssVar: "--muted-foreground", value: "264 20% 50%", className: "bg-muted-foreground", isForeground: true, backgroundPair: "--muted", description: "Text color for secondary or disabled content" },
  { name: "Accent", cssVar: "--accent", value: "252 87% 58%", className: "bg-accent", description: "Accent color for highlights and interactive elements" },
  { name: "Accent Foreground", cssVar: "--accent-foreground", value: "0 0% 100%", className: "bg-accent-foreground", isForeground: true, backgroundPair: "--accent", description: "Text color that appears on accent backgrounds" },
  { name: "Card", cssVar: "--card", value: "0 0% 100%", className: "bg-card", description: "Background color for cards and elevated surfaces" },
  { name: "Card Foreground", cssVar: "--card-foreground", value: "264 58% 28%", className: "bg-card-foreground", isForeground: true, backgroundPair: "--card", description: "Text color that appears on card backgrounds" },
  { name: "Border", cssVar: "--border", value: "264 20% 85%", className: "bg-border", description: "Color for borders and dividers throughout the interface" },
  { name: "Destructive", cssVar: "--destructive", value: "0 84% 60%", className: "bg-destructive", description: "Color for destructive actions like delete buttons and error states" },
  { name: "Destructive Foreground", cssVar: "--destructive-foreground", value: "0 0% 100%", className: "bg-destructive-foreground", isForeground: true, backgroundPair: "--destructive", description: "Text color that appears on destructive backgrounds" },
  
  // Gradients
  { name: "Primary Gradient", cssVar: "--gradient-primary", value: "linear-gradient(135deg, hsl(252 87% 58%), hsl(321 59% 85%))", className: "bg-gradient-primary", type: "gradient", gradientDirection: "135deg", gradientStops: ["252 87% 58%", "321 59% 85%"], description: "Primary brand gradient from purple to pink" },
  { name: "Background Gradient", cssVar: "--gradient-background", value: "linear-gradient(180deg, hsl(266 42% 96%), hsl(321 59% 85%))", className: "bg-gradient-background", type: "gradient", gradientDirection: "180deg", gradientStops: ["266 42% 96%", "321 59% 85%"], description: "Subtle background gradient" },
  { name: "Hero Gradient", cssVar: "--gradient-hero", value: "linear-gradient(135deg, hsl(252 87% 58%), hsl(264 58% 28%))", className: "bg-gradient-hero", type: "gradient", gradientDirection: "135deg", gradientStops: ["252 87% 58%", "264 58% 28%"], description: "Bold hero section gradient" },
];

export const EditableColorSystem = () => {
  const [colors, setColors] = useState<ColorToken[]>(defaultColors);
  const [colorFormat, setColorFormat] = useState<'hsl' | 'hex' | 'rgb'>('hsl');
  const [autoContrast, setAutoContrast] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('noddi-color-system');
    if (saved) {
      setColors(JSON.parse(saved));
    }
  }, []);

  const updateColor = (index: number, value: string, format: 'hsl' | 'hex' = 'hsl') => {
    const newColors = [...colors];
    
    // Convert to HSL if input is HEX
    if (format === 'hex') {
      // Ensure hex value starts with #
      if (!value.startsWith('#')) {
        value = '#' + value;
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

    newColors.forEach((color, index) => {
      if (color.isForeground && color.backgroundPair) {
        const backgroundColor = newColors.find(c => c.cssVar === color.backgroundPair);
        if (backgroundColor) {
          const currentRatio = calculateContrastRatio(color.value, backgroundColor.value);
          if (currentRatio < 4.5) {
            const optimalTextColor = getOptimalTextColor(backgroundColor.value);
            newColors[index].value = optimalTextColor;
            fixedCount++;
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
        title: "All contrast issues fixed",
        description: `Fixed ${fixedCount} color${fixedCount > 1 ? 's' : ''} for better accessibility.`,
      });
    } else {
      toast({
        title: "No issues found",
        description: "All colors already meet accessibility standards.",
      });
    }
  };

  const saveColors = () => {
    localStorage.setItem('noddi-color-system', JSON.stringify(colors));
    toast({
      title: "Color system saved",
      description: "Your color changes have been saved locally.",
    });
  };

  const resetColors = () => {
    setColors(defaultColors);
    defaultColors.forEach(color => {
      document.documentElement.style.setProperty(color.cssVar, color.value);
    });
    localStorage.removeItem('noddi-color-system');
    toast({
      title: "Colors reset",
      description: "All colors have been reset to defaults.",
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
    
    const ratio = calculateContrastRatio(color.value, backgroundColor.value);
    const level = getContrastLevel(ratio);
    
    return { ratio: ratio.toFixed(2), ...level };
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
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {colors.map((color, index) => {
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
                    value={formatColorValue(color.value, colorFormat)}
                    onChange={(e) => updateColor(index, e.target.value, 'hex')}
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