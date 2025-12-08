import React from 'react';
import { useBackgroundTextColor } from '@/contexts/BackgroundTextColorContext';
import { resolveTextColor } from '@/lib/textColorUtils';
import { cn } from '@/lib/utils';
import { CardTitle } from '@/components/ui/card';

interface EditableCardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
}

/**
 * EditableCardTitle - Title that inherits text color from parent EditableCard
 * 
 * Uses BackgroundTextColorContext to automatically apply the correct text color
 * based on the card's background. Falls back to 'foreground' if no context.
 */
export function EditableCardTitle({
  children,
  className,
  as: Component = 'h3',
}: EditableCardTitleProps) {
  const { inheritedTextColor } = useBackgroundTextColor();

  // Use inherited color or default to foreground
  const colorStyle: React.CSSProperties = inheritedTextColor
    ? { color: resolveTextColor(inheritedTextColor) }
    : {};

  return (
    <CardTitle className={cn(className)} style={colorStyle}>
      {children}
    </CardTitle>
  );
}
