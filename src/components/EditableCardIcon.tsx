import React from 'react';
import { useEditableCardContext } from './EditableCard';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface EditableCardIconProps {
  icon: LucideIcon;
  className?: string;
  containerClassName?: string;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'medium'; // Allow override, otherwise use context
}

const sizeConfig = {
  small: { container: 'w-8 h-8', icon: 'w-4 h-4' },
  sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
  default: { container: 'w-12 h-12', icon: 'w-6 h-6' },
  medium: { container: 'w-14 h-14', icon: 'w-8 h-8' },
  lg: { container: 'w-16 h-16', icon: 'w-8 h-8' },
  large: { container: 'w-16 h-16', icon: 'w-12 h-12' },
  xl: { container: 'w-20 h-20', icon: 'w-16 h-16' },
};

/**
 * EditableCardIcon - Icon component that inherits styling from EditableCard
 * 
 * Automatically uses:
 * - iconColor from card context
 * - iconBackground from card context
 * - iconSize from card context (can be overridden via size prop)
 */
export function EditableCardIcon({
  icon: Icon,
  className,
  containerClassName,
  size,
}: EditableCardIconProps) {
  const { iconColor, iconBackground, iconSize: contextSize } = useEditableCardContext();
  
  // Use prop size if provided, otherwise use context size
  const effectiveSize = size || contextSize || 'default';
  const config = sizeConfig[effectiveSize as keyof typeof sizeConfig] || sizeConfig.default;

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
        config.container,
        containerClassName
      )}
      style={getBackgroundStyle()}
    >
      <Icon 
        className={cn(config.icon, className)} 
        style={getIconColorStyle()}
      />
    </div>
  );
}
