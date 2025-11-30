import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TranslationStat {
  code: string;
  name: string;
  enabled: boolean;
  sort_order: number;
  total_translations: number;
  approved_translations: number;
  approval_percentage: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  needs_review_count: number;
  show_in_switcher?: boolean;
}

export function useTranslationStats() {
  const [stats, setStats] = useState<TranslationStat[]>([]);
  const [pageMetaStats, setPageMetaStats] = useState<any[]>([]);
  const [evaluationProgress, setEvaluationProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    setLoading(true);
    const startTime = Date.now();
    
    const [
      { data: translationStats },
      { data: metaStats },
      { data: evalProgress },
      { data: languages },
      { data: actualEvaluated }
    ] = await Promise.all([
      supabase.from('translation_stats' as any).select('*'),
      supabase.from('page_meta_stats' as any).select('*'),
      supabase.from('evaluation_progress').select('*'),
      supabase.from('languages').select('code, show_in_switcher'),
      // Query actual evaluated count: translations with quality_score IS NOT NULL
      supabase
        .from('translations')
        .select('language_code')
        .not('quality_score', 'is', null)
        .neq('language_code', 'en')
    ]);

    // Group actual evaluated counts by language
    const evaluatedByLanguage: Record<string, number> = {};
    if (actualEvaluated && Array.isArray(actualEvaluated)) {
      actualEvaluated.forEach((t: any) => {
        evaluatedByLanguage[t.language_code] = (evaluatedByLanguage[t.language_code] || 0) + 1;
      });
    }

    // Merge show_in_switcher and actual evaluated counts into stats
    if (translationStats && Array.isArray(translationStats) && languages) {
      const enrichedStats = (translationStats as any[]).map((stat: any) => ({
        ...stat,
        show_in_switcher: languages.find((l: any) => l.code === stat.code)?.show_in_switcher ?? true,
        actual_evaluated_count: evaluatedByLanguage[stat.code] || 0
      }));
      setStats(enrichedStats);
      console.log('[useTranslationStats] Loaded stats:', {
        timestamp: new Date().toISOString(),
        loadTime: `${Date.now() - startTime}ms`,
        languages: enrichedStats.length,
        evaluatedCounts: evaluatedByLanguage,
        sampleData: enrichedStats.slice(0, 2)
      });
    } else if (translationStats && Array.isArray(translationStats)) {
      setStats(translationStats as any);
    }
    
    if (metaStats) setPageMetaStats(metaStats);
    if (evalProgress) setEvaluationProgress(evalProgress);
    
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription to translations table
  useEffect(() => {
    const channel = supabase
      .channel('translation-stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'translations'
        },
        () => {
          console.log('[useTranslationStats] Real-time update detected, refreshing stats...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  return {
    stats,
    pageMetaStats,
    evaluationProgress,
    loading,
    lastUpdated,
    refresh: loadData
  };
}
