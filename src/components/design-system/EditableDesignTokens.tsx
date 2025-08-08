import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DesignToken {
  name: string;
  value: string;
  type: 'color' | 'text' | 'number';
  description: string;
}

const defaultTokens: DesignToken[] = [
  { name: "--noddi-primary", value: "252 87% 58%", type: "color", description: "Primary brand purple" },
  { name: "--noddi-text", value: "264 58% 28%", type: "color", description: "Dark purple text" },
  { name: "--noddi-gradient-start", value: "321 59% 85%", type: "color", description: "Pink gradient start" },
  { name: "--noddi-gradient-end", value: "266 42% 96%", type: "color", description: "Light purple gradient end" },
  { name: "--radius", value: "1rem", type: "text", description: "Base border radius" },
];

export const EditableDesignTokens = () => {
  const [tokens, setTokens] = useState<DesignToken[]>(defaultTokens);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('noddi-design-tokens');
    if (saved) {
      const parsed: DesignToken[] = JSON.parse(saved);
      setTokens(parsed);
      // Apply saved tokens on load so styles reflect immediately across the app
      const root = document.documentElement;
      parsed.forEach(t => root.style.setProperty(t.name, t.value));
    }
  }, []);

  const updateToken = (index: number, value: string) => {
    const newTokens = [...tokens];
    newTokens[index].value = value;
    setTokens(newTokens);
    
    // Apply to CSS variables immediately
    const root = document.documentElement;
    root.style.setProperty(newTokens[index].name, value);
  };

  const saveTokens = () => {
    localStorage.setItem('noddi-design-tokens', JSON.stringify(tokens));
    toast({
      title: "Design tokens saved",
      description: "Your changes have been saved locally.",
    });
  };

  const resetTokens = () => {
    setTokens(defaultTokens);
    defaultTokens.forEach(token => {
      document.documentElement.style.setProperty(token.name, token.value);
    });
    localStorage.removeItem('noddi-design-tokens');
    toast({
      title: "Design tokens reset",
      description: "All tokens have been reset to defaults.",
    });
  };

  const copyToken = (token: DesignToken) => {
    navigator.clipboard.writeText(`${token.name}: ${token.value};`);
    toast({
      title: "Copied to clipboard",
      description: `${token.name} copied`,
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
          <h2 className="text-4xl font-bold gradient-text mb-2">Design Tokens</h2>
          <p className="text-muted-foreground text-lg">
            Edit your core design tokens and see changes applied instantly across the site.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetTokens}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveTokens}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tokens.map((token, index) => (
          <Card key={token.name} className="glass-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {token.name}
                </code>
                <p className="text-sm text-muted-foreground mt-1">{token.description}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => copyToken(token)}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {token.type === 'color' && (
                <>
                  <div 
                    className="w-12 h-12 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: `hsl(${token.value})` }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">Pick Color</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker
                        color={hslToHex(token.value)}
                        onChange={(hex) => updateToken(index, hexToHsl(hex))}
                      />
                    </PopoverContent>
                  </Popover>
                </>
              )}
              
              <div className="flex-1">
                <Label htmlFor={`token-${index}`} className="text-sm text-muted-foreground">
                  Value
                </Label>
                <Input
                  id={`token-${index}`}
                  value={token.value}
                  onChange={(e) => updateToken(index, e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};