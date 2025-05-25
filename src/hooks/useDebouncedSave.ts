
import { useCallback, useRef } from 'react';

export const useDebouncedSave = (saveFunction: () => void, delay: number = 500) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      saveFunction();
    }, delay);
  }, [saveFunction, delay]);

  return debouncedSave;
};
