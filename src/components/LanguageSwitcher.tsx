import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

type Language = {
  code: string;
  name: string;
  native_name: string;
  flag_code: string;
  enabled: boolean;
};

export function LanguageSwitcher({ variant = 'header' }: { variant?: 'header' | 'footer' }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    async function loadLanguages() {
      const [{ data: langs }, { data: set }] = await Promise.all([
        supabase.from('languages').select('*').eq('enabled', true).order('sort_order'),
        supabase.from('language_settings').select('*').single()
      ]);
      if (langs) setLanguages(langs);
      if (set) setSettings(set);
    }
    loadLanguages();
  }, []);

  const changeLanguage = (newLang: string) => {
    // Update i18next
    i18n.changeLanguage(newLang);
    
    // Update URL
    const pathWithoutLang = location.pathname.split('/').slice(2).join('/') || '';
    navigate(`/${newLang}/${pathWithoutLang}`, { replace: true });
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

  // Header: Dropdown
  const CurrentFlag = currentLang ? (Flags as any)[currentLang.flag_code] : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="gap-2">
          {CurrentFlag ? (
            <CurrentFlag className="w-5 h-3" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((language) => {
          const FlagIcon = (Flags as any)[language.flag_code];
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="flex items-center gap-3 cursor-pointer"
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
