import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle2, AlertCircle, Loader2, ThumbsUp, Eye, EyeOff, Star } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WizardStats, LanguageStat } from '@/hooks/useWizardStats';

interface WizardStepApproveProps {
  stats: WizardStats;
  onComplete: () => void;
}

export default function WizardStepApprove({ stats, onComplete }: WizardStepApproveProps) {
  const { toast } = useToast();
  const [approving, setApproving] = useState(false);
  const [progress, setProgress] = useState(0);

  // Filter to non-English languages
  const nonEnglishLanguages = stats.languageStats
    .filter(l => l.code !== 'en')
    .sort((a, b) => (b.approvedCount / Math.max(b.actualTranslations, 1)) - (a.approvedCount / Math.max(a.actualTranslations, 1)));

  const overallApprovalRate = stats.totalTranslated > 0
    ? Math.round((stats.totalApproved / stats.totalTranslated) * 100)
    : 0;

  const handleAutoApproveHighQuality = async () => {
    setApproving(true);
    setProgress(0);

    try {
      // Approve all translations with quality_score >= 85
      const { data, error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          review_status: 'approved'
        })
        .neq('language_code', 'en')
        .gte('quality_score', 85)
        .eq('approved', false)
        .select('id');

      if (error) throw error;

      const count = data?.length || 0;
      
      toast({
        title: '✅ Auto-Approval Complete',
        description: `Approved ${count} high-quality translations (≥85% score)`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Auto-approval failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setApproving(false);
    }
  };

  const handleToggleVisibility = async (langCode: string, langName: string, currentValue: boolean) => {
    const newValue = !currentValue;
    
    const { error } = await supabase
      .from('languages')
      .update({ show_in_switcher: newValue })
      .eq('code', langCode);

    if (error) {
      toast({
        title: 'Error updating visibility',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Visibility updated',
        description: `${langName} is now ${newValue ? 'visible' : 'hidden'} in language switcher`,
      });
      onComplete();
    }
  };

  const handleApproveLanguage = async (langCode: string, langName: string) => {
    try {
      // Approve all translations for this language
      const { data, error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          review_status: 'approved'
        })
        .eq('language_code', langCode)
        .eq('approved', false)
        .select('id');

      if (error) throw error;

      toast({
        title: `✅ ${langName} Approved`,
        description: `${data?.length || 0} translations approved`,
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {stats.approvalComplete ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Approval Complete!</AlertTitle>
          <AlertDescription>
            {overallApprovalRate}% of translations are approved. Your multi-language site is ready!
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Review & Approve Translations</AlertTitle>
          <AlertDescription>
            {stats.totalApproved.toLocaleString()}/{stats.totalTranslated.toLocaleString()} translations approved ({overallApprovalRate}%).
            Approve high-quality translations and manage language visibility.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Approval Rate</span>
          <span>{overallApprovalRate}%</span>
        </div>
        <Progress value={overallApprovalRate} className="h-3" />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button
          onClick={handleAutoApproveHighQuality}
          disabled={approving}
          className="flex-1"
          size="lg"
        >
          {approving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ThumbsUp className="w-4 h-4 mr-2" />
          )}
          Auto-Approve High Quality (≥85%)
        </Button>
      </div>

      {/* Language Cards */}
      <div className="space-y-4">
        <h4 className="font-medium">Language Status & Visibility</h4>
        
        <div className="grid gap-3">
          {nonEnglishLanguages.map(lang => {
            const Flag = (Flags as any)[lang.code.toUpperCase()];
            const approvalRate = lang.actualTranslations > 0
              ? Math.round((lang.approvedCount / lang.actualTranslations) * 100)
              : 0;
            const isReady = approvalRate >= 80 && lang.avgQualityScore && lang.avgQualityScore >= 70;
            
            return (
              <div
                key={lang.code}
                className="p-4 rounded-lg border bg-card flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {Flag && <Flag className="w-8 h-5" />}
                  <div>
                    <p className="font-medium">{lang.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{lang.approvedCount}/{lang.actualTranslations} approved</span>
                      {lang.avgQualityScore && (
                        <Badge variant={
                          lang.avgQualityScore >= 85 ? 'default' :
                          lang.avgQualityScore >= 70 ? 'secondary' : 'destructive'
                        } className="text-xs gap-1">
                          <Star className="w-3 h-3" />
                          {Math.round(lang.avgQualityScore)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Approve All Button */}
                  {lang.approvedCount < lang.actualTranslations && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApproveLanguage(lang.code, lang.name)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Approve All
                    </Button>
                  )}

                  {/* Visibility Toggle */}
                  <div className="flex items-center gap-2">
                    {lang.showInSwitcher ? (
                      <Eye className="w-4 h-4 text-success" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={lang.showInSwitcher}
                      onCheckedChange={() => handleToggleVisibility(lang.code, lang.name, lang.showInSwitcher)}
                    />
                  </div>

                  {/* Status Badge */}
                  {isReady ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      In Progress
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
