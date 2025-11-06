import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import * as Flags from 'country-flag-icons/react/3x2';
import { Check, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LanguageStatsTableProps {
  stats: any[];
  pageMetaStats: any[];
  evaluationProgress: any[];
  englishCount: number;
  lastUpdated?: Date;
  onToggleSwitcher?: (languageCode: string, languageName: string, currentValue: boolean) => void;
  onRefresh?: () => void;
}

export default function LanguageStatsTable({
  stats,
  pageMetaStats,
  evaluationProgress,
  englishCount,
  lastUpdated,
  onToggleSwitcher,
  onRefresh
}: LanguageStatsTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Language-by-Language Status</CardTitle>
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          {onRefresh && (
            <Button onClick={onRefresh} variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          )}
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
                <th className="pb-3 font-medium">Show in Switcher</th>
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
                        <span className="font-mono">{lang.total_translations}/{englishCount}</span>
                        {translationComplete && <Check className="w-4 h-4 text-success" />}
                      </div>
                    </td>
                    <td className="py-3">
                      {lang.code === 'en' ? (
                        <span className="text-muted-foreground">N/A</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{progress?.evaluated_keys || 0}/{englishCount}</span>
                          {evaluationComplete && <Check className="w-4 h-4 text-success" />}
                          {progress?.status === 'in_progress' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                          {progress?.status === 'paused' && <AlertTriangle className="w-4 h-4 text-warning" />}
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
                      <span className="font-mono">{lang.approved_translations || 0}/{englishCount}</span>
                    </td>
                    <td className="py-3">
                      {metaStat ? (
                        <div className="flex items-center gap-2">
                          <span>{metaStat.completed_entries}/{metaStat.total_pages}</span>
                          {metaStat.completed_entries === metaStat.total_pages && 
                            <Check className="w-4 h-4 text-success" />
                          }
                        </div>
                      ) : (
                        <span className="text-muted-foreground">0/0</span>
                      )}
                    </td>
                    <td className="py-3">
                      {onToggleSwitcher ? (
                        <Switch
                          checked={lang.show_in_switcher ?? true}
                          onCheckedChange={() => onToggleSwitcher(lang.code, lang.name, lang.show_in_switcher ?? true)}
                        />
                      ) : (
                        <span className="text-muted-foreground">{lang.show_in_switcher ? 'Yes' : 'No'}</span>
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
  );
}
