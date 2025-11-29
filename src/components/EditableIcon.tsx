import React, { useState } from 'react';
import { Palette, type LucideIcon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useIconStyle } from '@/hooks/useIconStyle';
import { cn } from '@/lib/utils';
import { IconEditModal } from '@/components/IconEditModal';

interface EditableIconProps {
  elementId: string;
  icon: LucideIcon | (() => JSX.Element);
  defaultBackground?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
  shape?: 'rounded-xl' | 'rounded-full' | 'rounded-lg';
  className?: string;
  iconClassName?: string;
}

const sizeMap = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  default: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  xl: { container: 'w-20 h-20', icon: 'w-10 h-10' }
};

export function EditableIcon({
  elementId,
  icon: Icon,
  defaultBackground = 'bg-gradient-primary',
  size = 'default',
  shape,
  className = '',
  iconClassName = ''
}: EditableIconProps) {
  const { editMode } = useEditMode();
  const { iconStyle, updateIconStyle, isLoading } = useIconStyle(elementId, defaultBackground);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use database size if available, otherwise fall back to prop
  const actualSize = (iconStyle.size as 'sm' | 'default' | 'lg' | 'xl') || size;
  const shapeClass = shape || iconStyle.shape;

  if (isLoading) {
    return (
      <div className={cn(
        sizeMap[actualSize].container,
        'rounded-xl bg-muted animate-pulse',
        className
      )} />
    );
  }

  const backgroundClass = iconStyle.background_token === 'transparent' || iconStyle.background_token === 'bg-transparent'
    ? 'bg-transparent'
    : iconStyle.background_token.startsWith('bg-') 
      ? iconStyle.background_token 
      : `bg-${iconStyle.background_token}`;

  const handleSave = async (updates: any) => {
    try {
      await updateIconStyle(updates);
    } catch (error) {
      console.error('Failed to update icon style:', error);
    }
  };

  return (
    <>
      <div
        className={cn("relative inline-flex overflow-visible", className)}
        onMouseEnter={() => editMode && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={cn(
            sizeMap[actualSize].container,
            backgroundClass,
            shapeClass,
            'flex items-center justify-center',
            iconStyle.background_token !== 'transparent' && iconStyle.background_token !== 'bg-transparent' ? 'shadow-lg' : ''
          )}
        >
          {typeof Icon === 'function' && Icon.length === 0 ? (
            <Icon />
          ) : (
            <Icon 
              className={cn(sizeMap[actualSize].icon, iconClassName)} 
              style={{ color: `hsl(var(--${iconStyle.icon_color_token}))` }}
            />
          )}
        </div>

        {editMode && (isHovered || isModalOpen) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-[100] hover:scale-110 transition-transform pointer-events-auto"
          >
            <Palette className="w-3 h-3" />
          </button>
        )}
      </div>

      <IconEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={Icon}
        currentBackground={iconStyle.background_token}
        currentIconColor={iconStyle.icon_color_token}
        currentSize={actualSize}
        currentShape={shapeClass}
        onSave={handleSave}
      />
    </>
  );
}
