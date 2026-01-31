import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Loader2, Shield, Star } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WizardStats, LanguageStat } from '@/hooks/useWizardStats';

interface WizardStepEvaluateProps {
  stats: WizardStats;
  onComplete: () => void;
}

export default function WizardStepEvaluate({ stats, onComplete }: WizardStepEvaluateProps) {
  const { toast } = useToast();
  const [evaluating, setEvaluating] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Filter to non-English languages that need evaluation
  const languagesNeedingEvaluation = stats.languageStats
    .filter(l => l.code !== 'en' && l.actualTranslations > l.evaluatedCount)
    .sort((a, b) => (b.actualTranslations - b.evaluatedCount) - (a.actualTranslations - a.evaluatedCount));

  const overallProgress = stats.totalTranslated > 0
    ? Math.round((stats.totalEvaluated / stats.totalTranslated) * 100)
    : 0;

  const handleSelectAll = () => {
    if (selectedLanguages.length === languagesNeedingEvaluation.length) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages(languagesNeedingEvaluation.map(l => l.code));
    }
  };

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleEvaluateSelected = async () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: 'No languages selected',
        description: 'Please select at least one language to evaluate',
        variant: 'destructive',
      });
      return;
    }

    setEvaluating(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedLanguages.length; i++) {
        const langCode = selectedLanguages[i];
        const langStat = stats.languageStats.find(l => l.code === langCode);
        setCurrentLanguage(langStat?.name || langCode);

        toast({
          title: `Evaluating ${langStat?.name}...`,
          description: 'This may take a few minutes',
          duration: 3000,
        });

        const { error: evalError } = await supabase.functions.invoke('evaluate-translation-quality', {
          body: {
            languageCode: langCode,
            batchSize: 50,
          },
        });

        if (evalError) {
          console.error(`Evaluation failed for ${langCode}:`, evalError);
          toast({
            title: `⚠️ ${langStat?.name} evaluation issue`,
            description: evalError.message,
            variant: 'destructive',
            duration: 3000,
          });
        } else {
          toast({
            title: `✅ ${langStat?.name} evaluated`,
            description: `Quality scores assigned`,
            duration: 2000,
          });
        }

        setProgress(Math.round(((i + 1) / selectedLanguages.length) * 100));
      }

      toast({
        title: '🎉 Evaluation Complete!',
        description: `Processed ${selectedLanguages.length} languages`,
      });

      setSelectedLanguages([]);
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Evaluation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setEvaluating(false);
      setCurrentLanguage('');
    }
  };

  if (stats.evaluationComplete) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>All Translations Evaluated!</AlertTitle>
          <AlertDescription>
            {stats.totalEvaluated.toLocaleString()} translations have been quality-scored. 
            Average quality: {Math.round(stats.avgQualityScore)}%
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">{stats.totalEvaluated.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Evaluated</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <p className="text-3xl font-bold">{Math.round(stats.avgQualityScore)}%</p>
            </div>
            <p className="text-sm text-muted-foreground">Avg Quality</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">100%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">
          Continue to Approve
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Translations Need Evaluation</AlertTitle>
        <AlertDescription>
          {stats.totalNeedEvaluation.toLocaleString()} translations haven't been quality-scored yet.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Evaluation Progress</span>
          <span>{evaluating ? progress : overallProgress}%</span>
        </div>
        <Progress value={evaluating ? progress : overallProgress} className="h-3" />
        {evaluating && currentLanguage && (
          <p className="text-sm text-muted-foreground">
            Currently evaluating: {currentLanguage}
          </p>
        )}
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Select Languages to Evaluate</h4>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedLanguages.length === languagesNeedingEvaluation.length 
              ? 'Deselect All' 
              : 'Select All'}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
          {languagesNeedingEvaluation.map(lang => {
            const Flag = (Flags as any)[lang.code.toUpperCase()];
            const isSelected = selectedLanguages.includes(lang.code);
            const needsEval = lang.actualTranslations - lang.evaluatedCount;
            
            return (
              <button
                key={lang.code}
                onClick={() => handleToggleLanguage(lang.code)}
                disabled={evaluating}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                } ${evaluating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox checked={isSelected} disabled={evaluating} />
                  {Flag && <Flag className="w-5 h-3" />}
                  <span className="font-medium text-sm">{lang.name}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {lang.evaluatedCount}/{lang.actualTranslations}
                  </Badge>
                  {lang.avgQualityScore && (
                    <Badge variant={
                      lang.avgQualityScore >= 85 ? 'default' :
                      lang.avgQualityScore >= 70 ? 'secondary' : 'destructive'
                    } className="text-xs">
                      {Math.round(lang.avgQualityScore)}%
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleEvaluateSelected}
        disabled={evaluating || selectedLanguages.length === 0}
        className="w-full"
        size="lg"
      >
        {evaluating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Evaluating... {progress}%
          </>
        ) : (
          <>
            <Shield className="w-4 h-4 mr-2" />
            Evaluate {selectedLanguages.length} Language{selectedLanguages.length !== 1 ? 's' : ''}
          </>
        )}
      </Button>
    </div>
  );
}
