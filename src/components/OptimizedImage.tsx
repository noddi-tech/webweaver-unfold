import { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet, type ImageTransformOptions } from '@/utils/imageTransform';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  src: string | null | undefined;
  alt: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: 'contain' | 'cover' | 'fill';
  aspectRatio?: string;
  containerClassName?: string;
  responsiveSizes?: number[];
}

export function OptimizedImage({
  src,
  alt,
  sizes = '100vw',
  priority = false,
  quality = 85,
  objectFit = 'contain',
  aspectRatio,
  containerClassName,
  responsiveSizes = [320, 640, 1024, 1920, 2560],
  className,
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-muted', containerClassName)}>
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  // Generate optimized URLs
  const transformOptions: ImageTransformOptions = {
    quality,
    format: 'webp',
    fit: objectFit,
  };

  const srcSet = generateSrcSet(src, responsiveSizes, transformOptions);
  const fallbackSrc = getOptimizedImageUrl(src, { ...transformOptions, width: 1920 });

  const imageStyle = {
    imageRendering: 'high-quality' as const,
    WebkitFontSmoothing: 'antialiased' as const,
    backfaceVisibility: 'hidden' as const,
    willChange: isLoaded ? 'auto' : 'transform',
    ...style,
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <div 
      className={cn('relative overflow-hidden', containerClassName)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        src={fallbackSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        style={imageStyle}
        {...props}
      />
    </div>
  );
}
