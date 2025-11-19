/**
 * Image aspect ratio utilities
 */

/**
 * Calculate the aspect ratio from image dimensions
 * Returns a simplified ratio string (e.g., "16:9", "4:3", "1:1")
 */
export function calculateAspectRatio(width: number, height: number): string {
  if (!width || !height) return 'auto';
  
  // Find GCD (Greatest Common Divisor)
  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };
  
  const divisor = gcd(width, height);
  const ratioW = Math.round(width / divisor);
  const ratioH = Math.round(height / divisor);
  
  // Map to common aspect ratios if close enough
  const commonRatios: Record<string, [number, number]> = {
    '1:1': [1, 1],
    '4:3': [4, 3],
    '3:4': [3, 4],
    '16:9': [16, 9],
    '9:16': [9, 16],
    '21:9': [21, 9],
    '3:2': [3, 2],
    '2:3': [2, 3],
  };
  
  // Check if calculated ratio matches a common one (within 5% tolerance)
  const calculatedRatio = ratioW / ratioH;
  for (const [name, [w, h]] of Object.entries(commonRatios)) {
    const commonRatio = w / h;
    const difference = Math.abs(calculatedRatio - commonRatio) / commonRatio;
    if (difference < 0.05) {  // 5% tolerance
      return name;
    }
  }
  
  // Return simplified ratio
  return `${ratioW}:${ratioH}`;
}

/**
 * Load an image and detect its aspect ratio
 */
export async function detectImageAspectRatio(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = calculateAspectRatio(img.naturalWidth, img.naturalHeight);
      resolve(ratio);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}
