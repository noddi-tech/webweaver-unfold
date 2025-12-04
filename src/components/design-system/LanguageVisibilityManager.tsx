import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, Languages, Trash2, AlertTriangle } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [languageToDelete, setLanguageToDelete] = useState<Language | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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

  function openDeleteDialog(language: Language) {
    setLanguageToDelete(language);
    setDeleteConfirmation('');
    setDeleteDialogOpen(true);
  }

  async function handleDeleteLanguage() {
    if (!languageToDelete) return;
    
    // Verify confirmation matches language name
    if (deleteConfirmation.toLowerCase() !== languageToDelete.name.toLowerCase()) {
      toast({
        title: 'Confirmation required',
        description: `Please type "${languageToDelete.name}" to confirm deletion`,
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);

    try {
      const langCode = languageToDelete.code;

      // Step 1: Delete all translations for this language
      const { error: translationsError } = await supabase
        .from('translations')
        .delete()
        .eq('language_code', langCode);

      if (translationsError) {
        throw new Error(`Failed to delete translations: ${translationsError.message}`);
      }

      // Step 2: Delete evaluation progress for this language
      const { error: evalProgressError } = await supabase
        .from('evaluation_progress')
        .delete()
        .eq('language_code', langCode);

      if (evalProgressError) {
        console.warn('Failed to delete evaluation progress:', evalProgressError);
        // Continue anyway - this is not critical
      }

      // Step 3: Delete evaluation batches for this language
      const { error: evalBatchesError } = await supabase
        .from('evaluation_batches')
        .delete()
        .eq('language_code', langCode);

      if (evalBatchesError) {
        console.warn('Failed to delete evaluation batches:', evalBatchesError);
        // Continue anyway - this is not critical
      }

      // Step 4: Delete page meta translations for this language
      const { error: pageMetaError } = await supabase
        .from('page_meta_translations')
        .delete()
        .eq('language_code', langCode);

      if (pageMetaError) {
        console.warn('Failed to delete page meta translations:', pageMetaError);
        // Continue anyway - this is not critical
      }

      // Step 5: Delete the language itself
      const { error: languageError } = await supabase
        .from('languages')
        .delete()
        .eq('id', languageToDelete.id);

      if (languageError) {
        throw new Error(`Failed to delete language: ${languageError.message}`);
      }

      toast({
        title: 'Language deleted',
        description: `${languageToDelete.name} and all its translations have been permanently deleted`,
      });

      // Refresh the list
      await loadLanguages();
      setDeleteDialogOpen(false);
      setLanguageToDelete(null);

    } catch (error: any) {
      console.error('Delete language error:', error);
      toast({
        title: 'Deletion failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
            const isEnglish = language.code === 'en';
            
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
                  {!isEnglish && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(language)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete {languageToDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                This action <strong>cannot be undone</strong>. This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All {languageToDelete?.name} translations</li>
                <li>All evaluation data for {languageToDelete?.name}</li>
                <li>All page meta translations for {languageToDelete?.name}</li>
                <li>The language configuration itself</li>
              </ul>
              <div className="pt-4">
                <Label htmlFor="delete-confirm" className="text-foreground">
                  Type <strong>{languageToDelete?.name}</strong> to confirm:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder={languageToDelete?.name}
                  className="mt-2"
                  autoComplete="off"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLanguage}
              disabled={isDeleting || deleteConfirmation.toLowerCase() !== languageToDelete?.name.toLowerCase()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}