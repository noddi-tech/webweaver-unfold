import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { EditableCard } from '@/components/EditableCard';
import { EditableCardIcon } from '@/components/EditableCardIcon';
import { EditableCardTitle } from '@/components/EditableCardTitle';
import { EditableCardDescription } from '@/components/EditableCardDescription';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface EditableBenefitCardProps {
  elementIdPrefix: string;
  icon: LucideIcon;
  titleKey: string;
  titleFallback: string;
  descKey: string;
  descFallback: string;
  defaultBackground?: string;
  defaultTextColor?: string;
  className?: string;
}

/**
 * EditableBenefitCard - Reusable benefit/feature card with unified editing
 * 
 * Combines EditableCard, EditableCardIcon, EditableCardTitle, and EditableCardDescription
 * into a single cohesive component. Provides one edit button that opens UnifiedStyleModal
 * for background, text colors, and icon styling.
 * 
 * Text is fetched via translation keys and displayed - editing happens through
 * the card's single edit modal (no individual text edit buttons).
 */
export function EditableBenefitCard({
  elementIdPrefix,
  icon,
  titleKey,
  titleFallback,
  descKey,
  descFallback,
  defaultBackground = 'bg-background',
  defaultTextColor = 'foreground',
  className = '',
}: EditableBenefitCardProps) {
  const { t } = useAppTranslation();

  // Get translated text, fallback to provided defaults
  const title = t(titleKey, titleFallback) || titleFallback;
  const description = t(descKey, descFallback) || descFallback;

  return (
    <EditableCard
      elementIdPrefix={elementIdPrefix}
      defaultBackground={defaultBackground}
      defaultTextColor={defaultTextColor}
      className={`p-6 rounded-xl border border-border shadow-sm flex gap-4 ${className}`}
    >
      <div className="flex-shrink-0">
        <EditableCardIcon icon={icon} size="lg" />
      </div>
      <div className="flex-1">
        <EditableCardTitle className="text-xl font-semibold mb-2">
          {title}
        </EditableCardTitle>
        <EditableCardDescription>
          {description}
        </EditableCardDescription>
      </div>
    </EditableCard>
  );
}
