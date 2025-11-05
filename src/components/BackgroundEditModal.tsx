import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

interface BackgroundEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground: string;
  onSave: (background: string) => void;
  allowedBackgrounds?: string[];
}

const DEFAULT_BACKGROUNDS = [
  { value: 'bg-card', label: 'Default Card', description: 'Standard card background' },
  { value: 'bg-gradient-hero', label: 'Hero Gradient', description: 'Primary brand gradient' },
  { value: 'bg-gradient-warmth', label: 'Warmth Gradient', description: 'Soft orange to pink' },
  { value: 'bg-gradient-sunset', label: 'Sunset Gradient', description: 'Purple to orange' },
  { value: 'bg-gradient-ocean', label: 'Ocean Gradient', description: 'Blue to teal' },
  { value: 'bg-gradient-fire', label: 'Fire Gradient', description: 'Red to orange' },
];

export function BackgroundEditModal({
  isOpen,
  onClose,
  currentBackground,
  onSave,
  allowedBackgrounds
}: BackgroundEditModalProps) {
  const [selectedBackground, setSelectedBackground] = useState(currentBackground);

  const availableBackgrounds = allowedBackgrounds
    ? DEFAULT_BACKGROUNDS.filter(bg => allowedBackgrounds.includes(bg.value))
    : DEFAULT_BACKGROUNDS;

  const handleSave = () => {
    onSave(selectedBackground);
    onClose();
  };

  const handleReset = () => {
    setSelectedBackground('bg-card');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Change Background</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {availableBackgrounds.map((bg) => (
              <Card
                key={bg.value}
                className={`p-4 cursor-pointer transition-all ${
                  selectedBackground === bg.value
                    ? 'ring-2 ring-primary shadow-lg'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedBackground(bg.value)}
              >
                <div className={`h-24 rounded-lg ${bg.value} mb-3`} />
                <h4 className="font-semibold text-sm">{bg.label}</h4>
                <p className="text-xs text-muted-foreground">{bg.description}</p>
              </Card>
            ))}
          </div>

          <div className="flex justify-between pt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
