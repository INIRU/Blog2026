import { useCallback, useState } from 'react';

export function useEmbedLoad() {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  return { isLoaded, handleLoad };
}
