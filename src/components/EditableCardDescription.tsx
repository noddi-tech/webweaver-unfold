import React from 'react';
import { useBackgroundTextColor } from '@/contexts/BackgroundTextColorContext';
import { resolveTextColor } from '@/lib/textColorUtils';
import { cn } from '@/lib/utils';

interface EditableCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  muted?: boolean; // If true, uses muted version of inherited color
}

/**
 * EditableCardDescription - Description text that inherits color from parent EditableCard
 * 
 * Uses BackgroundTextColorContext to automatically apply the correct text color.
 * When `muted` is true, applies opacity to create a muted effect.
 */
export function EditableCardDescription({
  children,
  className,
  muted = true,
}: EditableCardDescriptionProps) {
  const { inheritedTextColor } = useBackgroundTextColor();

  // Resolve color - use muted-foreground style for descriptions
  const getColorStyle = (): React.CSSProperties => {
    if (!inheritedTextColor || inheritedTextColor === 'foreground') {
      // Default to muted-foreground for descriptions
      return { color: 'hsl(var(--muted-foreground))' };
    }

    // If white text is inherited, use white with reduced opacity
    if (inheritedTextColor === 'white' || inheritedTextColor === 'text-white') {
      return { color: muted ? 'rgba(255, 255, 255, 0.8)' : 'white' };
    }

    // For other inherited colors, apply or use muted variant
    const resolvedColor = resolveTextColor(inheritedTextColor);
    return { 
      color: resolvedColor,
      opacity: muted ? 0.8 : 1,
    };
  };

  return (
    <p className={cn(className)} style={getColorStyle()}>
      {children}
    </p>
  );
}
