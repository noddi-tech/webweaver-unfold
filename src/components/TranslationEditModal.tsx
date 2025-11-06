import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import i18n from '@/i18n/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppTranslation } from '@/hooks/useAppTranslation';

interface TranslationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentTable: 'text_content' | 'translations';
  translationKey?: string;
  onSave?: () => void;
  fallbackText?: string;
  useElementId?: boolean; // When true, query by element_id instead of id
}

interface Translation {
  language_code: string;
  translated_text: string;
  language_name?: string;
}

export function TranslationEditModal({
  open,
  onOpenChange,
  contentId,
  contentTable,
  translationKey,
  onSave,
  fallbackText,
  useElementId = false,
}: TranslationEditModalProps) {
  const [content, setContent] = useState('');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { currentLanguage } = useAppTranslation();

  useEffect(() => {
    if (open) {
      loadContent();
    }
  }, [open, contentId]);

  const loadContent = async () => {
    setLoading(true);
    try {
      if (contentTable === 'text_content') {
        // Query by element_id if useElementId is true, otherwise by id
        let data: any;
        let error: any;
        
        if (useElementId) {
          // @ts-ignore - TypeScript has issues with complex Supabase generic types
          const res = await supabase
            .from('text_content')
            .select('content')
            .eq('element_id', contentId)
            .maybeSingle();
          data = res.data;
          error = res.error;
        } else {
          // @ts-ignore - TypeScript has issues with complex Supabase generic types
          const res = await supabase
            .from('text_content')
            .select('content')
            .eq('id', contentId)
            .maybeSingle();
          data = res.data;
          error = res.error;
        }
        
        if (error) throw error;
        setContent(data?.content || '');

        // Load translations if translation key exists
        if (translationKey) {
          const { data: langData } = await supabase
            .from('languages')
            .select('code, name')
            .eq('enabled', true)
            .order('sort_order');

          const { data: transData } = await supabase
            .from('translations')
            .select('language_code, translated_text')
            .eq('translation_key', translationKey);

          const translationsMap = new Map(
            transData?.map(t => [t.language_code, t.translated_text]) || []
          );

          setTranslations(
            langData?.map(lang => ({
              language_code: lang.code,
              language_name: lang.name,
              translated_text: translationsMap.get(lang.code) || '',
            })) || []
          );
        }
      } else if (contentTable === 'translations' && translationKey) {
        // Load all translations for this key
        const { data: langData } = await supabase
          .from('languages')
          .select('code, name')
          .eq('enabled', true)
          .order('sort_order');

        const { data: transData } = await supabase
          .from('translations')
          .select('language_code, translated_text, id')
          .eq('translation_key', translationKey);

        const translationsMap = new Map(
          transData?.map(t => [t.language_code, t.translated_text]) || []
        );

        // Get English content as the main content, use fallback if not found
        const englishContent = translationsMap.get('en') || fallbackText || '';
        setContent(englishContent);

        setTranslations(
          langData?.map(lang => ({
            language_code: lang.code,
            language_name: lang.name,
            translated_text: translationsMap.get(lang.code) || '',
          })) || []
        );
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      if (contentTable === 'text_content') {
        // Update by element_id if useElementId is true, otherwise by id
        let error: any;
        
        if (useElementId) {
          // @ts-ignore - TypeScript has issues with complex Supabase generic types
          const res = await supabase
            .from('text_content')
            .update({ content })
            .eq('element_id', contentId);
          error = res.error;
        } else {
          // @ts-ignore - TypeScript has issues with complex Supabase generic types
          const res = await supabase
            .from('text_content')
            .update({ content })
            .eq('id', contentId);
          error = res.error;
        }
        
        if (error) throw error;
      } else if (contentTable === 'translations' && translationKey) {
        // Check if translation exists
        const { data: existing } = await supabase
          .from('translations')
          .select('id')
          .eq('translation_key', translationKey)
          .eq('language_code', currentLanguage)
          .maybeSingle();

        if (existing) {
          // Update existing translation
          const { error } = await supabase
            .from('translations')
            .update({
              translated_text: content,
              approved: currentLanguage === 'en',
              review_status: currentLanguage === 'en' ? 'approved' : 'pending',
            })
            .eq('translation_key', translationKey)
            .eq('language_code', currentLanguage);

          if (error) throw error;
        } else {
          // Insert new translation
          const { error } = await supabase
            .from('translations')
            .insert({
              translation_key: translationKey,
              language_code: currentLanguage,
              translated_text: content,
              approved: currentLanguage === 'en',
              review_status: currentLanguage === 'en' ? 'approved' : 'pending',
            });

          if (error) throw error;
        }
      }

      toast.success('Content updated successfully');
      onOpenChange(false);
      
      // Trigger i18n reload to refresh translations without full page reload
      await i18n.reloadResources(currentLanguage);
      // Force language change event to trigger React re-renders
      await i18n.changeLanguage(currentLanguage);
      
      // Call optional callback for additional refresh logic
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const saveTranslation = async (languageCode: string, text: string) => {
    if (!translationKey) return;

    setSaving(true);
    try {
      // Check if translation exists
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('translation_key', translationKey)
        .eq('language_code', languageCode)
        .maybeSingle();

      if (existing) {
        // Update existing translation
        const { error } = await supabase
          .from('translations')
          .update({
            translated_text: text,
            approved: languageCode === 'en',
            review_status: languageCode === 'en' ? 'approved' : 'pending',
          })
          .eq('translation_key', translationKey)
          .eq('language_code', languageCode);

        if (error) throw error;
      } else {
        // Insert new translation
        const { error } = await supabase
          .from('translations')
          .insert({
            translation_key: translationKey,
            language_code: languageCode,
            translated_text: text,
            approved: languageCode === 'en',
            review_status: languageCode === 'en' ? 'approved' : 'pending',
          });

        if (error) throw error;
      }

      toast.success(`Translation ${existing ? 'updated' : 'created'} for ${languageCode}`);
      
      // Trigger i18n reload to refresh translations
      await i18n.reloadResources(currentLanguage);
      // Force language change event to trigger React re-renders
      await i18n.changeLanguage(currentLanguage);
      
      // Reload content to show the new translation
      await loadContent();
      
      // Call optional callback for additional refresh logic
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Failed to save translation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Content
          </DialogTitle>
          <DialogDescription>
            Edit the content and its translations below
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="main">Main Content</TabsTrigger>
              <TabsTrigger value="translations" disabled={!translationKey}>
                Translations {translationKey ? `(${translations.length})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button onClick={saveContent} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Content'}
              </Button>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4">
              {translations.map((trans) => (
                <div key={trans.language_code} className="space-y-2">
                  <Label htmlFor={`trans-${trans.language_code}`}>
                    {trans.language_name} ({trans.language_code})
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id={`trans-${trans.language_code}`}
                      value={trans.translated_text}
                      onChange={(e) => {
                        setTranslations(prev =>
                          prev.map(t =>
                            t.language_code === trans.language_code
                              ? { ...t, translated_text: e.target.value }
                              : t
                          )
                        );
                      }}
                      rows={3}
                      className="resize-none flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        saveTranslation(trans.language_code, trans.translated_text)
                      }
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
