import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WizardStats {
  // English source health
  englishTotalKeys: number;
  englishActualKeys: number;
  englishEmptyKeys: number;
  englishComplete: boolean;
  
  // Sync status
  totalLanguages: number;
  totalExpectedRows: number;
  totalActualRows: number;
  missingSyncRows: number;
  syncComplete: boolean;
  
  // Translation status
  totalTranslated: number;
  totalEmpty: number;
  translationComplete: boolean;
  
  // Evaluation status
  totalEvaluated: number;
  totalNeedEvaluation: number;
  avgQualityScore: number;
  evaluationComplete: boolean;
  
  // Approval status
  totalApproved: number;
  totalNeedApproval: number;
  approvalComplete: boolean;
  
  // Per-language stats
  languageStats: LanguageStat[];
}

export interface LanguageStat {
  code: string;
  name: string;
  enabled: boolean;
  showInSwitcher: boolean;
  totalRows: number;
  actualTranslations: number;
  emptyCount: number;
  staleCount: number;
  evaluatedCount: number;
  approvedCount: number;
  avgQualityScore: number | null;
  missingRows: number;
}

export function useWizardStats() {
  const [stats, setStats] = useState<WizardStats>({
    englishTotalKeys: 0,
    englishActualKeys: 0,
    englishEmptyKeys: 0,
    englishComplete: false,
    totalLanguages: 0,
    totalExpectedRows: 0,
    totalActualRows: 0,
    missingSyncRows: 0,
    syncComplete: false,
    totalTranslated: 0,
    totalEmpty: 0,
    translationComplete: false,
    totalEvaluated: 0,
    totalNeedEvaluation: 0,
    avgQualityScore: 0,
    evaluationComplete: false,
    totalApproved: 0,
    totalNeedApproval: 0,
    approvalComplete: false,
    languageStats: [],
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch from live_translation_stats view - cast to any to bypass strict typing
      const { data, error } = await supabase
        .from('live_translation_stats' as any)
        .select('*');

      const liveStats = data as any[] | null;

      if (error) {
        console.error('Failed to load live stats, falling back to queries:', error);
        // Fallback to direct queries if view doesn't exist yet
        await loadStatsFallback();
        return;
      }

      if (!liveStats || liveStats.length === 0) {
        await loadStatsFallback();
        return;
      }

      // Get English stats
      const englishStats = liveStats.find((s: any) => s.code === 'en');
      const nonEnglishStats = liveStats.filter((s: any) => s.code !== 'en');

      const englishTotalKeys = englishStats?.english_key_count || 0;
      const englishActualKeys = englishStats?.actual_translations || 0;
      const englishEmptyKeys = englishTotalKeys - englishActualKeys;

      // Calculate totals for non-English languages
      const totalLanguages = nonEnglishStats.length;
      const totalExpectedRows = englishTotalKeys * totalLanguages;
      const totalActualRows = nonEnglishStats.reduce((sum: number, s: any) => sum + (s.total_rows || 0), 0);
      const missingSyncRows = totalExpectedRows - totalActualRows;

      const totalTranslated = nonEnglishStats.reduce((sum: number, s: any) => sum + (s.actual_translations || 0), 0);
      const totalEmpty = nonEnglishStats.reduce((sum: number, s: any) => sum + (s.empty_count || 0), 0);

      const totalEvaluated = nonEnglishStats.reduce((sum: number, s: any) => sum + (s.evaluated_count || 0), 0);
      const totalNeedEvaluation = totalTranslated - totalEvaluated;

      const totalApproved = nonEnglishStats.reduce((sum: number, s: any) => sum + (s.approved_count || 0), 0);
      
      // Calculate weighted average quality score
      const qualityScores = nonEnglishStats
        .filter((s: any) => s.avg_quality_score != null)
        .map((s: any) => s.avg_quality_score);
      const avgQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((a: number, b: number) => a + b, 0) / qualityScores.length
        : 0;

      // Map to language stats
      const languageStats: LanguageStat[] = liveStats.map((s: any) => ({
        code: s.code,
        name: s.name,
        enabled: s.enabled,
        showInSwitcher: s.show_in_switcher,
        totalRows: s.total_rows || 0,
        actualTranslations: s.actual_translations || 0,
        emptyCount: s.empty_count || 0,
        staleCount: s.stale_count || 0,
        evaluatedCount: s.evaluated_count || 0,
        approvedCount: s.approved_count || 0,
        avgQualityScore: s.avg_quality_score,
        missingRows: s.missing_rows || 0,
      }));

      setStats({
        englishTotalKeys,
        englishActualKeys,
        englishEmptyKeys,
        englishComplete: englishEmptyKeys === 0,
        totalLanguages,
        totalExpectedRows,
        totalActualRows,
        missingSyncRows,
        syncComplete: missingSyncRows === 0,
        totalTranslated,
        totalEmpty,
        translationComplete: totalEmpty === 0 && totalTranslated > 0,
        totalEvaluated,
        totalNeedEvaluation,
        avgQualityScore,
        evaluationComplete: totalNeedEvaluation === 0 && totalTranslated > 0,
        totalApproved,
        totalNeedApproval: totalTranslated - totalApproved,
        approvalComplete: totalApproved >= totalTranslated * 0.8, // 80% approval threshold
        languageStats,
      });
    } catch (error) {
      console.error('Error loading wizard stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatsFallback = async () => {
    // Fallback implementation using direct queries
    const [
      { count: englishCount },
      { count: langCount },
      { data: translationCounts }
    ] = await Promise.all([
      supabase.from('translations').select('*', { count: 'exact', head: true }).eq('language_code', 'en'),
      supabase.from('languages').select('*', { count: 'exact', head: true }).eq('enabled', true).neq('code', 'en'),
      supabase.from('translations').select('language_code, translated_text, quality_score, approved')
    ]);

    const englishTotalKeys = englishCount || 0;
    const totalLanguages = langCount || 0;

    // Count English empty keys
    const { count: englishEmptyCount } = await supabase
      .from('translations')
      .select('*', { count: 'exact', head: true })
      .eq('language_code', 'en')
      .or('translated_text.is.null,translated_text.eq.');

    const englishEmptyKeys = englishEmptyCount || 0;
    const englishActualKeys = englishTotalKeys - englishEmptyKeys;

    setStats(prev => ({
      ...prev,
      englishTotalKeys,
      englishActualKeys,
      englishEmptyKeys,
      englishComplete: englishEmptyKeys === 0,
      totalLanguages,
      languageStats: [],
    }));
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    refresh: loadStats,
  };
}
