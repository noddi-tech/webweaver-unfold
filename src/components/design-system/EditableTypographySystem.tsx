import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, RotateCcw, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TypographyToken {
  name: string;
  element: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
  className: string;
}

const defaultTypography: TypographyToken[] = [
  { name: "Display Large", element: "h1", fontSize: 72, lineHeight: 1.1, fontWeight: 900, letterSpacing: -0.02, className: "text-6xl font-black" },
  { name: "Display Medium", element: "h1", fontSize: 60, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.02, className: "text-5xl font-extrabold" },
  { name: "Heading 1", element: "h1", fontSize: 48, lineHeight: 1.2, fontWeight: 700, letterSpacing: -0.01, className: "text-4xl font-bold" },
  { name: "Heading 2", element: "h2", fontSize: 36, lineHeight: 1.2, fontWeight: 600, letterSpacing: -0.01, className: "text-3xl font-semibold" },
  { name: "Heading 3", element: "h3", fontSize: 30, lineHeight: 1.3, fontWeight: 600, letterSpacing: 0, className: "text-2xl font-semibold" },
  { name: "Heading 4", element: "h4", fontSize: 24, lineHeight: 1.3, fontWeight: 500, letterSpacing: 0, className: "text-xl font-medium" },
  { name: "Body Large", element: "p", fontSize: 18, lineHeight: 1.6, fontWeight: 400, letterSpacing: 0, className: "text-lg" },
  { name: "Body Medium", element: "p", fontSize: 16, lineHeight: 1.5, fontWeight: 400, letterSpacing: 0, className: "text-base" },
  { name: "Body Small", element: "p", fontSize: 14, lineHeight: 1.5, fontWeight: 400, letterSpacing: 0, className: "text-sm" },
  { name: "Caption", element: "span", fontSize: 12, lineHeight: 1.4, fontWeight: 400, letterSpacing: 0.01, className: "text-xs" },
];

export const EditableTypographySystem = () => {
  const [typography, setTypography] = useState<TypographyToken[]>(defaultTypography);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('noddi-typography-system');
    if (saved) {
      setTypography(JSON.parse(saved));
    }
  }, []);

  const updateTypography = (index: number, field: keyof TypographyToken, value: any) => {
    const newTypography = [...typography];
    newTypography[index] = { ...newTypography[index], [field]: value };
    setTypography(newTypography);
    
    // Apply changes to CSS variables if needed
    applyTypographyStyles();
  };

  const applyTypographyStyles = () => {
    const root = document.documentElement;
    typography.forEach((typo, index) => {
      root.style.setProperty(`--font-size-${index}`, `${typo.fontSize}px`);
      root.style.setProperty(`--line-height-${index}`, typo.lineHeight.toString());
      root.style.setProperty(`--font-weight-${index}`, typo.fontWeight.toString());
      root.style.setProperty(`--letter-spacing-${index}`, `${typo.letterSpacing}em`);
    });
  };

  const saveTypography = () => {
    localStorage.setItem('noddi-typography-system', JSON.stringify(typography));
    toast({
      title: "Typography saved",
      description: "Your typography changes have been saved locally.",
    });
  };

  const resetTypography = () => {
    setTypography(defaultTypography);
    localStorage.removeItem('noddi-typography-system');
    toast({
      title: "Typography reset",
      description: "All typography has been reset to defaults.",
    });
  };

  const copyTypography = (typo: TypographyToken) => {
    const cssRules = [
      `font-size: ${typo.fontSize}px;`,
      `line-height: ${typo.lineHeight};`,
      `font-weight: ${typo.fontWeight};`,
      `letter-spacing: ${typo.letterSpacing}em;`
    ].join(' ');
    
    navigator.clipboard.writeText(cssRules);
    toast({
      title: "Copied to clipboard",
      description: `${typo.name} styles copied`,
    });
  };

  const getWeightName = (weight: number) => {
    const weights: Record<number, string> = {
      100: "Thin",
      200: "Extra Light",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "Semi Bold",
      700: "Bold",
      800: "Extra Bold",
      900: "Black"
    };
    return weights[weight] || weight.toString();
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Typography System</h2>
          <p className="text-muted-foreground text-lg">
            Edit your typography tokens and see changes applied instantly.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetTypography}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={saveTypography}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        {typography.map((typo, index) => (
          <Card key={typo.name} className="glass-card p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">{typo.name}</h3>
                  <Button variant="ghost" size="icon" onClick={() => copyTypography(typo)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                
                <div 
                  className="text-foreground mb-4"
                  style={{
                    fontSize: `${typo.fontSize}px`,
                    lineHeight: typo.lineHeight,
                    fontWeight: typo.fontWeight,
                    letterSpacing: `${typo.letterSpacing}em`
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Element: <code>{typo.element}</code></div>
                  <div>Class: <code>{typo.className}</code></div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Font Size</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[typo.fontSize]}
                        onValueChange={([value]) => updateTypography(index, 'fontSize', value)}
                        min={8}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={typo.fontSize}
                        onChange={(e) => updateTypography(index, 'fontSize', parseInt(e.target.value))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Line Height</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[typo.lineHeight]}
                        onValueChange={([value]) => updateTypography(index, 'lineHeight', value)}
                        min={0.8}
                        max={2.5}
                        step={0.1}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={typo.lineHeight}
                        onChange={(e) => updateTypography(index, 'lineHeight', parseFloat(e.target.value))}
                        step="0.1"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Font Weight</Label>
                    <Select 
                      value={typo.fontWeight.toString()} 
                      onValueChange={(value) => updateTypography(index, 'fontWeight', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(weight => (
                          <SelectItem key={weight} value={weight.toString()}>
                            {weight} - {getWeightName(weight)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Letter Spacing</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[typo.letterSpacing]}
                        onValueChange={([value]) => updateTypography(index, 'letterSpacing', value)}
                        min={-0.1}
                        max={0.1}
                        step={0.001}
                        className="w-full"
                      />
                      <Input
                        type="number"
                        value={typo.letterSpacing}
                        onChange={(e) => updateTypography(index, 'letterSpacing', parseFloat(e.target.value))}
                        step="0.001"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};