import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useEvaluationProgress } from '@/hooks/useEvaluationProgress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  RotateCcw, 
  Pause, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EvaluationControlsProps {
  languageCode: string;
  languageName: string;
  onEvaluate: (languageCode: string, startFromKey?: string | null) => Promise<void>;
}

export default function EvaluationControls({ 
  languageCode, 
  languageName, 
  onEvaluate 
}: EvaluationControlsProps) {
  const { toast } = useToast();
  const { progress: languageProgress, pauseEvaluation, resumeEvaluation, refresh } = useEvaluationProgress(languageCode);
  const [isWorking, setIsWorking] = useState(false);

  const progress = languageProgress;
  const percentage = progress && progress.total_keys > 0 
    ? Math.round((progress.evaluated_keys / progress.total_keys) * 100) 
    : 0;

  async function handleResume() {
    if (!progress) return;
    
    setIsWorking(true);
    try {
      await resumeEvaluation(languageCode);
      toast({
        title: 'Resuming evaluation',
        description: `Continuing from ${progress.evaluated_keys}/${progress.total_keys} translations`
      });
      
      // Call the evaluation function with resume key
      await onEvaluate(languageCode, progress.last_evaluated_key);
    } catch (error: any) {
      toast({
        title: 'Failed to resume',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsWorking(false);
      refresh();
    }
  }

  async function handlePause() {
    if (!progress) return;
    
    setIsWorking(true);
    try {
      await pauseEvaluation(languageCode);
      toast({
        title: 'Evaluation paused',
        description: 'You can resume anytime'
      });
    } catch (error: any) {
      toast({
        title: 'Failed to pause',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsWorking(false);
      refresh();
    }
  }

  async function handleRestart() {
    setIsWorking(true);
    try {
      // Clear progress
      await supabase
        .from('evaluation_progress')
        .delete()
        .eq('language_code', languageCode);

      // Clear quality scores
      await supabase
        .from('translations')
        .update({ 
          quality_score: null, 
          quality_metrics: null,
          ai_reviewed_at: null 
        })
        .eq('language_code', languageCode);

      toast({
        title: 'Evaluation reset',
        description: 'Starting fresh evaluation...'
      });

      // Start new evaluation
      await onEvaluate(languageCode, null);
    } catch (error: any) {
      toast({
        title: 'Failed to restart',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsWorking(false);
      refresh();
    }
  }

  // No progress yet - show start button
  if (!progress || progress.status === 'idle') {
    return (
      <Button
        onClick={() => onEvaluate(languageCode, null)}
        disabled={isWorking}
        variant="outline"
        size="sm"
      >
        {isWorking ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        Evaluate Quality
      </Button>
    );
  }

  // Evaluation in progress
  if (progress.status === 'in_progress') {
    return (
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="animate-pulse">
            {percentage}%
          </Badge>
          <Button
            onClick={handlePause}
            disabled={isWorking}
            variant="ghost"
            size="sm"
          >
            {isWorking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {progress.evaluated_keys} / {progress.total_keys} translations
        </p>
      </div>
    );
  }

  // Evaluation paused
  if (progress.status === 'paused') {
    return (
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline">Paused {percentage}%</Badge>
          <div className="flex gap-1">
            <Button
              onClick={handleResume}
              disabled={isWorking}
              variant="ghost"
              size="sm"
            >
              {isWorking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isWorking}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Restart Evaluation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all progress and start fresh evaluation for {languageName}.
                    All existing quality scores will be removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRestart}>
                    Restart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {progress.evaluated_keys} / {progress.total_keys} translations
        </p>
      </div>
    );
  }

  // Evaluation completed
  if (progress.status === 'completed') {
    return (
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-2">
          <Badge>Complete ✓</Badge>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isWorking}>
                {isWorking ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Re-evaluate {languageName}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will clear all existing quality scores and start a fresh evaluation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRestart}>
                  Re-evaluate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <Progress value={100} className="h-2" />
        <p className="text-xs text-muted-foreground">
          {progress.total_keys} translations evaluated
        </p>
      </div>
    );
  }

  // Error state
  if (progress.status === 'error') {
    return (
      <div className="space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="destructive">Error</Badge>
          <Button
            onClick={handleRestart}
            disabled={isWorking}
            variant="ghost"
            size="sm"
          >
            {isWorking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        {progress.error_message && (
          <p className="text-xs text-destructive">{progress.error_message}</p>
        )}
      </div>
    );
  }

  return null;
}
