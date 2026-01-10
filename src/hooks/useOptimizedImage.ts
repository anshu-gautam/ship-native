/**
 * useOptimizedImage Hook
 *
 * React hook for optimized image loading
 */

import { type ImageOptimizationConfig, imageOptimizer } from '@/lib/imageOptimization';
import { useEffect, useState } from 'react';

export function useOptimizedImage(
  uri: string | undefined,
  options: Partial<ImageOptimizationConfig> = {}
) {
  const [optimizedUri, setOptimizedUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Destructure options into primitive values for dependency tracking
  const { maxWidth, maxHeight, quality, format, enableCache, compressionLevel } = options;

  useEffect(() => {
    if (!uri) {
      setOptimizedUri(undefined);
      return;
    }

    let isMounted = true;

    const loadImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Reconstruct options from primitives
        const currentOptions: Partial<ImageOptimizationConfig> = {};
        if (maxWidth !== undefined) currentOptions.maxWidth = maxWidth;
        if (maxHeight !== undefined) currentOptions.maxHeight = maxHeight;
        if (quality !== undefined) currentOptions.quality = quality;
        if (format !== undefined) currentOptions.format = format;
        if (enableCache !== undefined) currentOptions.enableCache = enableCache;
        if (compressionLevel !== undefined) currentOptions.compressionLevel = compressionLevel;

        const optimized = await imageOptimizer.optimizeImage(uri, currentOptions);
        if (isMounted) {
          setOptimizedUri(optimized);
        }
      } catch (err) {
        if (isMounted) {
          setError(err as Error);
          setOptimizedUri(uri); // Fallback to original
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [uri, maxWidth, maxHeight, quality, format, enableCache, compressionLevel]);

  return { optimizedUri, loading, error };
}
