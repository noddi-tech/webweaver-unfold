import { Link, LinkProps, useParams } from 'react-router-dom';
import { forwardRef } from 'react';

export const LanguageLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => {
    const { lang } = useParams<{ lang: string }>();
    const currentLang = lang || 'en';
    
    // Prepend language to path
    const localizedTo = typeof to === 'string' 
      ? `/${currentLang}${to.startsWith('/') ? to : `/${to}`}`
      : to;

    return <Link ref={ref} to={localizedTo} {...props} />;
  }
);

LanguageLink.displayName = 'LanguageLink';
