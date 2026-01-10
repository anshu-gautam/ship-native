/**
 * useOptimizedImage Hook
 *
 * React hook for optimized image loading
 */

import { useState, useEffect } from 'react';
import { imageOptimizer, type ImageOptimizationConfig } from '@/lib/imageOptimization';

export function useOptimizedImage(
  uri: string | undefined,
  options: Partial<ImageOptimizationConfig> = {}
) {
  const [optimizedUri, setOptimizedUri] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
        const optimized = await imageOptimizer.optimizeImage(uri, options);

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
  }, [uri, JSON.stringify(options)]);

  return { optimizedUri, loading, error };
}
