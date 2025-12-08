import React from 'react';
import { useEditableCardContext } from './EditableCard';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EditableCardIconProps {
  icon: LucideIcon;
  className?: string;
  containerClassName?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl';
}

const sizeConfig = {
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  default: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  xl: { container: 'w-20 h-20', icon: 'w-10 h-10' },
};

/**
 * EditableCardIcon - Icon component that inherits styling from EditableCard
 * 
 * Automatically uses:
 * - iconColor from card context
 * - iconBackground from card context
 */
export function EditableCardIcon({
  icon: Icon,
  className,
  containerClassName,
  size = 'default',
}: EditableCardIconProps) {
  const { iconColor, iconBackground } = useEditableCardContext();
  const { container, icon: iconSize } = sizeConfig[size];

  // Get background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!iconBackground) return {};
    
    // Handle bg-* with opacity (e.g., bg-primary/10)
    if (iconBackground.includes('/')) {
      const [colorPart, opacityPart] = iconBackground.replace('bg-', '').split('/');
      const opacity = parseInt(opacityPart) / 100;
      return { backgroundColor: `hsl(var(--${colorPart}) / ${opacity})` };
    }
    
    // Handle simple bg-* classes
    if (iconBackground.startsWith('bg-')) {
      const colorToken = iconBackground.replace('bg-', '');
      return { backgroundColor: `hsl(var(--${colorToken}))` };
    }

    return {};
  };

  // Get icon color style
  const getIconColorStyle = (): React.CSSProperties => {
    if (!iconColor) return { color: 'hsl(var(--primary))' };
    
    // Handle text-* prefix
    const colorToken = iconColor.replace('text-', '');
    return { color: `hsl(var(--${colorToken}))` };
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        container,
        containerClassName
      )}
      style={getBackgroundStyle()}
    >
      <Icon 
        className={cn(iconSize, className)} 
        style={getIconColorStyle()}
      />
    </div>
  );
}
