import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { useState, useEffect } from "react";

interface BackgroundEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onSave: (background: string) => void;
  allowedBackgrounds?: string[];
}

const BACKGROUND_OPTIONS = {
  gradients: [
    { 
      value: 'bg-gradient-hero', 
      label: 'Hero Gradient', 
      description: 'Federal blue to vibrant purple',
      preview: 'bg-gradient-hero'
    },
    { 
      value: 'bg-gradient-sunset', 
      label: 'Sunset Gradient', 
      description: 'Blue → purple → orange',
      preview: 'bg-gradient-sunset'
    },
    { 
      value: 'bg-gradient-warmth', 
      label: 'Warmth Gradient', 
      description: 'Purple → pink → orange',
      preview: 'bg-gradient-warmth'
    },
    { 
      value: 'bg-gradient-ocean', 
      label: 'Ocean Gradient', 
      description: 'Blue → teal → green',
      preview: 'bg-gradient-ocean'
    },
    { 
      value: 'bg-gradient-fire', 
      label: 'Fire Gradient', 
      description: 'Orange → purple',
      preview: 'bg-gradient-fire'
    },
  ],
  glass: [
    { 
      value: 'glass-card', 
      label: 'Glass Card', 
      description: 'Standard glass effect (95% opacity)',
      preview: 'glass-card'
    },
    { 
      value: 'liquid-glass', 
      label: 'Liquid Glass', 
      description: 'Gradient overlay with blur',
      preview: 'liquid-glass'
    },
    { 
      value: 'glass-prominent', 
      label: 'Prominent Glass', 
      description: 'High opacity (98%)',
      preview: 'glass-prominent'
    },
  ],
  solids: [
    { 
      value: 'bg-card', 
      label: 'Default Card', 
      description: 'Federal blue solid',
      preview: 'bg-card'
    },
    { 
      value: 'bg-background', 
      label: 'White Background', 
      description: 'Pure white',
      preview: 'bg-background'
    },
    { 
      value: 'bg-muted', 
      label: 'Muted Gray', 
      description: 'Light gray surface',
      preview: 'bg-muted'
    },
  ]
};

export function BackgroundEditModal({
  isOpen,
  onClose,
  currentBackground,
  onSave,
  allowedBackgrounds
}: BackgroundEditModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);
  const [activeTab, setActiveTab] = useState("gradients");

  // Filter available options based on allowedBackgrounds prop
  const getFilteredOptions = (category: keyof typeof BACKGROUND_OPTIONS) => {
    if (!allowedBackgrounds) return BACKGROUND_OPTIONS[category];
    return BACKGROUND_OPTIONS[category].filter(
      bg => allowedBackgrounds.includes(bg.value)
    );
  };

  // Determine which tab to show first based on current selection
  useEffect(() => {
    if (currentBackground.includes('gradient')) {
      setActiveTab('gradients');
    } else if (currentBackground.includes('glass')) {
      setActiveTab('glass');
    } else {
      setActiveTab('solids');
    }
  }, [currentBackground, isOpen]);

  const handleSave = () => {
    onSave(selectedBackground);
    onClose();
  };

  const handleReset = () => {
    setSelectedBackground('bg-card');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Change Background Style</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choose from gradients, glass effects, or solid colors
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gradients">
              Gradients ({getFilteredOptions('gradients').length})
            </TabsTrigger>
            <TabsTrigger value="glass">
              Glass ({getFilteredOptions('glass').length})
            </TabsTrigger>
            <TabsTrigger value="solids">
              Solids ({getFilteredOptions('solids').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gradients" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredOptions('gradients').map((bg) => (
                <Card
                  key={bg.value}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedBackground === bg.value
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBackground(bg.value)}
                >
                  <div className={`h-32 rounded-lg ${bg.preview} mb-3 relative overflow-hidden`}>
                    {selectedBackground === bg.value && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                  <p className="text-xs text-muted-foreground">{bg.description}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="glass" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {getFilteredOptions('glass').map((bg) => (
                <Card
                  key={bg.value}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedBackground === bg.value
                      ? 'ring-2 ring-primary shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedBackground(bg.value)}
                >
                  {/* Preview with background pattern to show transparency */}
                  <div className="relative h-32 rounded-lg mb-3 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-hero" />
                    <div className={`absolute inset-0 ${bg.preview} flex items-center justify-center`}>
                      {selectedBackground === bg.value && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-white font-semibold text-sm">Glass Effect</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                  <p className="text-xs text-muted-foreground">{bg.description}</p>
                </Card>
              ))}
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
                    <span className="text-foreground font-semibold text-sm">Solid Color</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{bg.label}</h4>
                  <p className="text-xs text-muted-foreground">{bg.description}</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Background
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
