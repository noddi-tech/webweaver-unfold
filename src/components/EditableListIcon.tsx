import React, { useState } from 'react';
import { Palette, type LucideIcon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useIconStyle } from '@/hooks/useIconStyle';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface EditableListIconProps {
  elementId: string;
  icon: LucideIcon;
  defaultColor?: string;
  className?: string;
}

const iconColorOptions = [
  // Core colors
  { value: 'primary-foreground', label: 'Primary Foreground' },
  { value: 'foreground', label: 'Foreground' },
  { value: 'primary', label: 'Primary' },
  { value: 'muted-foreground', label: 'Muted' },
  // Semantic colors
  { value: 'text-success', label: 'Success (Green)' },
  { value: 'text-destructive', label: 'Destructive (Red)' },
  { value: 'text-warning', label: 'Warning' },
  { value: 'text-info', label: 'Info' },
  // Brand colors
  { value: 'text-vibrant-purple', label: 'Vibrant Purple' },
  { value: 'text-brand-orange', label: 'Brand Orange' },
  { value: 'text-brand-teal', label: 'Brand Teal' }
];

export function EditableListIcon({
  elementId,
  icon: Icon,
  defaultColor = 'foreground',
  className = ''
}: EditableListIconProps) {
  const { editMode } = useEditMode();
  const { iconStyle, updateIconStyle, isLoading } = useIconStyle(elementId, 'transparent');
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(iconStyle.icon_color_token || defaultColor);

  if (isLoading) {
    return <div className={cn('animate-pulse bg-muted rounded', className)} />;
  }

  const handleSave = async () => {
    try {
      await updateIconStyle({
        background_token: 'transparent',
        icon_color_token: selectedColor,
        size: 'default',
        shape: 'rounded-none'
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update icon color:', error);
    }
  };

  return (
    <>
      <div
        className="relative inline-block"
        onMouseEnter={() => editMode && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Icon 
          className={className}
          style={{ color: `hsl(var(--${iconStyle.icon_color_token || defaultColor}))` }}
        />

        {editMode && isHovered && (
          <button
            onClick={() => {
              setSelectedColor(iconStyle.icon_color_token || defaultColor);
              setIsModalOpen(true);
            }}
            className="absolute -top-1 -right-1 p-1 bg-primary text-primary-foreground rounded-full shadow-lg z-50 hover:scale-110 transition-transform"
          >
            <Palette className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Change Icon Color</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Select a color for this icon
            </p>
          </DialogHeader>

          {/* Live Preview */}
          <div className="p-8 text-center mb-4 rounded-lg border bg-card">
            <Icon 
              className={className}
              style={{ color: `hsl(var(--${selectedColor}))` }}
            />
            <p className="text-sm text-muted-foreground mt-4">Live Preview</p>
          </div>

          {/* Color Picker */}
          <div className="grid grid-cols-4 gap-3">
            {iconColorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all hover:scale-105 text-left',
                  selectedColor === color.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: `hsl(var(--${color.value}))` }}>A</div>
                <div className="text-xs text-muted-foreground">{color.label}</div>
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
