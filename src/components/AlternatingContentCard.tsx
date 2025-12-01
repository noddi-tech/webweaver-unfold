import React from 'react';
import { cn } from '@/lib/utils';

export interface CardContent {
  id: string;
  heading: string;
  description: string;
  imageUrl: string;
}

interface AlternatingContentCardProps {
  content: CardContent;
  index: number;
  
  // Layout options
  alternateLayout?: boolean;
  reverseFirstCard?: boolean;
  
  // Animation options
  enableScrollAnimation?: boolean;
  animationState?: { opacity: number; scale: number };
  
  // Styling options
  cardStyle?: 'elevated' | 'flat' | 'outlined' | 'glass' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  imageAspectRatio?: '1/1' | '4/3' | '16/9' | '3/2';
  imageSize?: 'sm' | 'md' | 'lg' | 'full';
  
  // Accent bar options
  showAccentBar?: boolean;
  accentBarGradient?: string;
  
  // Custom rendering (for CMS editing)
  renderHeading?: (heading: string) => React.ReactNode;
  renderDescription?: (description: string) => React.ReactNode;
  renderImage?: (imageUrl: string, altText: string) => React.ReactNode;
}

const cardStyles = {
  elevated: 'bg-card shadow-xl',
  flat: 'bg-muted/30',
  outlined: 'border border-border bg-transparent',
  glass: 'bg-card/60 backdrop-blur-lg shadow-lg',
  transparent: '',
};

const paddingStyles = {
  none: 'p-0',
  sm: 'p-4 lg:p-6',
  md: 'p-6 lg:p-8',
  lg: 'p-8 lg:p-12',
};

const radiusStyles = {
  none: 'rounded-none',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
};

const aspectRatioStyles = {
  '1/1': 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '3/2': 'aspect-[3/2]',
};

const imageSizeStyles = {
  sm: 'lg:max-w-xs',      // ~320px - very small
  md: 'lg:max-w-sm',      // ~384px - 50% reduction
  lg: 'lg:max-w-md',      // ~448px - slight reduction
  full: '',               // no constraint
};

export function AlternatingContentCard({
  content,
  index,
  alternateLayout = true,
  reverseFirstCard = false,
  enableScrollAnimation = false,
  animationState = { opacity: 1, scale: 1 },
  cardStyle = 'elevated',
  padding = 'lg',
  borderRadius = '3xl',
  imageAspectRatio = '4/3',
  imageSize = 'md',
  showAccentBar = false,
  accentBarGradient = '--gradient-warmth',
  renderHeading,
  renderDescription,
  renderImage,
}: AlternatingContentCardProps) {
  // Determine if image should be on left or right for this card
  const imageOnLeft = alternateLayout 
    ? (reverseFirstCard ? index % 2 === 0 : index % 2 !== 0)
    : false;

  const animationStyles = enableScrollAnimation ? {
    opacity: animationState.opacity,
    transform: `scale(${animationState.scale})`,
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
  } : {};

  const defaultHeading = (
    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
      {content.heading}
    </h3>
  );

  const defaultDescription = (
    <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
      {content.description}
    </p>
  );

  const defaultImage = content.imageUrl ? (
    <img 
      src={content.imageUrl}
      alt={content.heading}
      className="w-full h-full object-cover"
    />
  ) : null;

  return (
    <div
      className={cn(
        cardStyles[cardStyle],
        paddingStyles[padding],
        cardStyle !== 'transparent' && radiusStyles[borderRadius],
        cardStyle !== 'transparent' && 'overflow-hidden'
      )}
      style={animationStyles}
    >
      {/* Outer flex container for mobile accent bar */}
      <div className="flex gap-4">
        {/* Mobile/Tablet accent bar - left side of entire card */}
        {showAccentBar && (
          <div 
            className="w-1.5 rounded-full self-stretch shrink-0 lg:hidden"
            style={{ backgroundImage: `var(${accentBarGradient})` }}
          />
        )}
        
        {/* Main content wrapper */}
        <div className="flex-1">
          <div className={cn(
            'grid gap-6 lg:gap-8 items-stretch',
            // Mobile: single column, Desktop: 3 columns with bar or 2 columns without
            'grid-cols-1',
            showAccentBar ? 'lg:grid-cols-[1fr_auto_1fr]' : 'lg:grid-cols-2'
          )}>
            {/* Image - first on mobile (order-1), positioned via grid on desktop */}
            <div className={cn(
              'w-full overflow-hidden order-1 lg:order-none lg:row-start-1',
              radiusStyles[borderRadius],
              aspectRatioStyles[imageAspectRatio],
              imageSizeStyles[imageSize],
              // On desktop: position based on imageOnLeft and grid type
              imageOnLeft 
                ? 'lg:col-start-1 lg:justify-self-start' 
                : (showAccentBar ? 'lg:col-start-3 lg:justify-self-end' : 'lg:col-start-2 lg:justify-self-end')
            )}>
              {renderImage ? renderImage(content.imageUrl, content.heading) : defaultImage}
            </div>
            
            {/* Desktop center accent bar */}
            {showAccentBar && (
              <div 
                className="hidden lg:flex items-stretch self-stretch lg:col-start-2 lg:row-start-1"
              >
                <div 
                  className="w-1.5 rounded-full h-full min-h-full"
                  style={{ backgroundImage: `var(${accentBarGradient})` }}
                />
              </div>
            )}
            
            {/* Text Content - second on mobile (order-2), positioned via grid on desktop */}
            <div className={cn(
              'order-2 lg:order-none flex items-start lg:self-start lg:row-start-1',
              imageOnLeft 
                ? (showAccentBar ? 'lg:col-start-3' : 'lg:col-start-2')
                : 'lg:col-start-1'
            )}>
              <div className="space-y-6">
                {renderHeading ? renderHeading(content.heading) : defaultHeading}
                {renderDescription ? renderDescription(content.description) : defaultDescription}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
