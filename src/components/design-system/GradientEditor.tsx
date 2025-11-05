import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { hexToHsl, hslToHex } from "@/lib/colorUtils";

interface GradientStop {
  color: string; // HSL format
  position: number; // 0-100
}

interface GradientEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const parseGradient = (gradientValue: string): { direction: string; stops: GradientStop[] } => {
  // Default fallback
  const defaultGradient = {
    direction: "135deg",
    stops: [
      { color: "252 87% 58%", position: 0 },
      { color: "321 59% 85%", position: 100 }
    ]
  };

  if (!gradientValue.includes("linear-gradient")) {
    return defaultGradient;
  }

  try {
    // Extract direction and colors from CSS gradient
    const match = gradientValue.match(/linear-gradient\(([^)]+)\)/);
    if (!match) return defaultGradient;

    const parts = match[1].split(',').map(p => p.trim());
    const direction = parts[0];
    const colorParts = parts.slice(1);

    const stops: GradientStop[] = colorParts.map((part, index) => {
      const hslMatch = part.match(/hsl\(([^)]+)\)/);
      if (hslMatch) {
        return {
          color: hslMatch[1],
          position: index === 0 ? 0 : index === colorParts.length - 1 ? 100 : (index / (colorParts.length - 1)) * 100
        };
      }
      return { color: "252 87% 58%", position: index * 50 };
    });

    return { direction, stops: stops.length > 0 ? stops : defaultGradient.stops };
  } catch {
    return defaultGradient;
  }
};

const buildGradient = (direction: string, stops: GradientStop[]): string => {
  const sortedStops = [...stops].sort((a, b) => a.position - b.position);
  const colorStops = sortedStops.map(stop => `hsl(${stop.color})`).join(', ');
  return `linear-gradient(${direction}, ${colorStops})`;
};

export const GradientEditor = ({ value, onChange }: GradientEditorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const parsedGradient = parseGradient(value);
  const [direction, setDirection] = useState(parsedGradient.direction);
  const [stops, setStops] = useState<GradientStop[]>(parsedGradient.stops);

  const updateStop = (index: number, field: 'color' | 'position', newValue: string | number) => {
    const newStops = [...stops];
    if (field === 'color') {
      newStops[index].color = newValue as string;
    } else {
      newStops[index].position = Math.max(0, Math.min(100, newValue as number));
    }
    setStops(newStops);
    onChange(buildGradient(direction, newStops));
  };

  const addStop = () => {
    const newPosition = stops.length > 0 ? Math.min(100, Math.max(...stops.map(s => s.position)) + 20) : 50;
    const newStops = [...stops, { color: "252 87% 58%", position: newPosition }];
    setStops(newStops);
    onChange(buildGradient(direction, newStops));
  };

  const removeStop = (index: number) => {
    if (stops.length <= 2) return; // Keep at least 2 stops
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
    onChange(buildGradient(direction, newStops));
  };

  const updateDirection = (newDirection: string) => {
    setDirection(newDirection);
    onChange(buildGradient(newDirection, stops));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-white border-white/30 hover:bg-white/10 hover:text-white hover:border-white/50">
          <Sparkles className="w-3 h-3 mr-1" />
          Gradient Editor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Gradient</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Preview</Label>
            <div 
              className="w-full h-20 rounded-lg border border-border"
              style={{ background: buildGradient(direction, stops) }}
            />
          </div>

          {/* Direction */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Direction</Label>
            <Select value={direction} onValueChange={updateDirection}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0deg">Top to Bottom (0deg)</SelectItem>
                <SelectItem value="45deg">Top-Left to Bottom-Right (45deg)</SelectItem>
                <SelectItem value="90deg">Left to Right (90deg)</SelectItem>
                <SelectItem value="135deg">Bottom-Left to Top-Right (135deg)</SelectItem>
                <SelectItem value="180deg">Bottom to Top (180deg)</SelectItem>
                <SelectItem value="225deg">Bottom-Right to Top-Left (225deg)</SelectItem>
                <SelectItem value="270deg">Right to Left (270deg)</SelectItem>
                <SelectItem value="315deg">Top-Right to Bottom-Left (315deg)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Stops */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Color Stops</Label>
              <Button size="sm" variant="outline" onClick={addStop}>
                <Plus className="w-3 h-3 mr-1" />
                Add Stop
              </Button>
            </div>
            
            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div 
                    className="w-8 h-8 rounded border border-border flex-shrink-0"
                    style={{ background: `hsl(${stop.color})` }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm">
                            Pick Color
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3">
                          <HexColorPicker
                            color={hslToHex(stop.color)}
                            onChange={(hex) => updateStop(index, 'color', hexToHsl(hex))}
                          />
                        </PopoverContent>
                      </Popover>
                      
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={stop.position}
                        onChange={(e) => updateStop(index, 'position', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    
                    <Input
                      value={stop.color}
                      onChange={(e) => updateStop(index, 'color', e.target.value)}
                      className="font-mono text-xs mt-2"
                      placeholder="252 87% 58%"
                    />
                  </div>
                  
                  {stops.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeStop(index)}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};