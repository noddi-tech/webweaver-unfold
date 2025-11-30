import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function LanguageRedirect() {
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();

  useEffect(() => {
    async function handleRedirect() {
      if (!lang) {
        // Fetch valid switcher languages from database
        const { data: validLangs } = await supabase
          .from('languages')
          .select('code')
          .eq('enabled', true)
          .eq('show_in_switcher', true);
        
        const validCodes = validLangs?.map(l => l.code) || ['en'];
        console.log('[LanguageRedirect] Valid switcher languages:', validCodes);
        
        // Get language preferences
        const storedLang = localStorage.getItem('navio-language');
        const browserLang = navigator.language.split('-')[0];
        
        // Only use stored/browser language if it's in the valid switcher list
        let defaultLang = 'en';
        if (storedLang && validCodes.includes(storedLang)) {
          defaultLang = storedLang;
          console.log('[LanguageRedirect] Using stored language:', defaultLang);
        } else if (browserLang && validCodes.includes(browserLang)) {
          defaultLang = browserLang;
          console.log('[LanguageRedirect] Using browser language:', defaultLang);
        } else {
          console.log('[LanguageRedirect] Falling back to English');
        }
        
        // Clean pathname by removing incorrect prefixes like /auth/ or /admin/
        let cleanPath = window.location.pathname;
        cleanPath = cleanPath.replace(/^\/(auth|admin)\//, '/');
        
        // Redirect to language-prefixed route
        navigate(`/${defaultLang}${cleanPath}`, { replace: true });
      }
    }
    
    handleRedirect();
  }, [lang, navigate]);

  return null;
}
