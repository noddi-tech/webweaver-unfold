import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  SOLID_COLORS, 
  GRADIENT_COLORS, 
  GLASS_EFFECTS,
  TEXT_COLOR_OPTIONS,
  getOptimalTextColorForBackground,
  meetsContrastRequirement
} from "@/config/colorSystem";
import { ColorPaletteTab } from "@/components/design-system/ColorPaletteTab";

interface BackgroundEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  currentTextColor?: string;
  onSave: (background: string, textColor?: string) => void;
  allowedBackgrounds?: string[];
  allowedTextColors?: string[];
  showTextColorPicker?: boolean;
}

export function BackgroundEditModal({
  isOpen,
  onClose,
  currentBackground,
  currentTextColor,
  onSave,
  allowedBackgrounds,
  allowedTextColors,
  showTextColorPicker = true
}: BackgroundEditModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  const [selectedTextColor, setSelectedTextColor] = useState(
    currentTextColor || getOptimalTextColorForBackground(currentBackground)
  );
  const [activeTab, setActiveTab] = useState("gradients");

  // Organize options by type
  const BACKGROUND_OPTIONS = {
    gradients: GRADIENT_COLORS,
    glass: GLASS_EFFECTS,
    solids: SOLID_COLORS,
  };

  // Filter available options based on allowedBackgrounds prop
  const getFilteredOptions = (category: keyof typeof BACKGROUND_OPTIONS) => {
    if (!allowedBackgrounds) return BACKGROUND_OPTIONS[category];
    
    return BACKGROUND_OPTIONS[category].filter(bg => {
      // Check exact match first
      if (allowedBackgrounds.includes(bg.value)) return true;
      
      // Check if any allowed background is this background with opacity suffix
      return allowedBackgrounds.some(allowed => {
        // Strip opacity suffix from allowed background (e.g., 'bg-gradient-hero/90' -> 'bg-gradient-hero')
        const baseAllowed = allowed.split('/')[0];
        return baseAllowed === bg.value;
      });
    });
  };

  // Filter text color options
  const filteredTextColors = allowedTextColors 
    ? TEXT_COLOR_OPTIONS.filter(tc => allowedTextColors.includes(tc.value))
    : TEXT_COLOR_OPTIONS;

  // Check contrast for current selection
  // Strip opacity suffix from background before calculating contrast
  const baseBackground = selectedBackground.split('/')[0];
  const contrastCheck = meetsContrastRequirement(baseBackground, selectedTextColor);
  const showContrastWarning = !contrastCheck.meets;

  // Determine which tab to show first based on current selection
  useEffect(() => {
    if (currentBackground.includes('gradient')) {
      setActiveTab('gradients');
    } else if (currentBackground.includes('glass')) {
      setActiveTab('glass');
    } else if (currentBackground.startsWith('bg-')) {
      setActiveTab('solids');
    } else {
      setActiveTab('palette');
    }
  }, [currentBackground, isOpen]);

  // Auto-suggest text color when background changes
  useEffect(() => {
    const optimal = getOptimalTextColorForBackground(selectedBackground);
    setSelectedTextColor(optimal);
  }, [selectedBackground]);

  const handleSave = () => {
    onSave(selectedBackground, selectedTextColor);
    onClose();
  };

  const handleReset = () => {
    setSelectedBackground('bg-card');
    setSelectedTextColor('text-white');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Background & Text Color</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose background style and text color with real-time preview
          </p>
        </DialogHeader>

        {/* LIVE PREVIEW */}
        <div 
          className={`p-8 text-center mb-4 rounded-lg border shadow-sm ${selectedBackground}`}
          style={{ backgroundColor: 'transparent' }}
        >
          <h3 className={`text-3xl font-bold mb-2 ${selectedTextColor}`}>
            Preview Heading
          </h3>
          <p className={`text-lg ${selectedTextColor} opacity-90`}>
            This is how your text will look on the selected background.
          </p>
          <p className="text-xs mt-4 opacity-75">
            <span className={selectedTextColor}>Contrast: {contrastCheck.ratio}:1 ({contrastCheck.level})</span>
          </p>
        </div>

        {/* CONTRAST WARNING */}
        {showContrastWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ This combination doesn't meet WCAG AA contrast requirements (4.5:1). 
              Consider using the suggested text color or a different background for better accessibility.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gradients">
              Gradients ({getFilteredOptions('gradients').length})
            </TabsTrigger>
            <TabsTrigger value="glass">
              Glass ({getFilteredOptions('glass').length})
            </TabsTrigger>
            <TabsTrigger value="solids">
              Solids ({getFilteredOptions('solids').length})
            </TabsTrigger>
            <TabsTrigger value="palette">
              Palette
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gradients" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredOptions('gradients').map((bg) => {
                // Find the allowed version with opacity if it exists
                const allowedVersion = allowedBackgrounds?.find(allowed => 
                  allowed.startsWith(bg.value)
                ) || bg.value;
                const isSelected = selectedBackground === allowedVersion || selectedBackground === bg.value;
                
                return (
                  <Card
                    key={bg.value}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBackground(allowedVersion)}
                  >
                    <div className={`h-32 rounded-lg ${bg.preview} mb-3 relative overflow-hidden flex items-center justify-center`}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-white font-semibold text-sm">Sample Text</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                    <p className="text-xs text-muted-foreground">{bg.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Best with: <span className="font-medium">{bg.optimalTextColor}</span> text
                    </p>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="glass" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredOptions('glass').map((bg) => {
                // Find the allowed version with opacity if it exists
                const allowedVersion = allowedBackgrounds?.find(allowed => 
                  allowed.startsWith(bg.value)
                ) || bg.value;
                const isSelected = selectedBackground === allowedVersion || selectedBackground === bg.value;
                
                return (
                  <Card
                    key={bg.value}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBackground(allowedVersion)}
                  >
                    {/* Preview with background pattern to show transparency */}
                    <div className="relative h-32 rounded-lg mb-3 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-hero" />
                      <div className={`absolute inset-0 ${bg.preview} flex items-center justify-center`}>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <span className="text-white font-semibold text-sm">Glass Effect</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                    <p className="text-xs text-muted-foreground">{bg.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Text color: <span className="font-medium">{bg.optimalTextColor}</span> (context-dependent)
                    </p>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="solids" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredOptions('solids').map((bg) => (
                <Card
                  key={bg.value}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedBackground === bg.value
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBackground(bg.value)}
                >
                  <div className={`h-32 rounded-lg ${bg.preview} mb-3 relative flex items-center justify-center border`}>
                    {selectedBackground === bg.value && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <span className={`${bg.optimalTextColor === 'white' ? 'text-white' : 'text-foreground'} font-semibold text-sm`}>
                      Solid Color
                    </span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                  <p className="text-xs text-muted-foreground">{bg.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Best with: <span className="font-medium">{bg.optimalTextColor}</span> text
                  </p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="palette" className="mt-4">
            <ColorPaletteTab />
          </TabsContent>
        </Tabs>

        {/* TEXT COLOR PICKER */}
        {showTextColorPicker && (
          <div className="border-t pt-6 mt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              Text Color
              <span className="text-xs font-normal text-muted-foreground">
                (Auto-suggested based on background)
              </span>
            </h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {filteredTextColors.map((tc) => (
                <Card
                  key={tc.value}
                  className={`p-3 cursor-pointer transition-all ${
                    selectedTextColor === tc.value
                      ? 'ring-2 ring-primary'
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedTextColor(tc.value)}
                >
                  <div className="flex flex-col items-center gap-2">
                    {/* Show actual background with this text color */}
                    <div className={`w-12 h-12 rounded-full border-2 border-border flex items-center justify-center relative ${selectedBackground}`}>
                      <span className={`text-xs font-bold ${tc.value}`}>Aa</span>
                      {selectedTextColor === tc.value && (
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 rounded-full">
                          <Check className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium">{tc.label}</p>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {tc.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t mt-4">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
