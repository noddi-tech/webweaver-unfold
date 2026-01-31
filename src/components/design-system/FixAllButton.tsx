import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, Rocket, AlertCircle, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  detail?: string;
}

interface FixAllButtonProps {
  onComplete?: () => void;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export default function FixAllButton({ 
  onComplete, 
  variant = 'default',
  size = 'default',
  className 
}: FixAllButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'sync', name: 'Sync Keys', description: 'Create missing translation entries', status: 'pending' },
    { id: 'translate', name: 'Translate', description: 'Fill empty translations with AI', status: 'pending' },
    { id: 'evaluate', name: 'Evaluate', description: 'Score translation quality', status: 'pending' },
    { id: 'approve', name: 'Approve', description: 'Auto-approve high-quality translations', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: PipelineStep['status'], result?: any, detail?: string) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status, result, detail } : s
    ));
  };

  const runPipeline = async () => {
    setRunning(true);
    setCurrentStep(0);

    try {
      // Reset all steps
      setSteps(prev => prev.map(s => ({ ...s, status: 'pending', result: undefined, detail: undefined })));

      // Step 1: Sync (fast, single call)
      setCurrentStep(1);
      updateStepStatus('sync', 'running');
      
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'sync' }
      });

      if (syncError) throw syncError;
      updateStepStatus('sync', 'success', syncResult?.steps?.[0]);

      // Step 2: Translate - process each language individually in frontend
      setCurrentStep(2);
      updateStepStatus('translate', 'running');

      // Get all enabled non-English languages
      const { data: languages, error: langError } = await supabase
        .from('languages')
        .select('code, name')
        .eq('enabled', true)
        .neq('code', 'en');

      if (langError) throw langError;

      let totalTranslated = 0;
      const failedLanguages: string[] = [];

      for (let i = 0; i < (languages?.length || 0); i++) {
        const lang = languages![i];
        setCurrentLanguage(`${lang.name} (${i + 1}/${languages!.length})`);
        updateStepStatus('translate', 'running', undefined, `Translating ${lang.name}...`);

        // Get empty translations for this language
        const { data: emptyTranslations, error: fetchError } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', lang.code)
          .or('translated_text.is.null,translated_text.eq.');

        if (fetchError) {
          console.error(`Error fetching empty translations for ${lang.code}:`, fetchError);
          failedLanguages.push(lang.code);
          continue;
        }

        const keys = emptyTranslations?.map(t => t.translation_key) || [];

        if (keys.length > 0) {
          try {
            const { data, error: translateError } = await supabase.functions.invoke('translate-content', {
              body: {
                translationKeys: keys,
                targetLanguage: lang.code,
                sourceLanguage: 'en',
              },
            });

            if (translateError) {
              console.error(`Translation failed for ${lang.code}:`, translateError);
              failedLanguages.push(lang.code);
            } else {
              totalTranslated += data?.translated || keys.length;
            }
          } catch (err) {
            console.error(`Translation error for ${lang.code}:`, err);
            failedLanguages.push(lang.code);
          }
        }
      }

      setCurrentLanguage('');
      updateStepStatus('translate', failedLanguages.length > 0 ? 'error' : 'success', { 
        translated: totalTranslated,
        failed: failedLanguages 
      });

      // Step 3: Evaluate - process each language individually
      setCurrentStep(3);
      updateStepStatus('evaluate', 'running');

      let totalEvaluated = 0;

      for (let i = 0; i < (languages?.length || 0); i++) {
        const lang = languages![i];
        setCurrentLanguage(`${lang.name} (${i + 1}/${languages!.length})`);
        updateStepStatus('evaluate', 'running', undefined, `Evaluating ${lang.name}...`);

        try {
          const { data, error: evalError } = await supabase.functions.invoke('evaluate-translation-quality', {
            body: {
              languageCode: lang.code,
              batchSize: 50,
            },
          });

          if (!evalError && data?.evaluated) {
            totalEvaluated += data.evaluated;
          }
        } catch (err) {
          console.error(`Evaluation error for ${lang.code}:`, err);
        }
      }

      setCurrentLanguage('');
      updateStepStatus('evaluate', 'success', { evaluated: totalEvaluated });

      // Step 4: Approve (single database update, fast)
      setCurrentStep(4);
      updateStepStatus('approve', 'running');

      const { data: approveResult, error: approveError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'approve', options: { autoApproveThreshold: 85 } }
      });

      if (approveError) throw approveError;
      updateStepStatus('approve', 'success', approveResult?.steps?.[0]);

      toast({
        title: '🎉 Fix All Complete!',
        description: `Translated ${totalTranslated}, evaluated ${totalEvaluated} translations.`,
      });

      onComplete?.();
    } catch (error: any) {
      console.error('Pipeline error:', error);
      
      // Mark current step as error
      const currentStepId = steps[currentStep - 1]?.id;
      if (currentStepId) {
        updateStepStatus(currentStepId, 'error', { error: error.message });
      }

      toast({
        title: 'Pipeline Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setRunning(false);
      setCurrentLanguage('');
    }
  };

  const progress = Math.round((currentStep / steps.length) * 100);

  const getStepIcon = (step: PipelineStep) => {
    switch (step.status) {
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Rocket className="w-4 h-4 mr-2" />
        Fix All Issues
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Translation Pipeline
            </DialogTitle>
            <DialogDescription>
              Run all translation tasks in sequence to resolve all issues.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            {running && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {currentLanguage && (
                  <p className="text-sm text-muted-foreground">Processing: {currentLanguage}</p>
                )}
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border transition-all ${
                    step.status === 'running' 
                      ? 'border-primary bg-primary/5' 
                      : step.status === 'success'
                      ? 'border-success/50 bg-success/5'
                      : step.status === 'error'
                      ? 'border-destructive/50 bg-destructive/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStepIcon(step)}
                      <div>
                        <p className="font-medium">{step.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {step.detail || step.description}
                        </p>
                      </div>
                    </div>
                    {step.result && step.status === 'success' && (
                      <Badge variant="secondary" className="text-xs">
                        {step.id === 'sync' && `${step.result.synced || 0} synced`}
                        {step.id === 'translate' && `${step.result.translated || 0} translated`}
                        {step.id === 'evaluate' && `${step.result.evaluated || 0} evaluated`}
                        {step.id === 'approve' && `${step.result.approved || 0} approved`}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Warning */}
            {!running && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This processes each language individually to avoid timeouts. 
                  Progress updates in real-time as each language completes.
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={running}
              >
                {running ? 'Running...' : 'Cancel'}
              </Button>
              <Button
                onClick={runPipeline}
                disabled={running}
              >
                {running ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 mr-2" />
                    Start Pipeline
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
