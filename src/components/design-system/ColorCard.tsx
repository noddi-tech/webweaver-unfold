import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Zap } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hslToHex, isValidHex } from "@/lib/colorUtils";
import { ColorPreview } from "./ColorPreview";

interface ColorToken {
  name: string;
  cssVar: string;
  value: string;
  className: string;
  isForeground?: boolean;
  backgroundPair?: string;
  description: string;
  type?: 'color' | 'gradient';
  category?: string;
  usedIn?: string[];
  components?: string[];
}

interface ColorCardProps {
  color: ColorToken;
  index: number;
  onUpdate: (index: number, value: string, format?: 'hsl' | 'hex') => void;
  onCopy: (color: ColorToken) => void;
  onFixContrast?: (index: number) => void;
  contrastInfo?: { ratio: string; level: string; badge: string } | null;
  showContrastPreview?: boolean;
  showButtonPreview?: boolean;
  allColors?: ColorToken[];
}

export const ColorCard = ({ 
  color, 
  index, 
  onUpdate, 
  onCopy, 
  onFixContrast,
  contrastInfo,
  showContrastPreview = false,
  showButtonPreview = false,
  allColors = []
}: ColorCardProps) => {
  const [hexInput, setHexInput] = React.useState("");
  
  const hexValue = hexInput || hslToHex(color.value);
  
  const handleHexChange = (hex: string) => {
    setHexInput(hex);
    if (isValidHex(hex)) {
      onUpdate(index, hex, 'hex');
    }
  };

  const handleHexBlur = () => {
    if (!isValidHex(hexInput)) {
      setHexInput("");
    }
  };

  // Get background color for foreground preview
  const backgroundForPreview = color.backgroundPair 
    ? allColors.find(c => c.cssVar === color.backgroundPair)?.value
    : undefined;

  return (
    <Card className="bg-card/5 border-border/50">
      <CardContent className="p-5">
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
            onClick={() => onCopy(color)}
            className="text-white/70 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Large color swatch with picker */}
          <div>
            <Label className="text-sm mb-2 block text-white/90">Color</Label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-full h-24 rounded-lg border-2 border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
                  style={{ background: `hsl(${color.value})` }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker 
                  color={hexValue} 
                  onChange={handleHexChange}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* HSL and HEX inputs */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1 block text-white/70">HSL Value</Label>
              <Input
                value={color.value}
                onChange={(e) => onUpdate(index, e.target.value)}
                className="font-mono text-xs bg-background/10 text-white border-border/50"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-white/70">HEX Value</Label>
              <Input
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                className="font-mono text-xs bg-background/10 text-white border-border/50"
              />
            </div>
          </div>
        </div>

        {/* Contrast info for foreground colors */}
        {contrastInfo && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-background/10 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Contrast:</span>
              <Badge variant={contrastInfo.badge as any} className="text-xs">
                {contrastInfo.ratio}:1 {contrastInfo.level}
              </Badge>
            </div>
            {onFixContrast && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onFixContrast(index)}
                className="text-white/70 hover:text-white"
              >
                <Zap className="w-4 h-4 mr-1" />
                Fix
              </Button>
            )}
          </div>
        )}

        {/* Usage information */}
        {(color.usedIn || color.components) && (
          <div className="space-y-2 mb-4">
            {color.usedIn && (
              <div>
                <Label className="text-xs text-white/70 mb-1 block">Used In:</Label>
                <div className="flex flex-wrap gap-1">
                  {color.usedIn.map((usage, i) => (
                    <Badge key={i} variant="outline" className="text-xs text-white/80 border-white/20">
                      {usage}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {color.components && (
              <div>
                <Label className="text-xs text-white/70 mb-1 block">Components:</Label>
                <div className="flex flex-wrap gap-1">
                  {color.components.map((comp, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {comp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live preview */}
        {showContrastPreview && backgroundForPreview && (
          <ColorPreview 
            backgroundColor={backgroundForPreview} 
            foregroundColor={color.value}
            colorName={color.name}
          />
        )}
        {!color.isForeground && (
          <ColorPreview 
            backgroundColor={color.value}
            foregroundColor={backgroundForPreview}
            colorName={color.name}
          />
        )}
      </CardContent>
    </Card>
  );
};
