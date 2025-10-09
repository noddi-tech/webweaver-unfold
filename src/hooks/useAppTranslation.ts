import { useTranslation } from 'react-i18next';

/**
 * Custom hook for app translations with fallback support
 * Usage: const { t } = useAppTranslation();
 * Then: t('hero.title', 'Default fallback text')
 */
export function useAppTranslation() {
  const { t: translate, i18n } = useTranslation();

  /**
   * Translate a key with fallback
   * @param key - Translation key (e.g., 'hero.title')
   * @param fallback - Fallback text if translation not found
   */
  const t = (key: string, fallback?: string) => {
    const translation = translate(key);
    // If translation equals the key, it means no translation was found
    if (translation === key && fallback) {
      return fallback;
    }
    return translation;
  };

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
  };
}
