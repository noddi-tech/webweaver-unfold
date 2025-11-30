import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { supabase } from '@/integrations/supabase/client';

// Cache valid switcher languages to avoid repeated database queries
let validSwitcherLanguages: string[] = ['en']; // Default to English only

// Function to refresh valid languages from database
async function refreshValidLanguages() {
  try {
    const { data, error } = await supabase
      .from('languages')
      .select('code')
      .eq('enabled', true)
      .eq('show_in_switcher', true);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      validSwitcherLanguages = data.map(l => l.code);
      console.log('[i18n] Valid switcher languages:', validSwitcherLanguages);
    }
  } catch (error) {
    console.error('[i18n] Error loading valid switcher languages:', error);
  }
}

// Load valid languages on init
refreshValidLanguages();

// Custom backend to load from Supabase
const supabaseBackend = {
  type: 'backend' as const,
  init: () => {},
  read: async (language: string, namespace: string, callback: (err: Error | null, data?: any) => void) => {
    try {
      console.log(`[i18n] Loading translations for language: ${language}`);
      
      // For English (source language), load all translations regardless of approval status
      // For other languages, only load approved translations
      const query = supabase
        .from('translations')
        .select('translation_key, translated_text')
        .eq('language_code', language);
      
      if (language !== 'en') {
        query.eq('approved', true);
      }
      
      const { data, error } = await query;

      if (error) throw error;

      // Convert array to nested object structure with conflict resolution
      const translations: any = {};
      
      // Sort to ensure parent keys are processed before children
      const sortedData = data?.sort((a, b) => {
        const aDepth = a.translation_key.split('.').length;
        const bDepth = b.translation_key.split('.').length;
        return aDepth - bDepth;
      }) || [];
      
      sortedData.forEach((item) => {
        const keys = item.translation_key.split('.');
        let current = translations;
        
        for (let index = 0; index < keys.length; index++) {
          const key = keys[index];
          
          if (index === keys.length - 1) {
            // Only set value if current[key] is not already an object with children
            if (typeof current[key] !== 'object' || Object.keys(current[key] || {}).length === 0) {
              current[key] = item.translated_text;
            } else {
              console.warn(`[i18n] Skipping conflicting key "${item.translation_key}" - child keys already exist`);
            }
          } else {
            // Only create nested object if current[key] is not already a string value
            if (typeof current[key] === 'string') {
              console.warn(`[i18n] Key conflict: "${keys.slice(0, index + 1).join('.')}" is both a parent and value`);
              // Keep the existing string value, don't overwrite
              break;
            }
            current[key] = current[key] || {};
            current = current[key];
          }
        }
      });

      console.log(`[i18n] Loaded ${data?.length || 0} translations for ${language}`);
      callback(null, translations);
    } catch (error: any) {
      console.error('[i18n] Error loading translations:', error);
      callback(error, null);
    }
  }
};

// Custom language detector
const customDetector = {
  name: 'customDetector',
  lookup: (): string | undefined => {
    // 1. Check URL path first - only if it's a valid switcher language
    const pathLang = window.location.pathname.split('/')[1];
    if (pathLang && pathLang.length === 2 && validSwitcherLanguages.includes(pathLang)) {
      return pathLang;
    }

    // 2. Check localStorage - only if it's a valid switcher language
    const stored = localStorage.getItem('navio-language');
    if (stored && validSwitcherLanguages.includes(stored)) {
      return stored;
    }

    // 3. Browser language - ONLY if it's in the switcher list
    const browserLang = navigator.language.split('-')[0];
    if (validSwitcherLanguages.includes(browserLang)) {
      console.log('[i18n] Using browser language:', browserLang);
      return browserLang;
    }

    // 4. Fallback to English
    console.log('[i18n] Falling back to English (no valid language detected)');
    return 'en';
  },
  cacheUserLanguage: (lng: string) => {
    localStorage.setItem('navio-language', lng);
  }
};

const languageDetector = new LanguageDetector();
languageDetector.addDetector(customDetector);

i18n
  .use(supabaseBackend as any)
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'pl', 'sv', 'no', 'da', 'fi', 'cs', 'hu', 'ro', 'el'],
    partialBundledLanguages: true,
    load: 'languageOnly',
    detection: {
      order: ['customDetector', 'localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'navio-language',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

// Real-time updates for translations
supabase
  .channel('translations-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'translations' }, () => {
    console.log('[i18n] Translations updated, reloading...');
    i18n.reloadResources();
  })
  .subscribe();

console.log('[i18n] i18next initialized with Supabase backend');

export default i18n;
