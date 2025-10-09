import { Link, LinkProps, useParams } from 'react-router-dom';

export function LanguageLink({ to, ...props }: LinkProps) {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || 'en';
  
  // Prepend language to path
  const localizedTo = typeof to === 'string' 
    ? `/${currentLang}${to.startsWith('/') ? to : `/${to}`}`
    : to;

  return <Link to={localizedTo} {...props} />;
}
