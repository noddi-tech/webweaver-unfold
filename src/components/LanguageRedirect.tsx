import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function LanguageRedirect() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    if (!lang) {
      // Get language from localStorage or browser
      const storedLang = localStorage.getItem('noddi-language');
      const browserLang = navigator.language.split('-')[0];
      const defaultLang = storedLang || browserLang || 'en';
      
      // Clean pathname by removing incorrect prefixes like /auth/ or /admin/
      let cleanPath = window.location.pathname;
      cleanPath = cleanPath.replace(/^\/(auth|admin)\//, '/');
      
      // Redirect to language-prefixed route
      navigate(`/${defaultLang}${cleanPath}`, { replace: true });
    }
  }, [lang, navigate]);

  return null;
}
