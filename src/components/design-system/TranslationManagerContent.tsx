import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Upload, Loader2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [approveAllLanguage, setApproveAllLanguage] = useState<string | null>(null);
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [pageLocationFilter, setPageLocationFilter] = useState<string>('all');
  const [contextFilter, setContextFilter] = useState<string>('all');

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

  // Get unique page locations and contexts for filter dropdowns
  const uniquePageLocations = Array.from(new Set(
    translations
      .filter(t => t.language_code === selectedLang)
      .map(t => t.page_location)
      .filter(Boolean)
  )).sort();

  const uniqueContexts = Array.from(new Set(
    translations
      .filter(t => t.language_code === selectedLang)
      .map(t => t.context)
      .filter(Boolean)
  )).sort();

  // Helper function to check for empty translations
  const hasEmptyTranslations = (languageCode: string): number => {
    return translations.filter(
      t => t.language_code === languageCode && 
           !t.approved && 
           (!t.translated_text || t.translated_text.trim() === '')
    ).length;
  };

  // Multi-filter logic
  const filteredTranslations = translations.filter(t => {
    // Language filter
    if (t.language_code !== selectedLang) return false;
    
    // Search filter
    if (searchFilter && !t.translation_key.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    
    // Empty translations filter
    if (showEmptyOnly && t.translated_text?.trim()) {
      return false;
    }
    
    // Page location filter
    if (pageLocationFilter !== 'all' && t.page_location !== pageLocationFilter) {
      return false;
    }
    
    // Context filter
    if (contextFilter !== 'all' && t.context !== contextFilter) {
      return false;
    }
    
    return true;
  });

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

  async function handleApproveAll(languageCode: string) {
    setIsApprovingAll(true);
    
    try {
      // Check for empty translations first
      const emptyCount = hasEmptyTranslations(languageCode);
      
      if (emptyCount > 0) {
        toast({
          title: `Cannot approve all translations`,
          description: `Found ${emptyCount} empty translation${emptyCount > 1 ? 's' : ''}. Please add content to all translations before approving.`,
          variant: 'destructive'
        });
        setApproveAllLanguage(null);
        setIsApprovingAll(false);
        return;
      }

      // Get count of unapproved translations
      const { count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', languageCode)
        .eq('approved', false);

      if (!count || count === 0) {
        toast({ title: 'All translations already approved' });
        setApproveAllLanguage(null);
        setIsApprovingAll(false);
        return;
      }

      // Batch approve all translations for this language
      const { error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('language_code', languageCode)
        .eq('approved', false);

      if (error) {
        toast({ 
          title: 'Error approving translations', 
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        const langName = languages.find(l => l.code === languageCode)?.name || languageCode;
        toast({ 
          title: 'All translations approved!', 
          description: `Approved ${count} ${langName} translations`
        });
        loadData();
      }
    } catch (error: any) {
      toast({ 
        title: 'Approval failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsApprovingAll(false);
      setApproveAllLanguage(null);
    }
  }

  async function handleSyncKeys() {
    setIsSyncing(true);
    
    try {
      // Get ALL English translations (the master set)
      const { data: englishKeys, error: englishError } = await supabase
        .from('translations')
        .select('translation_key, page_location, context')
        .eq('language_code', 'en');

      if (englishError || !englishKeys || englishKeys.length === 0) {
        toast({ title: 'No English translations found', variant: 'destructive' });
        setIsSyncing(false);
        return;
      }

      // Get enabled languages (except English)
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');
      
      if (targetLanguages.length === 0) {
        toast({ title: 'No target languages enabled', variant: 'destructive' });
        setIsSyncing(false);
        return;
      }

      let totalKeysCreated = 0;

      // Process each language
      for (let i = 0; i < targetLanguages.length; i++) {
        const lang = targetLanguages[i];
        setTranslationProgress(`Syncing ${lang.name} (${i + 1}/${targetLanguages.length})...`);

        // Fetch ALL existing translations for this language in one query
        const { data: existingTranslations } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', lang.code);

        // Create a Set for fast lookup of existing keys
        const existingKeys = new Set(
          existingTranslations?.map(t => t.translation_key) || []
        );

        // Find missing keys by comparing with English keys
        const missingKeys = englishKeys.filter(
          enKey => !existingKeys.has(enKey.translation_key)
        );

        // Batch insert all missing keys in one operation
        if (missingKeys.length > 0) {
          const newTranslations = missingKeys.map(enKey => ({
            translation_key: enKey.translation_key,
            language_code: lang.code,
            translated_text: enKey.translation_key, // Use key as placeholder
            approved: false,
            page_location: enKey.page_location,
            context: enKey.context,
          }));

          const { error: insertError } = await supabase
            .from('translations')
            .insert(newTranslations);

          if (insertError) {
            console.error(`Error inserting translations for ${lang.name}:`, insertError);
            toast({ 
              title: `Failed to sync ${lang.name}`, 
              description: insertError.message, 
              variant: 'destructive' 
            });
          } else {
            totalKeysCreated += missingKeys.length;
          }
        }
      }

      toast({ 
        title: 'Sync complete!', 
        description: `Created ${totalKeysCreated} placeholder translations across ${targetLanguages.length} languages`
      });
      loadData();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
      setTranslationProgress('');
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

      {/* Approve All Confirmation Dialog */}
      <AlertDialog open={approveAllLanguage !== null} onOpenChange={(open) => !open && setApproveAllLanguage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve all translations?</AlertDialogTitle>
            <AlertDialogDescription>
              {approveAllLanguage && (() => {
                const lang = languages.find(l => l.code === approveAllLanguage);
                const stat = stats.find(s => s.code === approveAllLanguage);
                const unapprovedCount = stat ? stat.total_translations - stat.approved_translations : 0;
                const Flag = lang ? (Flags as any)[lang.flag_code] : null;
                
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {Flag && <Flag className="w-6 h-4" />}
                      <span className="font-semibold">{lang?.name}</span>
                    </div>
                    <p>
                      This will mark <strong>{unapprovedCount} translation{unapprovedCount !== 1 ? 's' : ''}</strong> as approved. 
                      You can still edit them later if needed.
                    </p>
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApprovingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => approveAllLanguage && handleApproveAll(approveAllLanguage)}
              disabled={isApprovingAll}
            >
              {isApprovingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

        {languages.map((lang) => {
          const langStat = stats.find(s => s.code === lang.code);
          const unapprovedCount = langStat ? langStat.total_translations - langStat.approved_translations : 0;
          const emptyCount = hasEmptyTranslations(lang.code);
          
          return (
            <TabsContent key={lang.code} value={lang.code}>
              <div className="mb-4 space-y-3">
                {/* Search and Approve All Row */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search translation keys..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="flex-1"
                  />
                  {unapprovedCount > 0 && (
                    <Button 
                      variant={emptyCount > 0 ? "destructive" : "outline"}
                      onClick={() => setApproveAllLanguage(lang.code)}
                      disabled={isApprovingAll || emptyCount > 0}
                    >
                      {emptyCount > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          {emptyCount} Empty
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Approve All ({unapprovedCount})
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Filter Options Row */}
                <div className="flex gap-2 flex-wrap">
                  {/* Show Empty Toggle */}
                  <Button
                    variant={showEmptyOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEmptyOnly(!showEmptyOnly)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {showEmptyOnly ? "Show All" : "Show Empty Only"}
                  </Button>

                  {/* Page Location Filter */}
                  <Select value={pageLocationFilter} onValueChange={setPageLocationFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Filter by page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      {uniquePageLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Context Filter */}
                  {uniqueContexts.length > 0 && (
                    <Select value={contextFilter} onValueChange={setContextFilter}>
                      <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Filter by component" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Components</SelectItem>
                        {uniqueContexts.map(context => (
                          <SelectItem key={context} value={context}>
                            {context}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Active Filters Count */}
                  {(showEmptyOnly || pageLocationFilter !== 'all' || contextFilter !== 'all') && (
                    <Badge variant="secondary" className="h-9 px-3 flex items-center">
                      {filteredTranslations.length} result{filteredTranslations.length !== 1 ? 's' : ''}
                    </Badge>
                  )}

                  {/* Clear Filters */}
                  {(showEmptyOnly || pageLocationFilter !== 'all' || contextFilter !== 'all' || searchFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowEmptyOnly(false);
                        setPageLocationFilter('all');
                        setContextFilter('all');
                        setSearchFilter('');
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
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
                      className={cn(
                        "mb-2",
                        !translation.translated_text?.trim() && "border-destructive border-2"
                      )}
                      rows={3}
                    />
                    {!translation.translated_text?.trim() && (
                      <p className="text-sm text-destructive flex items-center gap-1 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        Translation text is empty - please add content before approving
                      </p>
                    )}
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
          );
        })}
      </Tabs>
    </div>
  );
}
