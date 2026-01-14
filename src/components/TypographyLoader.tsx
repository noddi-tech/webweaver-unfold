import React from 'react';
import { useTypographySettings } from '@/hooks/useTypographySettings';

/**
 * Component that loads and applies typography settings from the database.
 * Must be rendered inside the React tree (after providers).
 */
export const TypographyLoader: React.FC = () => {
  useTypographySettings();
  return null;
};
