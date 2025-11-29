import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Languages } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';

type Language = {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_code: string;
  enabled: boolean;
  show_in_switcher: boolean;
};

export default function LanguageVisibilityManager() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);

  useEffect(() => {
    loadLanguages();
    loadAutoTranslateSetting();
  }, []);

  const loadAutoTranslateSetting = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'auto_translate_on_edit')
      .single();
    
    const settingValue = data?.setting_value as { enabled?: boolean } | null;
    setAutoTranslateEnabled(settingValue?.enabled === true);
  };

  const handleAutoTranslateToggle = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'auto_translate_on_edit',
          setting_value: { enabled }
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;

      setAutoTranslateEnabled(enabled);
      toast({
        title: enabled ? 'Auto-translate enabled' : 'Auto-translate disabled',
      });
    } catch (error) {
      console.error('Error toggling auto-translate:', error);
      toast({
        title: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  async function loadLanguages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('languages')
      .select('*')
      .eq('enabled', true)
      .order('sort_order');

    if (error) {
      toast({
        title: 'Error loading languages',
        description: error.message,
        variant: 'destructive',
      });
    } else if (data) {
      setLanguages(data);
    }
    setLoading(false);
  }

  async function toggleVisibility(languageId: string, currentValue: boolean) {
    const newValue = !currentValue;
    
    // Optimistic update
    setLanguages(prev =>
      prev.map(lang =>
        lang.id === languageId ? { ...lang, show_in_switcher: newValue } : lang
      )
    );

    const { error } = await supabase
      .from('languages')
      .update({ show_in_switcher: newValue })
      .eq('id', languageId);

    if (error) {
      // Revert on error
      setLanguages(prev =>
        prev.map(lang =>
          lang.id === languageId ? { ...lang, show_in_switcher: currentValue } : lang
        )
      );
      toast({
        title: 'Error updating language',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Language updated',
        description: `Language switcher visibility updated`,
      });
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Auto-Translate Settings
          </CardTitle>
          <CardDescription>
            Automatically translate to enabled languages when English content is edited
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-translate">Auto-translate on English edit</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, saving English text will automatically trigger translation to all enabled languages
              </p>
            </div>
            <Switch
              id="auto-translate"
              checked={autoTranslateEnabled}
              onCheckedChange={handleAutoTranslateToggle}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language Switcher Visibility
          </CardTitle>
          <CardDescription>
            Control which languages appear in the header and footer language switchers.
            Languages must be enabled to appear in switchers.
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {languages.map((language) => {
          const FlagIcon = (Flags as any)[language.flag_code];
          return (
            <div
              key={language.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {FlagIcon && <FlagIcon className="w-8 h-5" />}
                <div>
                  <div className="font-medium">{language.native_name}</div>
                  <div className="text-sm text-muted-foreground">{language.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  {language.show_in_switcher ? 'Visible' : 'Hidden'}
                </span>
                <Switch
                  checked={language.show_in_switcher}
                  onCheckedChange={() =>
                    toggleVisibility(language.id, language.show_in_switcher)
                  }
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
    </div>
  );
}
