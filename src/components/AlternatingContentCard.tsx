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
      <div className={cn(
        'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center',
        imageOnLeft && 'lg:grid-flow-dense'
      )}>
        {/* Text Content */}
        <div className={cn(
          imageOnLeft && 'lg:col-start-2'
        )}>
          <div className="flex items-start gap-4">
            {/* Accent Bar */}
            {showAccentBar && (
              <div 
                className="w-1.5 rounded-full self-stretch min-h-[80px] shrink-0"
                style={{ backgroundImage: `var(${accentBarGradient})` }}
              />
            )}
            
            {/* Text Content */}
            <div className="space-y-6">
              {renderHeading ? renderHeading(content.heading) : defaultHeading}
              {renderDescription ? renderDescription(content.description) : defaultDescription}
            </div>
          </div>
        </div>

        {/* Image Content */}
        <div className={cn(
          'w-full overflow-hidden',
          radiusStyles[borderRadius],
          aspectRatioStyles[imageAspectRatio],
          imageOnLeft && 'lg:col-start-1 lg:row-start-1'
        )}>
          {renderImage ? renderImage(content.imageUrl, content.heading) : defaultImage}
        </div>
      </div>
    </div>
  );
}
