/**
 * Image transformation utilities for Supabase Storage
 * Generates optimized image URLs with proper sizing and format conversion
 */

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'origin';
  fit?: 'contain' | 'cover' | 'fill';
}

/**
 * Generate optimized Supabase image URL with transformation parameters
 */
export function getOptimizedImageUrl(
  originalUrl: string | null | undefined,
  options: ImageTransformOptions = {}
): string {
  if (!originalUrl) return '';
  
  // If it's not a Supabase URL, return original
  if (!originalUrl.includes('supabase.co/storage')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 85,
    format = 'webp',
    fit = 'contain',
  } = options;

  try {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();

    if (width) params.set('width', width.toString());
    if (height) params.set('height', height.toString());
    params.set('quality', quality.toString());
    if (format) params.set('format', format);
    params.set('resize', fit);

    url.search = params.toString();
    return url.toString();
  } catch (error) {
    console.error('Failed to transform image URL:', error);
    return originalUrl;
  }
}

/**
 * Generate responsive srcset for different screen sizes
 */
export function generateSrcSet(
  originalUrl: string | null | undefined,
  sizes: number[] = [320, 640, 1024, 1920, 2560],
  options: Omit<ImageTransformOptions, 'width'> = {}
): string {
  if (!originalUrl) return '';

  return sizes
    .map((size) => {
      const url = getOptimizedImageUrl(originalUrl, { ...options, width: size });
      return `${url} ${size}w`;
    })
    .join(', ');
}

/**
 * Predefined image size presets for common use cases
 */
export const IMAGE_PRESETS = {
  thumbnail: { width: 320, height: 320, quality: 80, fit: 'cover' as const },
  card: { width: 640, quality: 85, fit: 'cover' as const },
  hero: { width: 1920, quality: 90, fit: 'cover' as const },
  fullWidth: { width: 2560, quality: 85, fit: 'contain' as const },
  background: { width: 1920, quality: 75, fit: 'cover' as const },
} as const;

/**
 * Get optimized URL using a preset
 */
export function getPresetImageUrl(
  originalUrl: string | null | undefined,
  preset: keyof typeof IMAGE_PRESETS
): string {
  return getOptimizedImageUrl(originalUrl, IMAGE_PRESETS[preset]);
}
