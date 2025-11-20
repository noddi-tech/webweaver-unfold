import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Wand2, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  parseColorToHSL,
  getContrastRatio,
  getContrastBadge,
  meetsContrastStandard,
  fixBackgroundForAAA,
  fixTextForAAA,
  hslToHex
} from "@/lib/contrastUtils";
import { cn } from "@/lib/utils";

export function ContrastCheckerTool() {
  const [backgroundColor, setBackgroundColor] = useState('249 67% 24%');
  const [textColor, setTextColor] = useState('0 0% 100%');
  const [bgInput, setBgInput] = useState('#201466');
  const [textInput, setTextInput] = useState('#ffffff');
  const [contrastRatio, setContrastRatio] = useState<number>(0);
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    calculateContrast();
  }, [backgroundColor, textColor]);

  const calculateContrast = () => {
    if (backgroundColor && textColor) {
      const ratio = getContrastRatio(backgroundColor, textColor);
      setContrastRatio(ratio);
    }
  };

  const handleBackgroundInput = (value: string) => {
    setBgInput(value);
    const parsed = parseColorToHSL(value);
    if (parsed) {
      setBackgroundColor(parsed);
    }
  };

  const handleTextInput = (value: string) => {
    setTextInput(value);
    const parsed = parseColorToHSL(value);
    if (parsed) {
      setTextColor(parsed);
    }
  };

  const handleFixBackground = () => {
    setIsFixing(true);
    setTimeout(() => {
      const fixed = fixBackgroundForAAA(backgroundColor, textColor);
      setBackgroundColor(fixed);
      setBgInput(hslToHex(fixed));
      toast({ title: "Background fixed", description: "Background adjusted to meet AAA standards" });
      setIsFixing(false);
    }, 100);
  };

  const handleFixText = () => {
    setIsFixing(true);
    setTimeout(() => {
      const fixed = fixTextForAAA(textColor, backgroundColor);
      setTextColor(fixed);
      setTextInput(hslToHex(fixed));
      toast({ title: "Text color fixed", description: "Text color adjusted to meet AAA standards" });
      setIsFixing(false);
    }, 100);
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
  };

  const handleReset = () => {
    setBackgroundColor('249 67% 24%');
    setTextColor('0 0% 100%');
    setBgInput('#201466');
    setTextInput('#ffffff');
  };

  const badge = getContrastBadge(contrastRatio);
  const meetsAAA = meetsContrastStandard(contrastRatio, 'AAA');
  const meetsAA = meetsContrastStandard(contrastRatio, 'AA');

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold mb-2 text-foreground">Contrast Checker Tool</h3>
          <p className="text-sm text-muted-foreground">
            Test color combinations and automatically fix them to meet WCAG AAA standards
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Background Color Input */}
          <div className="space-y-2">
            <Label htmlFor="bg-color">Background Color</Label>
            <div className="flex gap-2">
              <Input
                id="bg-color"
                value={bgInput}
                onChange={(e) => handleBackgroundInput(e.target.value)}
                placeholder="#201466 or 249 67% 24%"
                className="font-mono text-sm"
              />
              <div
                className="w-12 h-10 rounded border-2 border-border flex-shrink-0"
                style={{ backgroundColor: `hsl(${backgroundColor})` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supports HEX, RGB, or HSL format
            </p>
          </div>

          {/* Text Color Input */}
          <div className="space-y-2">
            <Label htmlFor="text-color">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="text-color"
                value={textInput}
                onChange={(e) => handleTextInput(e.target.value)}
                placeholder="#ffffff or 0 0% 100%"
                className="font-mono text-sm"
              />
              <div
                className="w-12 h-10 rounded border-2 border-border flex-shrink-0"
                style={{ backgroundColor: `hsl(${textColor})` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Supports HEX, RGB, or HSL format
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <Label className="mb-2 block">Live Preview</Label>
          <div
            className="rounded-lg p-8 text-center transition-colors"
            style={{
              backgroundColor: `hsl(${backgroundColor})`,
              color: `hsl(${textColor})`
            }}
          >
            <h4 className="text-2xl font-bold mb-2">The quick brown fox</h4>
            <p className="text-lg mb-3">jumps over the lazy dog</p>
            <p className="text-sm">Smaller text for normal size testing</p>
          </div>
        </div>

        {/* Contrast Results */}
        <div className="bg-muted p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">Contrast Ratio:</span>
            <Badge variant="outline" className="text-lg font-bold">
              {contrastRatio.toFixed(2)}:1
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className={cn("text-sm", badge.color, meetsAAA ? "bg-green-100" : "bg-red-100")}>
              {meetsAAA ? "✓" : "✗"} AAA (7:1)
            </Badge>
            <Badge className={cn("text-sm", meetsAA ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100")}>
              {meetsAA ? "✓" : "✗"} AA (4.5:1)
            </Badge>
            <Badge className={cn("text-sm", contrastRatio >= 3 ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100")}>
              {contrastRatio >= 3 ? "✓" : "✗"} AA Large (3:1)
            </Badge>
          </div>

          {!meetsAAA && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                ⚠️ This combination doesn't meet AAA standards. Click below to auto-fix:
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleFixBackground}
            disabled={isFixing || meetsAAA}
            variant={meetsAAA ? "outline" : "default"}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Fix Background
          </Button>
          
          <Button
            onClick={handleFixText}
            disabled={isFixing || meetsAAA}
            variant={meetsAAA ? "outline" : "default"}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Fix Text Color
          </Button>

          <Button
            onClick={() => handleCopy(bgInput, "Background color")}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy BG
          </Button>

          <Button
            onClick={() => handleCopy(textInput, "Text color")}
            variant="outline"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Text
          </Button>

          <Button onClick={handleReset} variant="ghost">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm mb-2 text-blue-900">💡 Recommendations</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>AAA (7:1)</strong>: Best for all text, meets highest accessibility standard</li>
            <li><strong>AA (4.5:1)</strong>: Minimum for normal text, acceptable for most use cases</li>
            <li><strong>AA Large (3:1)</strong>: Minimum for large text (18pt+ or 14pt+ bold)</li>
            <li>Use "Fix" buttons to automatically adjust colors while preserving hue and saturation</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
