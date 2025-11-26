import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPaletteTab } from './design-system/ColorPaletteTab';
import { calculateContrastRatio, getOptimalTextColor, getContrastLevel } from '@/lib/colorUtils';
import { supabase } from '@/integrations/supabase/client';
import { useColorSystem } from '@/hooks/useColorSystem';
import { getOptimalTextColorForBackground, meetsContrastRequirement, type ColorOption } from '@/config/colorSystem';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertTriangle } from 'lucide-react';

interface BackgroundEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onSave: (background: string, textColor?: string) => void;
  allowedBackgrounds?: string[];
  currentTextColor?: string;
  allowedTextColors?: string[];
  showTextColorPicker?: boolean;
  textColorPersistence?: boolean;
  elementId?: string;
  affectedTextElements?: Array<{ id: string; content: string; currentColor: string }>;
}

export function BackgroundEditModal({
  isOpen,
  onClose,
  currentBackground,
  currentTextColor = 'text-foreground',
  onSave,
  allowedBackgrounds,
  allowedTextColors,
  showTextColorPicker = true,
  textColorPersistence = false,
  elementId,
  affectedTextElements = [],
}: BackgroundEditModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  const [selectedTextColor, setSelectedTextColor] = useState(
    currentTextColor || getOptimalTextColorForBackground(currentBackground)
  );
  const [activeTab, setActiveTab] = useState('gradients');

  // Load color system from database
  const {
    SOLID_COLORS,
    GRADIENT_COLORS,
    GLASS_EFFECTS,
    TEXT_COLOR_OPTIONS,
    loading: colorSystemLoading,
  } = useColorSystem();

  // Filter available options based on allowedBackgrounds prop
  const getFilteredOptions = (options: ColorOption[]) => {
    if (!allowedBackgrounds) return options;

    return options.filter((bg) => {
      if (allowedBackgrounds.includes(bg.value)) return true;
      return allowedBackgrounds.some((allowed) => {
        const baseAllowed = allowed.split('/')[0];
        return baseAllowed === bg.value;
      });
    });
  };

  const solidOptions = getFilteredOptions(SOLID_COLORS);
  const gradientOptions = getFilteredOptions(GRADIENT_COLORS);
  const glassOptions = getFilteredOptions(GLASS_EFFECTS);

  // Filter text color options
  const filteredTextColors = allowedTextColors
    ? TEXT_COLOR_OPTIONS.filter((tc) => allowedTextColors.includes(tc.value))
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

  const handleSave = async () => {
    // If textColorPersistence is enabled and elementId provided, save to database
    if (textColorPersistence && elementId) {
      try {
        // @ts-ignore
        const { data: existing } = await supabase
          .from('background_styles')
          .select('id')
          .eq('element_id', elementId)
          .maybeSingle();

        if (existing) {
          // @ts-ignore
          await supabase
            .from('background_styles')
            .update({
              background_class: selectedBackground,
              text_color_class: selectedTextColor,
            })
            .eq('element_id', elementId);
        } else {
          // @ts-ignore
          await supabase.from('background_styles').insert([
            {
              element_id: elementId,
              background_class: selectedBackground,
              text_color_class: selectedTextColor,
            },
          ]);
        }
      } catch (error) {
        console.error('Error saving background styles:', error);
      }
    }

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
        >
          <h3 className={`text-3xl font-bold mb-2 ${selectedTextColor}`}>Preview Heading</h3>
          <p className={`text-lg ${selectedTextColor} opacity-90`}>
            This is how your text will look on the selected background.
          </p>
          <p className="text-xs mt-4 opacity-75">
            <span className={selectedTextColor}>
              Contrast: {contrastCheck.ratio}:1 ({contrastCheck.level})
            </span>
          </p>
        </div>

        {/* CONTRAST WARNING */}
        {showContrastWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ This combination doesn't meet WCAG AA contrast requirements (4.5:1). Consider
              using the suggested text color or a different background for better accessibility.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gradients">Gradients ({gradientOptions.length})</TabsTrigger>
            <TabsTrigger value="glass">Glass ({glassOptions.length})</TabsTrigger>
            <TabsTrigger value="solids">Solids ({solidOptions.length})</TabsTrigger>
            <TabsTrigger value="palette">Palette</TabsTrigger>
          </TabsList>

          <TabsContent value="gradients" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {gradientOptions.map((bg) => {
                // Find the allowed version with opacity if it exists
                const allowedVersion =
                  allowedBackgrounds?.find((allowed) => allowed.startsWith(bg.value)) || bg.value;
                const isSelected =
                  selectedBackground === allowedVersion || selectedBackground === bg.value;

                return (
                  <Card
                    key={bg.value}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBackground(allowedVersion)}
                  >
                    <div
                      className="h-32 rounded-lg mb-3 relative overflow-hidden flex items-center justify-center"
                      style={{
                        ...(bg.type === 'gradient' && bg.cssVar
                          ? { backgroundImage: `var(${bg.cssVar})` }
                          : {}),
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 w-4" />
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
              {glassOptions.map((bg) => {
                const allowedVersion =
                  allowedBackgrounds?.find((allowed) => allowed.startsWith(bg.value)) || bg.value;
                const isSelected =
                  selectedBackground === allowedVersion || selectedBackground === bg.value;

                return (
                  <Card
                    key={bg.value}
                    className={`p-4 cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBackground(allowedVersion)}
                  >
                    <div className="relative h-32 rounded-lg mb-3 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-hero" />
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          ...(bg.type === 'glass' && bg.cssVar
                            ? { backgroundImage: `var(${bg.cssVar})` }
                            : {}),
                        }}
                      >
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
                      Text color: <span className="font-medium">{bg.optimalTextColor}</span>{' '}
                      (context-dependent)
                    </p>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="solids" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {solidOptions.map((bg) => (
                <Card
                  key={bg.value}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedBackground === bg.value
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBackground(bg.value)}
                >
                  <div
                    className="h-32 rounded-lg mb-3 relative flex items-center justify-center border"
                    style={{
                      ...(bg.type === 'solid' && bg.hslValue
                        ? { backgroundColor: `hsl(${bg.hslValue})` }
                        : {}),
                    }}
                  >
                    {selectedBackground === bg.value && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    <span
                      className={`${
                        bg.optimalTextColor === 'white' ? 'text-white' : 'text-foreground'
                      } font-semibold text-sm`}
                    >
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Text Color</h3>
                <span className="text-xs text-muted-foreground">
                  Contrast: {contrastCheck.ratio.toFixed(1)}:1
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {filteredTextColors.map((colorClass) => (
                  <button
                    key={colorClass.value}
                    onClick={() => setSelectedTextColor(colorClass.value)}
                    className={cn(
                      'p-4 rounded-lg border-2 transition-all hover:scale-105',
                      selectedTextColor === colorClass.value
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border',
                      selectedBackground,
                      colorClass.value
                    )}
                  >
                    <div className={cn('text-center font-medium', colorClass.value)}>Aa</div>
                  </button>
                ))}
              </div>

              {/* Affected Elements Section */}
              {affectedTextElements.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold">Accessibility Impact</h4>
                  <div className="border rounded-lg p-3 space-y-2">
                    {affectedTextElements.map((element) => {
                      const elementContrast = calculateContrastRatio(
                        selectedBackground.replace('bg-', ''),
                        element.currentColor.replace('text-', '')
                      );
                      const level = getContrastLevel(elementContrast);
                      const isGood = elementContrast >= 4.5;

                      return (
                        <div
                          key={element.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            {isGood ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span className="truncate max-w-[200px]">{element.content}</span>
                          </div>
                          <span className={isGood ? 'text-green-400' : 'text-red-400'}>
                            {elementContrast.toFixed(1)}:1 ({level})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
