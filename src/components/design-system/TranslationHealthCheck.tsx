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

      // Count stale entries (is_stale = true)
      const stale = translations.filter(
        t => t.is_stale === true && t.language_code !== 'en'
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

      // Count healthy entries (non-English translations that are NOT broken AND NOT stale)
      const nonEnglish = translations.filter(t => t.language_code !== 'en');
      const healthy = nonEnglish.filter(t => 
        t.translated_text !== t.translation_key && // not broken
        !t.is_stale // not stale
      ).length;

      setStats({
        brokenCount: broken,
        missingCount: missing,
        staleCount: stale,
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

      // Step 2: Trigger translation for all enabled languages
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
          title: 'Starting translations...',
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
            deletedCount: brokenIds.length
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

        setProgressInfo({ phase: 'done', currentLanguage: '', languageIndex: languages.length, totalLanguages: languages.length, deletedCount: brokenIds.length });
        
        toast({
          title: '🎉 All translations complete!',
          description: `Successfully processed ${languages.length} languages`,
          duration: 5000
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

  const hasIssues = stats.brokenCount > 0 || stats.missingCount > 0 || stats.staleCount > 0;

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
              Your translation system has {stats.brokenCount + stats.missingCount + stats.staleCount} issues that need attention.
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <Button
            onClick={handleFixAll}
            disabled={fixing}
            className="w-full"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Fix All Issues
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
