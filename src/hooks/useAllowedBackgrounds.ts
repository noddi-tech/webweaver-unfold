import { useMemo } from 'react';
import { useColorSystem } from './useColorSystem';

/**
 * Hook that returns all allowed backgrounds from the CMS
 * Replaces hardcoded gradient lists throughout the application
 */
export const useAllowedBackgrounds = () => {
  const { ALL_BACKGROUND_OPTIONS, loading } = useColorSystem();
  
  const allowedBackgrounds = useMemo(() => 
    ALL_BACKGROUND_OPTIONS.map(opt => opt.preview),
    [ALL_BACKGROUND_OPTIONS]
  );

  return {
    allowedBackgrounds,
    loading
  };
};
