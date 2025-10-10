import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Upload, Loader2, Plus, RefreshCw } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LanguageSettings from './LanguageSettings';

export default function TranslationManagerContent() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchFilter, setSearchFilter] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('homepage');
  const [isSyncing, setIsSyncing] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: langs }, { data: trans }] = await Promise.all([
      supabase.from('languages').select('*').order('sort_order'),
      supabase.from('translations').select('*').order('translation_key'),
    ]);
    
    // Get stats from view
    const { data: st } = await supabase.from('translation_stats' as any).select('*');
    
    if (langs) setLanguages(langs);
    if (trans) setTranslations(trans);
    if (st) setStats(st);
  }

  const filteredTranslations = translations.filter(
    t => t.language_code === selectedLang &&
         (searchFilter === '' || t.translation_key.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('translations')
      .update({ approved: true, approved_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error approving translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation approved' });
      loadData();
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('translations')
      .update({ approved: false })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error rejecting translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation rejected' });
      loadData();
    }
  }

  async function handleSyncKeys() {
    setIsSyncing(true);
    
    try {
      // Get all unique English translation keys
      const { data: englishKeys } = await supabase
        .from('translations')
        .select('translation_key, page_location')
        .eq('language_code', 'en');

      if (!englishKeys) {
        toast({ title: 'Error loading English keys', variant: 'destructive' });
        setIsSyncing(false);
        return;
      }

      // Get enabled languages (except English)
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');
      
      let keysCreated = 0;

      for (const lang of targetLanguages) {
        for (const enKey of englishKeys) {
          // Check if translation already exists
          const { data: existing } = await supabase
            .from('translations')
            .select('id')
            .eq('translation_key', enKey.translation_key)
            .eq('language_code', lang.code)
            .single();

          if (!existing) {
            // Create placeholder translation
            const { error } = await supabase
              .from('translations')
              .insert({
                translation_key: enKey.translation_key,
                language_code: lang.code,
                translated_text: '',
                approved: false,
                page_location: enKey.page_location,
              });

            if (!error) keysCreated++;
          }
        }
      }

      toast({ 
        title: 'Keys synced successfully!', 
        description: `Created ${keysCreated} placeholder translations`
      });
      loadData();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  }

  async function handleTranslateAll() {
    setIsTranslating(true);
    setTranslationProgress('Starting translation...');
    
    // Get all English keys
    const { data: englishKeys } = await supabase
      .from('translations')
      .select('translation_key')
      .eq('language_code', 'en')
      .eq('approved', true);

    if (!englishKeys || englishKeys.length === 0) {
      toast({ title: 'No approved English translations found', variant: 'destructive' });
      setIsTranslating(false);
      setTranslationProgress('');
      return;
    }

    // Get enabled languages (except English)
    const targetLanguages = languages
      .filter(l => l.enabled && l.code !== 'en')
      .map(l => l.code);

    if (targetLanguages.length === 0) {
      toast({ title: 'No target languages enabled', variant: 'destructive' });
      setIsTranslating(false);
      setTranslationProgress('');
      return;
    }

    setTranslationProgress(`Translating ${englishKeys.length} keys to ${targetLanguages.length} languages...`);

    try {
      console.log('Invoking translate-content function:', {
        keysCount: englishKeys.length,
        targetLanguages,
      });

      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          translationKeys: englishKeys.map(k => k.translation_key),
          targetLanguages,
          sourceLanguage: 'en',
        }
      });

      console.log('Translation response:', { data, error });

      if (error) {
        console.error('Translation error details:', error);
        
        // Handle specific error types
        if (error.message?.includes('429')) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (error.message?.includes('402')) {
          throw new Error('Payment required. Please check your Lovable AI credits.');
        } else if (error.message?.includes('LOVABLE_API_KEY')) {
          throw new Error('API key not configured. Please contact support.');
        }
        
        throw error;
      }

      toast({ 
        title: 'Translation complete!', 
        description: `Translated ${englishKeys.length} keys to ${targetLanguages.length} languages`
      });
      loadData();
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({ 
        title: 'Translation failed', 
        description: error.message || 'Unknown error occurred',
        variant: 'destructive' 
      });
    } finally {
      setIsTranslating(false);
      setTranslationProgress('');
    }
  }

  async function handleUpdate(id: string, newText: string) {
    const { error } = await supabase
      .from('translations')
      .update({ translated_text: newText, approved: false })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation updated' });
      loadData();
    }
  }

  async function handleAddTranslation() {
    if (!newKey || !newText) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    // Add for English first
    const { error } = await supabase
      .from('translations')
      .insert({
        translation_key: newKey,
        language_code: 'en',
        translated_text: newText,
        approved: true,
        page_location: newPageLocation,
      });

    if (error) {
      toast({ title: 'Error adding translation', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Translation added successfully' });
      setNewKey('');
      setNewText('');
      setNewPageLocation('homepage');
      setIsAddDialogOpen(false);
      loadData();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Translation Manager</h2>
        <p className="text-muted-foreground mb-6">
          Manage translations across all languages. AI-translate, review, and approve content.
        </p>

        {/* Language Settings Section */}
        <Collapsible className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="mb-4">
              Language Settings
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <LanguageSettings />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Translation Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Translation Key</DialogTitle>
                <DialogDescription>
                  Create a new translation key with English text. Other languages can be AI-translated later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="key">Translation Key</Label>
                  <Input
                    id="key"
                    placeholder="e.g. hero.title"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="text">English Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter the English text..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Page Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. homepage, contact, pricing"
                    value={newPageLocation}
                    onChange={(e) => setNewPageLocation(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTranslation}>Add Translation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSyncKeys} 
            disabled={isSyncing}
            size="lg"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Translation Keys
              </>
            )}
          </Button>

          <Button 
            onClick={handleTranslateAll} 
            disabled={isTranslating}
            size="lg"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                AI Translate All Languages
              </>
            )}
          </Button>
        </div>

        {translationProgress && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{translationProgress}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat: any) => {
            const Flag = (Flags as any)[languages.find(l => l.code === stat.code)?.flag_code];
            return (
              <Card key={stat.code}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {Flag && <Flag className="w-6 h-4" />}
                    <span className="font-semibold">{stat.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.approved_translations}/{stat.total_translations}</div>
                  <div className="text-sm text-muted-foreground">{stat.approval_percentage}% approved</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Language Tabs */}
      <Tabs value={selectedLang} onValueChange={setSelectedLang}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((lang) => {
            const Flag = (Flags as any)[lang.flag_code];
            return (
              <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                {Flag && <Flag className="w-5 h-3" />}
                {lang.native_name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code}>
            <div className="mb-4">
              <Input
                placeholder="Search translation keys..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base font-mono">{translation.translation_key}</span>
                      <div className="flex gap-2">
                        {translation.approved ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending Review</Badge>
                        )}
                        <Badge variant="outline">{translation.page_location}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={translation.translated_text}
                      onChange={(e) => handleUpdate(translation.id, e.target.value)}
                      className="mb-2"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(translation.id)}
                        disabled={translation.approved}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReject(translation.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
