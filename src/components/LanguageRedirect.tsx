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
      
      // Redirect to language-prefixed route
      navigate(`/${defaultLang}${window.location.pathname}`, { replace: true });
    }
  }, [lang, navigate]);

  return null;
}
