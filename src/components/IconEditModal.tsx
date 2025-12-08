import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Check, type LucideIcon } from 'lucide-react';
import { useColorSystem } from '@/hooks/useColorSystem';

interface IconEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon | (() => JSX.Element);
  currentBackground: string;
  currentIconColor: string;
  currentSize: 'sm' | 'default' | 'lg' | 'xl';
  currentShape: string;
  onSave: (updates: {
    background_token: string;
    icon_color_token: string;
    size: string;
    shape: string;
  }) => void;
}

const sizeOptions = [
  { value: 'sm', label: 'Small', container: 'w-10 h-10', icon: 'w-5 h-5' },
  { value: 'default', label: 'Default', container: 'w-14 h-14', icon: 'w-7 h-7' },
  { value: 'lg', label: 'Large', container: 'w-16 h-16', icon: 'w-8 h-8' },
  { value: 'xl', label: 'Extra Large', container: 'w-20 h-20', icon: 'w-10 h-10' }
];

const shapeOptions = [
  { value: 'rounded-xl', label: 'Rounded' },
  { value: 'rounded-full', label: 'Circle' },
  { value: 'rounded-lg', label: 'Soft' },
  { value: 'rounded-none', label: 'Square' }
];

// Icon color options now come from useColorSystem hook (database-driven)
// Moved inside component to use TEXT_COLOR_OPTIONS from database

export function IconEditModal({
  isOpen,
  onClose,
  icon: Icon,
  currentBackground,
  currentIconColor,
  currentSize,
  currentShape,
  onSave
}: IconEditModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  const [selectedIconColor, setSelectedIconColor] = useState(currentIconColor);
  const [selectedSize, setSelectedSize] = useState(currentSize);
  const [selectedShape, setSelectedShape] = useState(currentShape);
  const [activeTab, setActiveTab] = useState('gradients');

  const { SOLID_COLORS, GRADIENT_COLORS, GLASS_EFFECTS, TEXT_COLOR_OPTIONS } = useColorSystem();

  const selectedSizeConfig = sizeOptions.find(s => s.value === selectedSize) || sizeOptions[1];

  // Sync modal state with current props when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedSize(currentSize);
      setSelectedIconColor(currentIconColor);
      setSelectedShape(currentShape);
      setSelectedBackground(currentBackground);
    }
  }, [isOpen, currentSize, currentIconColor, currentShape, currentBackground]);

  useEffect(() => {
    if (currentBackground === 'transparent' || currentBackground === 'bg-transparent') {
      setActiveTab('none');
    } else if (currentBackground.includes('gradient')) {
      setActiveTab('gradients');
    } else if (currentBackground.includes('glass')) {
      setActiveTab('glass');
    } else {
      setActiveTab('solids');
    }
  }, [currentBackground, isOpen]);

  const handleSave = () => {
    const backgroundToken = selectedBackground.startsWith('bg-') 
      ? selectedBackground 
      : selectedBackground;
    
    onSave({
      background_token: backgroundToken,
      icon_color_token: selectedIconColor,
      size: selectedSize,
      shape: selectedShape
    });
    onClose();
  };

  const renderIconPreview = () => {
    const backgroundClass = selectedBackground === 'transparent' || selectedBackground === 'bg-transparent'
      ? 'bg-transparent'
      : selectedBackground.startsWith('bg-') 
        ? selectedBackground 
        : `bg-${selectedBackground}`;

    return (
      <div
        className={cn(
          selectedSizeConfig.container,
          backgroundClass,
          selectedShape,
          'flex items-center justify-center',
          selectedBackground !== 'transparent' && selectedBackground !== 'bg-transparent' ? 'shadow-lg' : ''
        )}
      >
        {typeof Icon === 'function' && Icon.length === 0 ? (
          <Icon />
        ) : (
          <Icon 
            className={selectedSizeConfig.icon} 
            style={{ color: `hsl(var(--${selectedIconColor}))` }}
          />
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Icon</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Adjust icon background, color, size, and shape
          </p>
        </DialogHeader>

        {/* LIVE PREVIEW */}
        <div className="p-8 text-center mb-4 rounded-lg border bg-card text-card-foreground">
          <div className="flex justify-center mb-4">
            {renderIconPreview()}
          </div>
          <p className="text-sm text-muted-foreground">Live Preview</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gradients">Gradients ({GRADIENT_COLORS.length})</TabsTrigger>
            <TabsTrigger value="glass">Glass ({GLASS_EFFECTS.length})</TabsTrigger>
            <TabsTrigger value="solids">Solids ({SOLID_COLORS.length})</TabsTrigger>
            <TabsTrigger value="none">None</TabsTrigger>
          </TabsList>

          <TabsContent value="gradients" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {GRADIENT_COLORS.map((bg) => {
                const isSelected = selectedBackground === bg.value || selectedBackground === `bg-${bg.value}`;
                
                return (
                  <Card
                    key={bg.value}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    )}
                    onClick={() => setSelectedBackground(bg.value)}
                  >
                    <div className={cn('h-24 rounded-lg', bg.preview, 'mb-3 relative flex items-center justify-center')}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm">{bg.label}</h4>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="glass" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {GLASS_EFFECTS.map((bg) => {
                const isSelected = selectedBackground === bg.value || selectedBackground === `bg-${bg.value}`;
                
                return (
                  <Card
                    key={bg.value}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    )}
                    onClick={() => setSelectedBackground(bg.value)}
                  >
                    <div className="relative h-24 rounded-lg mb-3 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-hero" />
                      <div className={cn('absolute inset-0', bg.preview, 'flex items-center justify-center')}>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <h4 className="font-semibold text-sm">{bg.label}</h4>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="solids" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              {SOLID_COLORS.map((bg) => {
                const isSelected = selectedBackground === bg.value;
                
                return (
                  <Card
                    key={bg.value}
                    className={cn(
                      'p-4 cursor-pointer transition-all',
                      isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'
                    )}
                    onClick={() => setSelectedBackground(bg.value)}
                  >
                    <div className={cn('h-24 rounded-lg', bg.preview, 'mb-3 relative flex items-center justify-center border')}>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm">{bg.label}</h4>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="none" className="space-y-4 mt-4">
            <Card className="p-6 text-center">
              <h3 className="font-semibold mb-2">No Background</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Remove the background container and show only the icon
              </p>
              <Button
                variant={selectedBackground === 'transparent' ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedBackground('transparent');
                  setSelectedIconColor('foreground');
                }}
              >
                {selectedBackground === 'transparent' ? 'Selected' : 'Select'}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ICON COLOR PICKER */}
        <div className="border-t pt-6 mt-4">
          <h3 className="text-sm font-semibold mb-3">Icon Color</h3>
          <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto">
            {TEXT_COLOR_OPTIONS.map((color) => {
              const colorToken = color.value.replace('text-', '');
              const isSelected = selectedIconColor === colorToken || selectedIconColor === color.value;
              return (
                <button
                  key={color.value}
                  onClick={() => setSelectedIconColor(colorToken)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all hover:scale-105',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  )}
                  title={color.description || color.label}
                >
                  <div 
                    className="text-2xl font-bold" 
                    style={{ color: color.hslValue ? `hsl(${color.hslValue})` : `hsl(var(--${colorToken}))` }}
                  >
                    A
                  </div>
                  <div className="text-xs mt-1 text-muted-foreground truncate">{color.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SIZE PICKER */}
        <div className="border-t pt-6 mt-4">
          <h3 className="text-sm font-semibold mb-3">Icon Size</h3>
          <div className="grid grid-cols-4 gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size.value}
                onClick={() => setSelectedSize(size.value as any)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all hover:scale-105',
                  selectedSize === size.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="text-sm font-medium mb-1">{size.label}</div>
                <div className="text-xs text-muted-foreground">{size.container}</div>
              </button>
            ))}
          </div>
        </div>

        {/* SHAPE PICKER */}
        <div className="border-t pt-6 mt-4">
          <h3 className="text-sm font-semibold mb-3">Icon Shape</h3>
          <div className="grid grid-cols-4 gap-2">
            {shapeOptions.map((shape) => (
              <button
                key={shape.value}
                onClick={() => setSelectedShape(shape.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all hover:scale-105',
                  selectedShape === shape.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className={cn('w-12 h-12 bg-primary/20 mx-auto mb-2', shape.value)} />
                <div className="text-sm font-medium">{shape.label}</div>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
