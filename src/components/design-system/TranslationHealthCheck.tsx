import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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

  useEffect(() => {
    loadHealthStats();
  }, []);

  async function loadHealthStats() {
    setLoading(true);
    try {
      // Get all translations
      const { data: allTranslations, error: transError } = await supabase
        .from('translations')
        .select('*');

      if (transError) throw transError;

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

      // Count missing entries
      const actualCount = translations.length;
      const missing = Math.max(0, totalExpected - actualCount - broken);

      // Count healthy entries (not broken, not stale, not missing)
      const healthy = actualCount - broken - stale;

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
    try {
      // Step 1: Delete broken entries
      const { error: deleteError } = await supabase
        .from('translations')
        .delete()
        .eq('language_code', 'en')
        .neq('language_code', 'en') // This ensures we're only targeting non-English
        .filter('translated_text', 'eq', 'translation_key');

      if (deleteError) throw deleteError;

      toast({
        title: 'Broken entries cleaned up!',
        description: `Removed ${stats.brokenCount} broken translations`
      });

      // Step 2: Trigger translation for all enabled languages
      const { data: languages } = await supabase
        .from('languages')
        .select('code, name')
        .eq('enabled', true)
        .neq('code', 'en');

      if (languages && languages.length > 0) {
        toast({
          title: 'Triggering translations...',
          description: `Starting translation for ${languages.length} languages`,
          duration: 3000
        });

        for (const lang of languages) {
          const { error: translateError } = await supabase.functions.invoke('translate-content', {
            body: { targetLanguage: lang.code }
          });

          if (translateError) {
            console.error(`Translation failed for ${lang.code}:`, translateError);
          }
        }

        toast({
          title: 'Translation process started!',
          description: 'Check the Translation Manager for progress',
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

        {hasIssues && (
          <Button
            onClick={handleFixAll}
            disabled={fixing}
            className="w-full"
          >
            {fixing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Fixing Issues...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Fix All Issues
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
