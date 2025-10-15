import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import * as Flags from 'country-flag-icons/react/3x2';
import { useAppTranslation } from '@/hooks/useAppTranslation';

type Language = {
  code: string;
  name: string;
  native_name: string;
  flag_code: string;
  enabled: boolean;
};

export function LanguageSwitcher({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const { t, i18n } = useAppTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    async function loadLanguages() {
      const [{ data: langs }, { data: set }, { data: stats }] = await Promise.all([
        supabase.from('languages').select('*').eq('enabled', true).eq('show_in_switcher', true).order('sort_order'),
        supabase.from('language_settings').select('*').single(),
        supabase.from('translation_stats').select('*')
      ]);
      
      // Frontend safety check: only show languages with >= 95% approval or English
      const safeLanguages = langs?.filter(lang => {
        if (lang.code === 'en') return true;
        const stat = stats?.find(s => s.code === lang.code);
        return stat && (stat.approval_percentage ?? 0) >= 95;
      }) || [];
      
      if (safeLanguages) setLanguages(safeLanguages);
      if (set) setSettings(set);
    }
    loadLanguages();
  }, []);

  const changeLanguage = async (newLang: string) => {
    if (isChangingLanguage) return;
    
    setIsChangingLanguage(true);
    try {
      console.log(`[LanguageSwitcher] Switching to ${newLang}...`);
      
      // Change language - i18next will handle loading resources
      await i18n.changeLanguage(newLang);
      
      // Update URL
      const pathWithoutLang = location.pathname.split('/').slice(2).join('/') || '';
      navigate(`/${newLang}/${pathWithoutLang}`, { replace: true });
      
      console.log(`[LanguageSwitcher] Successfully switched to ${newLang}`);
    } catch (error) {
      console.error('[LanguageSwitcher] Error changing language:', error);
    } finally {
      setIsChangingLanguage(false);
    }
  };

  const currentLang = languages.find(l => l.code === (lang || i18n.language)) || languages[0];

  if (!settings || (variant === 'header' && !settings.show_language_switcher_header) || 
      (variant === 'footer' && !settings.show_language_switcher_footer)) {
    return null;
  }

  if (variant === 'footer') {
    // Footer: Horizontal list with flags
    return (
      <div className="flex flex-wrap gap-4 justify-center">
        {languages.map((language) => {
          const FlagIcon = (Flags as any)[language.flag_code];
          return (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentLang?.code === language.code 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted'
              }`}
            >
              {FlagIcon && <FlagIcon className="w-5 h-3" />}
              <span className="text-sm">{language.native_name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Header: Dropdown with flag and text
  const CurrentFlag = currentLang ? (Flags as any)[currentLang.flag_code] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-2 h-10 px-3 py-2 min-w-[180px] justify-start">
          {CurrentFlag ? (
            <CurrentFlag className="w-5 h-3" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
          <span className="text-sm">{t('common.switch_language', 'Switch language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-[60]">
        {languages.map((language) => {
          const FlagIcon = (Flags as any)[language.flag_code];
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="flex items-center gap-3 cursor-pointer"
              disabled={isChangingLanguage}
            >
              {FlagIcon && <FlagIcon className="w-5 h-3" />}
              <div>
                <div className="font-medium">{language.native_name}</div>
                <div className="text-xs text-muted-foreground">{language.name}</div>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
