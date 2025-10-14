import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as Flags from 'country-flag-icons/react/3x2';
import { Check, X, AlertTriangle, Loader2, RefreshCw, Sparkles, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UnifiedDashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [pageMetaStats, setPageMetaStats] = useState<any[]>([]);
  const [evaluationProgress, setEvaluationProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [
      { data: translationStats },
      { data: metaStats },
      { data: evalProgress },
      { data: allTranslations }
    ] = await Promise.all([
      supabase.from('translation_stats' as any).select('*'),
      supabase.from('page_meta_stats' as any).select('*'),
      supabase.from('evaluation_progress').select('*'),
      supabase.from('translations').select('language_code, quality_score').neq('language_code', 'en')
    ]);

    if (translationStats) setStats(translationStats);
    if (metaStats) setPageMetaStats(metaStats);
    
    // Calculate actual evaluated counts from translations with quality_score
    const evaluatedCountsMap: Record<string, number> = {};
    if (allTranslations) {
      allTranslations.forEach(t => {
        if (t.quality_score !== null) {
          evaluatedCountsMap[t.language_code] = (evaluatedCountsMap[t.language_code] || 0) + 1;
        }
      });
    }
    
    // Update evaluation progress with actual counts from database
    if (evalProgress) {
      const updatedEvalProgress = evalProgress.map(ep => ({
        ...ep,
        evaluated_keys: evaluatedCountsMap[ep.language_code] || 0
      }));
      
      setEvaluationProgress(updatedEvalProgress);
    }
    
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Calculate global stats - use English as baseline
  const totalLanguages = stats.filter(s => s.enabled).length;
  const englishCount = stats.find(s => s.code === 'en')?.total_translations || 0;
  const totalTranslationKeys = englishCount;
  const totalTranslations = totalLanguages * englishCount;
  
  const totalEvaluated = stats.reduce((sum, s) => {
    const progress = evaluationProgress.find(ep => ep.language_code === s.code);
    return sum + (progress?.evaluated_keys || 0);
  }, 0);
  
  const totalApproved = stats.reduce((sum, s) => sum + (s.approved_translations || 0), 0);
  
  const totalPageMetaRequired = pageMetaStats.reduce((sum, s) => 
    sum + (s.total_pages || 0), 0
  );
  const totalPageMetaCompleted = pageMetaStats.reduce((sum, s) => 
    sum + (s.completed_entries || 0), 0
  );

  const translationCompletionRate = Math.round((totalTranslations / (totalLanguages * totalTranslationKeys)) * 100) || 0;
  const evaluationCompletionRate = Math.round((totalEvaluated / totalTranslations) * 100) || 0;
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
              {totalTranslations} / {totalLanguages * totalTranslationKeys} keys translated
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
              {totalEvaluated} / {totalTranslations} evaluated
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
              {Math.round((totalApproved / totalTranslations) * 100)}%
            </div>
            <Progress value={(totalApproved / totalTranslations) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {totalApproved} / {totalTranslations} approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Language-by-Language Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Language-by-Language Status</CardTitle>
            <Button onClick={loadData} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Language</th>
                  <th className="pb-3 font-medium">Translations</th>
                  <th className="pb-3 font-medium">Evaluated</th>
                  <th className="pb-3 font-medium">Quality</th>
                  <th className="pb-3 font-medium">Approved</th>
                  <th className="pb-3 font-medium">Page Meta</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.map((lang) => {
                  const Flag = (Flags as any)[lang.code === 'en' ? 'US' : lang.code === 'ja' ? 'JP' : lang.code === 'zh' ? 'CN' : lang.code === 'ko' ? 'KR' : lang.code === 'ar' ? 'SA' : lang.code === 'he' ? 'IL' : lang.code.toUpperCase()];
                  const progress = evaluationProgress.find(ep => ep.language_code === lang.code);
                  const metaStat = pageMetaStats.find(m => m.code === lang.code);
                  
                  const translationComplete = lang.total_translations === englishCount;
                  const evaluationComplete = progress?.evaluated_keys === lang.total_translations;
                  const hasPageMeta = metaStat && metaStat.completed_entries > 0;
                  
                  return (
                    <tr key={lang.code} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {Flag && <Flag className="w-6 h-4" />}
                          <span className="font-medium">{lang.name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{lang.total_translations}/{englishCount}</span>
                          {translationComplete && <Check className="w-4 h-4 text-green-600" />}
                        </div>
                      </td>
                      <td className="py-3">
                        {lang.code === 'en' ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>{progress?.evaluated_keys || 0}/{englishCount}</span>
                            {evaluationComplete && <Check className="w-4 h-4 text-green-600" />}
                            {progress?.status === 'in_progress' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        {lang.code === 'en' ? (
                          <span className="text-muted-foreground">N/A</span>
                        ) : lang.avg_quality_score ? (
                          <Badge variant={
                            lang.avg_quality_score >= 85 ? "default" :
                            lang.avg_quality_score >= 70 ? "secondary" :
                            "destructive"
                          }>
                            {lang.avg_quality_score}%
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span>{lang.approved_translations || 0}/{englishCount}</span>
                      </td>
                      <td className="py-3">
                        {metaStat ? (
                          <div className="flex items-center gap-2">
                            <span>{metaStat.completed_entries}/{metaStat.total_pages}</span>
                            {metaStat.completed_entries === metaStat.total_pages && 
                              <Check className="w-4 h-4 text-green-600" />
                            }
                          </div>
                        ) : (
                          <span className="text-muted-foreground">0/0</span>
                        )}
                      </td>
                      <td className="py-3">
                        {translationComplete && (evaluationComplete || lang.code === 'en') && hasPageMeta ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="w-3 h-3" />
                            Complete
                          </Badge>
                        ) : progress?.status === 'in_progress' ? (
                          <Badge variant="secondary" className="gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Processing
                          </Badge>
                        ) : !hasPageMeta ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            No Meta
                          </Badge>
                        ) : (
                          <Badge variant="secondary">In Progress</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
