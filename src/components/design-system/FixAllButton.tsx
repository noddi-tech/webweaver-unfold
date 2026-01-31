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
  const [steps, setSteps] = useState<PipelineStep[]>([
    { id: 'sync', name: 'Sync Keys', description: 'Create missing translation entries', status: 'pending' },
    { id: 'translate', name: 'Translate', description: 'Fill empty translations with AI', status: 'pending' },
    { id: 'evaluate', name: 'Evaluate', description: 'Score translation quality', status: 'pending' },
    { id: 'approve', name: 'Approve', description: 'Auto-approve high-quality translations', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: PipelineStep['status'], result?: any) => {
    setSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status, result } : s
    ));
  };

  const runPipeline = async () => {
    setRunning(true);
    setCurrentStep(0);

    try {
      // Reset all steps
      setSteps(prev => prev.map(s => ({ ...s, status: 'pending', result: undefined })));

      // Step 1: Sync
      setCurrentStep(1);
      updateStepStatus('sync', 'running');
      
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'sync' }
      });

      if (syncError) throw syncError;
      updateStepStatus('sync', 'success', syncResult?.steps?.[0]);

      // Step 2: Translate
      setCurrentStep(2);
      updateStepStatus('translate', 'running');

      const { data: translateResult, error: translateError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'translate' }
      });

      if (translateError) throw translateError;
      updateStepStatus('translate', 'success', translateResult?.steps?.[0]);

      // Step 3: Evaluate
      setCurrentStep(3);
      updateStepStatus('evaluate', 'running');

      const { data: evalResult, error: evalError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'evaluate', options: { batchSize: 50 } }
      });

      if (evalError) throw evalError;
      updateStepStatus('evaluate', 'success', evalResult?.steps?.[0]);

      // Step 4: Approve
      setCurrentStep(4);
      updateStepStatus('approve', 'running');

      const { data: approveResult, error: approveError } = await supabase.functions.invoke('sync-and-translate', {
        body: { action: 'approve', options: { autoApproveThreshold: 85 } }
      });

      if (approveError) throw approveError;
      updateStepStatus('approve', 'success', approveResult?.steps?.[0]);

      toast({
        title: '🎉 Fix All Complete!',
        description: 'All translation issues have been resolved.',
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
              </div>
            )}

            {/* Steps */}
            <div className="space-y-3">
              {steps.map((step, index) => (
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
                        <p className="text-sm text-muted-foreground">{step.description}</p>
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
                  This will process all languages and may take several minutes. 
                  The page will update automatically when complete.
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
