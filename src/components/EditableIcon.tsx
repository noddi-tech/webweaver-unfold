import React, { useState } from 'react';
import { Palette, type LucideIcon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useIconStyle } from '@/hooks/useIconStyle';
import { cn } from '@/lib/utils';

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
  const { iconStyle, isLoading } = useIconStyle(elementId, defaultBackground);
  const [isHovered, setIsHovered] = useState(false);
  
  const shapeClass = shape || iconStyle.shape;

  if (isLoading) {
    return (
      <div className={cn(
        sizeMap[size].container,
        'rounded-xl bg-muted animate-pulse',
        className
      )} />
    );
  }

  const backgroundClass = iconStyle.background_token.startsWith('bg-') 
    ? iconStyle.background_token 
    : `bg-${iconStyle.background_token}`;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => editMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          sizeMap[size].container,
          backgroundClass,
          shapeClass,
          'flex items-center justify-center shadow-lg',
          className
        )}
      >
        {typeof Icon === 'function' && Icon.length === 0 ? (
          <Icon />
        ) : (
          <Icon className={cn(
            sizeMap[size].icon,
            `text-${iconStyle.icon_color_token}`,
            iconClassName
          )} />
        )}
      </div>

      {editMode && isHovered && (
        <div className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-50">
          <Palette className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}
