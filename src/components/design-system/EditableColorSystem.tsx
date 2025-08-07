import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ColorToken {
  name: string;
  cssVar: string;
  value: string;
  className: string;
}

const defaultColors: ColorToken[] = [
  { name: "Primary", cssVar: "--primary", value: "252 87% 58%", className: "bg-primary" },
  { name: "Primary Foreground", cssVar: "--primary-foreground", value: "0 0% 100%", className: "bg-primary-foreground" },
  { name: "Secondary", cssVar: "--secondary", value: "321 59% 85%", className: "bg-secondary" },
  { name: "Secondary Foreground", cssVar: "--secondary-foreground", value: "264 58% 28%", className: "bg-secondary-foreground" },
  { name: "Background", cssVar: "--background", value: "266 42% 96%", className: "bg-background" },
  { name: "Foreground", cssVar: "--foreground", value: "264 58% 28%", className: "bg-foreground" },
  { name: "Muted", cssVar: "--muted", value: "266 42% 92%", className: "bg-muted" },
  { name: "Muted Foreground", cssVar: "--muted-foreground", value: "264 20% 50%", className: "bg-muted-foreground" },
  { name: "Accent", cssVar: "--accent", value: "252 87% 58%", className: "bg-accent" },
  { name: "Accent Foreground", cssVar: "--accent-foreground", value: "0 0% 100%", className: "bg-accent-foreground" },
  { name: "Card", cssVar: "--card", value: "0 0% 100%", className: "bg-card" },
  { name: "Border", cssVar: "--border", value: "264 20% 85%", className: "bg-border" },
];

export const EditableColorSystem = () => {
  const [colors, setColors] = useState<ColorToken[]>(defaultColors);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('noddi-color-system');
    if (saved) {
      setColors(JSON.parse(saved));
    }
  }, []);

  const updateColor = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index].value = value;
    setColors(newColors);
    
    // Apply to CSS variables immediately
    const root = document.documentElement;
    root.style.setProperty(newColors[index].cssVar, value);
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

  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

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

  const hslToHex = (hsl: string) => {
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

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Color System</h2>
          <p className="text-muted-foreground text-lg">
            Edit your semantic color tokens and see changes applied instantly.
          </p>
        </div>
        <div className="flex gap-3">
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
        {colors.map((color, index) => (
          <Card key={color.cssVar} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{color.name}</h3>
                <code className="text-xs font-mono text-muted-foreground">
                  {color.cssVar}
                </code>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copyColor(color)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div 
                className="w-full h-16 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: `hsl(${color.value})` }}
              />
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      Pick Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <HexColorPicker
                      color={hslToHex(color.value)}
                      onChange={(hex) => updateColor(index, hexToHsl(hex))}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label htmlFor={`color-${index}`} className="text-xs text-muted-foreground">
                  HSL Value
                </Label>
                <Input
                  id={`color-${index}`}
                  value={color.value}
                  onChange={(e) => updateColor(index, e.target.value)}
                  className="font-mono text-xs"
                  placeholder="0 0% 0%"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                <code>className: {color.className}</code>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};