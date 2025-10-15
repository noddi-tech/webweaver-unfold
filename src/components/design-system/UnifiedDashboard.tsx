import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useTranslationStats } from '@/hooks/useTranslationStats';
import { Loader2 } from 'lucide-react';
import LanguageStatsTable from './LanguageStatsTable';

export default function UnifiedDashboard() {
  const { toast } = useToast();
  const { stats, pageMetaStats, evaluationProgress, loading, lastUpdated, refresh } = useTranslationStats();

  async function handleToggleSwitcher(languageCode: string, languageName: string, currentValue: boolean) {
    const newValue = !currentValue;

    const { error } = await supabase
      .from('languages')
      .update({ show_in_switcher: newValue })
      .eq('code', languageCode);

    if (error) {
      toast({
        title: 'Error updating language',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Language visibility updated',
        description: `${languageName} ${newValue ? 'will show' : 'is hidden'} in language switcher`,
      });
      // Refresh data after update
      refresh();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate global stats - use ACTUAL data from stats, not theoretical calculations
  const totalLanguages = stats.filter(s => s.enabled && s.code !== 'en').length;
  const englishCount = stats.find(s => s.code === 'en')?.total_translations || 0;
  
  // ✓ Use actual sum from database instead of theoretical calculation
  const actualTotalTranslations = stats.reduce((sum, s) => sum + s.total_translations, 0);
  const expectedTotalTranslations = (totalLanguages + 1) * englishCount;
  
  // Only count evaluation for non-English languages
  const totalEvaluated = stats
    .filter(s => s.code !== 'en')
    .reduce((sum, s) => {
      const progress = evaluationProgress.find(ep => ep.language_code === s.code);
      return sum + (progress?.evaluated_keys || 0);
    }, 0);
  
  const totalEvaluationRequired = totalLanguages * englishCount;
  
  const totalApproved = stats.reduce((sum, s) => sum + (s.approved_translations || 0), 0);
  
  const totalPageMetaRequired = pageMetaStats.reduce((sum, s) => 
    sum + (s.total_pages || 0), 0
  );
  const totalPageMetaCompleted = pageMetaStats.reduce((sum, s) => 
    sum + (s.completed_entries || 0), 0
  );

  // ✓ Fix completion rate to compare actual vs expected
  const translationCompletionRate = Math.round((actualTotalTranslations / expectedTotalTranslations) * 100) || 0;
  const evaluationCompletionRate = Math.round((totalEvaluated / totalEvaluationRequired) * 100) || 0;
  const pageMetaCompletionRate = Math.round((totalPageMetaCompleted / totalPageMetaRequired) * 100) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Translation & SEO Overview</h2>
        <p className="text-muted-foreground">
          Complete system status across all languages
        </p>
      </div>

      {/* Global Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Translation Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{translationCompletionRate}%</div>
            <Progress value={translationCompletionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {actualTotalTranslations} / {expectedTotalTranslations} keys translated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Evaluation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{evaluationCompletionRate}%</div>
            <Progress value={evaluationCompletionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalEvaluated} / {totalEvaluationRequired} evaluated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Page Meta Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{pageMetaCompletionRate}%</div>
            <Progress value={pageMetaCompletionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalPageMetaCompleted} / {totalPageMetaRequired} entries created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {Math.round((totalApproved / actualTotalTranslations) * 100)}%
            </div>
            <Progress value={(totalApproved / actualTotalTranslations) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalApproved} / {actualTotalTranslations} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language-by-Language Breakdown */}
      <LanguageStatsTable
        stats={stats}
        pageMetaStats={pageMetaStats}
        evaluationProgress={evaluationProgress}
        englishCount={englishCount}
        lastUpdated={lastUpdated}
        onToggleSwitcher={handleToggleSwitcher}
        onRefresh={refresh}
      />
    </div>
  );
}
