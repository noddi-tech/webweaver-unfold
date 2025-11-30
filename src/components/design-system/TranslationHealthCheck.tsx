import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface HealthCheckStats {
  brokenCount: number;
  missingCount: number;
  staleCount: number;
  orphanedCount: number;
  healthyCount: number;
  totalCount: number;
}

export default function TranslationHealthCheck() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [stats, setStats] = useState<HealthCheckStats>({
    brokenCount: 0,
    missingCount: 0,
    staleCount: 0,
    orphanedCount: 0,
    healthyCount: 0,
    totalCount: 0
  });
  const [progressInfo, setProgressInfo] = useState<{
    phase: 'idle' | 'cleaning' | 'translating' | 'done';
    currentLanguage: string;
    languageIndex: number;
    totalLanguages: number;
    deletedCount: number;
  } | null>(null);

  useEffect(() => {
    loadHealthStats();
  }, []);

  async function loadHealthStats() {
    setLoading(true);
    try {
      // Get all translations with pagination to bypass 1000 row limit
      let allTranslations: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('translations')
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allTranslations = [...allTranslations, ...data];
        page++;
        if (data.length < pageSize) break;
      }

      // Get English keys count
      const { count: englishCount, error: countError } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', 'en');

      if (countError) throw countError;

      // Get enabled languages count (excluding English)
      const { count: langCount, error: langError } = await supabase
        .from('languages')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true)
        .neq('code', 'en');

      if (langError) throw langError;

      const translations = allTranslations || [];
      const totalExpected = (englishCount || 0) * ((langCount || 0) + 1); // +1 for English

      // Count broken entries (where translated_text = translation_key)
      const broken = translations.filter(
        t => t.translated_text === t.translation_key && t.language_code !== 'en'
      ).length;

      // Count stale entries (is_stale = true, but NOT orphaned)
      // Get English keys with empty text to identify orphans (excluding intentionally empty)
      const englishEmptyKeys = new Set(
        translations.filter(t => 
          t.language_code === 'en' && 
          (!t.translated_text || t.translated_text.trim() === '') &&
          !t.is_intentionally_empty  // Only flag as orphan if NOT intentional
        ).map(t => t.translation_key)
      );
      
      const stale = translations.filter(
        t => t.is_stale === true && t.language_code !== 'en' && !englishEmptyKeys.has(t.translation_key)
      ).length;

      // Count orphaned entries (translations where English source is empty AND not intentionally empty)
      const orphaned = translations.filter(
        t => t.language_code !== 'en' && 
             englishEmptyKeys.has(t.translation_key) &&
             !t.is_intentionally_empty  // Exclude intentionally empty
      ).length;

      // Count missing entries per language
      const englishKeys = new Set(
        translations.filter(t => t.language_code === 'en').map(t => t.translation_key)
      );
      
      const { data: enabledLanguages } = await supabase
        .from('languages')
        .select('code')
        .eq('enabled', true)
        .neq('code', 'en');

      let missing = 0;
      for (const lang of enabledLanguages || []) {
        const langKeys = new Set(
          translations.filter(t => t.language_code === lang.code).map(t => t.translation_key)
        );
        missing += [...englishKeys].filter(k => !langKeys.has(k)).length;
      }

      // Count healthy entries including English (all English + non-broken/non-stale non-English + intentionally empty)
      const englishTranslations = translations.filter(t => t.language_code === 'en');
      const nonEnglish = translations.filter(t => t.language_code !== 'en');
      const healthyNonEnglish = nonEnglish.filter(t => 
        t.translated_text !== t.translation_key && // not broken
        !t.is_stale && // not stale
        (!englishEmptyKeys.has(t.translation_key) || t.is_intentionally_empty) // not orphaned OR intentionally empty
      ).length;
      const healthy = englishTranslations.length + healthyNonEnglish;

      setStats({
        brokenCount: broken,
        missingCount: missing,
        staleCount: stale,
        orphanedCount: orphaned,
        healthyCount: Math.max(0, healthy),
        totalCount: totalExpected
      });
    } catch (error: any) {
      console.error('Failed to load health stats:', error);
      toast({
        title: 'Failed to load health check',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleFixAll() {
    setFixing(true);
    setProgressInfo({ phase: 'cleaning', currentLanguage: '', languageIndex: 0, totalLanguages: 0, deletedCount: 0 });
    
    try {
      // Step 1: Delete broken entries with pagination
      let allBroken: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        const { data, error } = await supabase
          .from('translations')
          .select('id, translated_text, translation_key')
          .neq('language_code', 'en')
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        if (!data || data.length === 0) break;
        
        allBroken = [...allBroken, ...data];
        page++;
        if (data.length < pageSize) break;
      }

      const brokenIds = allBroken
        .filter(t => t.translated_text === t.translation_key)
        .map(t => t.id);

      if (brokenIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('translations')
          .delete()
          .in('id', brokenIds);

        if (deleteError) throw deleteError;
        
        setProgressInfo(prev => prev ? { ...prev, deletedCount: brokenIds.length } : null);
        toast({
          title: '🗑️ Broken entries cleaned',
          description: `Deleted ${brokenIds.length} broken translations`
        });
      }

      // Step 2: Query ONLY stale translations and group by language
      const { data: staleTranslations } = await supabase
        .from('translations')
        .select('translation_key, language_code')
        .eq('is_stale', true)
        .neq('language_code', 'en');

      // Group stale keys by language
      const staleByLanguage = new Map<string, string[]>();
      staleTranslations?.forEach(t => {
        const keys = staleByLanguage.get(t.language_code) || [];
        keys.push(t.translation_key);
        staleByLanguage.set(t.language_code, keys);
      });

      const totalStaleKeys = staleTranslations?.length || 0;

      if (staleByLanguage.size > 0) {
        const { data: languages } = await supabase
          .from('languages')
          .select('code, name')
          .in('code', Array.from(staleByLanguage.keys()));

        const languageMap = new Map(languages?.map(l => [l.code, l.name]) || []);

        toast({
          title: 'Fixing stale translations...',
          description: `Processing ${totalStaleKeys} stale translations across ${staleByLanguage.size} languages`,
          duration: 3000
        });

        let processedCount = 0;
        for (const [langCode, keys] of staleByLanguage) {
          processedCount++;
          const langName = languageMap.get(langCode) || langCode;
          
          setProgressInfo({
            phase: 'translating',
            currentLanguage: langName,
            languageIndex: processedCount,
            totalLanguages: staleByLanguage.size,
            deletedCount: brokenIds.length
          });

          const { error: translateError } = await supabase.functions.invoke('translate-content', {
            body: { 
              translationKeys: keys,  // Only stale keys for this language!
              targetLanguage: langCode,
              sourceLanguage: 'en'
            }
          });

          if (translateError) {
            console.error(`Translation failed for ${langCode}:`, translateError);
          } else {
            toast({
              title: `✅ ${langName} complete`,
              description: `Fixed ${keys.length} stale translations (${processedCount}/${staleByLanguage.size})`,
              duration: 2000
            });
          }
        }

        setProgressInfo({ phase: 'done', currentLanguage: '', languageIndex: staleByLanguage.size, totalLanguages: staleByLanguage.size, deletedCount: brokenIds.length });
        
        toast({
          title: '🎉 All stale translations fixed!',
          description: `Successfully processed ${totalStaleKeys} translations`,
          duration: 5000
        });
      } else {
        toast({
          title: 'No stale translations found',
          description: 'All translations are up to date!',
          duration: 3000
        });
      }

      // Reload stats
      await loadHealthStats();
    } catch (error: any) {
      console.error('Fix all failed:', error);
      toast({
        title: 'Fix process failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setFixing(false);
      setProgressInfo(null);
    }
  }

  async function handleRetranslateAll() {
    if (!confirm('⚠️ WARNING: This will re-translate ALL content for ALL enabled languages.\n\nThis will take several minutes and consume significant API credits.\n\nAre you sure you want to continue?')) {
      return;
    }

    setFixing(true);
    setProgressInfo({ phase: 'translating', currentLanguage: '', languageIndex: 0, totalLanguages: 0, deletedCount: 0 });
    
    try {
      const { data: languages } = await supabase
        .from('languages')
        .select('code, name')
        .eq('enabled', true)
        .neq('code', 'en');

      // Fetch all English translation keys
      const { data: englishKeys } = await supabase
        .from('translations')
        .select('translation_key')
        .eq('language_code', 'en');

      const translationKeys = englishKeys?.map(k => k.translation_key) || [];

      if (languages && languages.length > 0) {
        toast({
          title: 'Starting full re-translation...',
          description: `Processing ${languages.length} languages with ${translationKeys.length} keys`,
          duration: 3000
        });

        for (let i = 0; i < languages.length; i++) {
          const lang = languages[i];
          
          setProgressInfo({
            phase: 'translating',
            currentLanguage: lang.name,
            languageIndex: i + 1,
            totalLanguages: languages.length,
            deletedCount: 0
          });

          const { error: translateError } = await supabase.functions.invoke('translate-content', {
            body: { 
              translationKeys,
              targetLanguage: lang.code,
              sourceLanguage: 'en'
            }
          });

          if (translateError) {
            console.error(`Translation failed for ${lang.code}:`, translateError);
          } else {
            toast({
              title: `✅ ${lang.name} complete`,
              description: `${i + 1}/${languages.length} languages processed`,
              duration: 2000
            });
          }
        }

        setProgressInfo({ phase: 'done', currentLanguage: '', languageIndex: languages.length, totalLanguages: languages.length, deletedCount: 0 });
        
        toast({
          title: '🎉 Full re-translation complete!',
          description: `Successfully processed ${languages.length} languages`,
          duration: 5000
        });
      }

      // Reload stats
      await loadHealthStats();
    } catch (error: any) {
      console.error('Re-translate all failed:', error);
      toast({
        title: 'Re-translation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setFixing(false);
      setProgressInfo(null);
    }
  }

  const hasIssues = stats.brokenCount > 0 || stats.missingCount > 0 || stats.staleCount > 0 || stats.orphanedCount > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Translation Health Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Translation Health Check</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHealthStats}
          disabled={loading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasIssues && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Translation Issues Detected</AlertTitle>
            <AlertDescription>
              Your translation system has {stats.brokenCount + stats.missingCount + stats.staleCount + stats.orphanedCount} issues that need attention.
            </AlertDescription>
          </Alert>
        )}

        {!hasIssues && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle>All Systems Healthy</AlertTitle>
            <AlertDescription>
              Your translation system is working perfectly! All {stats.totalCount} translations are healthy.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <span className="text-sm font-medium">Broken</span>
            </div>
            <div className="text-3xl font-bold">{stats.brokenCount}</div>
            <p className="text-xs text-muted-foreground">
              Entries with key as text
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Missing</span>
            </div>
            <div className="text-3xl font-bold">{stats.missingCount}</div>
            <p className="text-xs text-muted-foreground">
              Keys not yet translated
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <span className="text-sm font-medium">Stale</span>
            </div>
            <div className="text-3xl font-bold">{stats.staleCount}</div>
            <p className="text-xs text-muted-foreground">
              Need re-translation
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Orphaned</span>
            </div>
            <div className="text-3xl font-bold">{stats.orphanedCount}</div>
            <p className="text-xs text-muted-foreground">
              Empty English source
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-sm font-medium">Healthy</span>
            </div>
            <div className="text-3xl font-bold">{stats.healthyCount}</div>
            <p className="text-xs text-muted-foreground">
              Properly translated
            </p>
          </div>
        </div>

        {fixing && progressInfo && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="font-medium">
                    {progressInfo.phase === 'cleaning' && `Cleaning ${progressInfo.deletedCount} broken entries...`}
                    {progressInfo.phase === 'translating' && `Translating ${progressInfo.currentLanguage}...`}
                    {progressInfo.phase === 'done' && 'Finalizing...'}
                  </span>
                </div>
                {progressInfo.phase === 'translating' && (
                  <>
                    <Progress value={(progressInfo.languageIndex / progressInfo.totalLanguages) * 100} />
                    <p className="text-sm text-muted-foreground">
                      {progressInfo.languageIndex} of {progressInfo.totalLanguages} languages
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {hasIssues && !fixing && (
          <div className="space-y-2">
            {stats.orphanedCount > 0 && (
              <Alert variant="default" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Orphaned Translations Detected</AlertTitle>
                <AlertDescription>
                  {stats.orphanedCount} translations have empty English source text and cannot be automatically fixed. 
                  Please add English content for these keys or delete them manually.
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleFixAll}
              disabled={fixing}
              className="w-full"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Fix All Issues ({stats.brokenCount + stats.staleCount} items)
            </Button>
            <Button
              onClick={handleRetranslateAll}
              disabled={fixing}
              variant="outline"
              className="w-full"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Re-translate All (Slow, ~5 min)
            </Button>
          </div>
        )}

        {!hasIssues && !fixing && (
          <Button
            onClick={handleRetranslateAll}
            disabled={fixing}
            variant="outline"
            className="w-full"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Re-translate All (Slow, ~5 min)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
