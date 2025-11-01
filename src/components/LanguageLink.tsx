import { Link, LinkProps, useParams } from 'react-router-dom';
import { forwardRef } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';

export const LanguageLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, onClick, ...props }, ref) => {
    const { lang } = useParams<{ lang: string }>();
    const { editMode } = useEditMode();
    const currentLang = lang || 'en';
    
    // Prepend language to path
    const localizedTo = typeof to === 'string' 
      ? `/${currentLang}${to.startsWith('/') ? to : `/${to}`}`
      : to;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (editMode) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return <Link ref={ref} to={localizedTo} onClick={handleClick} {...props} />;
  }
);

LanguageLink.displayName = 'LanguageLink';
