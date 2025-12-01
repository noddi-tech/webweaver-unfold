import React, { useRef } from 'react';
import { AlternatingContentCard, CardContent } from './AlternatingContentCard';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

interface AlternatingContentSectionProps {
  items: CardContent[];
  
  // Pass-through to cards
  cardOptions?: {
    alternateLayout?: boolean;
    reverseFirstCard?: boolean;
    cardStyle?: 'elevated' | 'flat' | 'outlined' | 'glass' | 'transparent';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    borderRadius?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    imageAspectRatio?: '1/1' | '4/3' | '16/9' | '3/2';
    showAccentBar?: boolean;
    accentBarGradient?: string;
  };
  
  // Section options
  enableScrollReveal?: boolean;
  sectionSpacing?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'container' | '7xl' | '6xl' | '5xl';
  sectionBackground?: 'none' | 'muted' | 'cream';
  className?: string;
  
  // Section header (renders inside the section background)
  sectionTitle?: React.ReactNode;
  sectionDescription?: React.ReactNode;
  
  // CMS integration
  renderCardHeading?: (item: CardContent, index: number) => React.ReactNode;
  renderCardDescription?: (item: CardContent, index: number) => React.ReactNode;
  renderCardImage?: (item: CardContent, index: number) => React.ReactNode;
}

const spacingStyles = {
  sm: 'space-y-8',
  md: 'space-y-12',
  lg: 'space-y-16',
  xl: 'space-y-20',
};

const backgroundStyles = {
  none: '',
  muted: 'bg-muted/30',
  cream: 'bg-[hsl(var(--cream))]',
};

const maxWidthStyles = {
  container: 'container',
  '7xl': 'max-w-7xl',
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
};

export function AlternatingContentSection({
  items,
  cardOptions = {},
  enableScrollReveal = false,
  sectionSpacing = 'lg',
  maxWidth = '6xl',
  sectionBackground = 'none',
  className,
  sectionTitle,
  sectionDescription,
  renderCardHeading,
  renderCardDescription,
  renderCardImage,
}: AlternatingContentSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Use scroll progress hook for animations
  const { cardStates } = useScrollProgress(sectionRef, items.length);

  return (
    <section 
      ref={sectionRef}
      className={cn('py-16 md:py-20 px-4 sm:px-6', backgroundStyles[sectionBackground], className)}
    >
      {/* Section Header - renders inside the section background */}
      {(sectionTitle || sectionDescription) && (
        <div className="mx-auto max-w-4xl text-center mb-16">
          {sectionTitle}
          {sectionDescription}
        </div>
      )}
      
      <div className={cn(
        'mx-auto',
        maxWidthStyles[maxWidth],
        spacingStyles[sectionSpacing]
      )}>
        {items.map((item, index) => (
          <AlternatingContentCard
            key={item.id}
            content={item}
            index={index}
            enableScrollAnimation={enableScrollReveal}
            animationState={enableScrollReveal ? cardStates[index] : undefined}
            {...cardOptions}
            renderHeading={renderCardHeading ? (heading) => renderCardHeading(item, index) : undefined}
            renderDescription={renderCardDescription ? (description) => renderCardDescription(item, index) : undefined}
            renderImage={renderCardImage ? (imageUrl, altText) => renderCardImage(item, index) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
