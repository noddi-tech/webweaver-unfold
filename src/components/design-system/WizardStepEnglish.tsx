import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WizardStats } from '@/hooks/useWizardStats';

interface WizardStepEnglishProps {
  stats: WizardStats;
  onComplete: () => void;
}

export default function WizardStepEnglish({ stats, onComplete }: WizardStepEnglishProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [emptyKeys, setEmptyKeys] = useState<string[]>([]);
  const [showEmptyKeys, setShowEmptyKeys] = useState(false);

  const progress = stats.englishTotalKeys > 0
    ? Math.round((stats.englishActualKeys / stats.englishTotalKeys) * 100)
    : 0;

  const handleViewEmptyKeys = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('translation_key')
        .eq('language_code', 'en')
        .or('translated_text.is.null,translated_text.eq.')
        .eq('is_intentionally_empty', false);

      if (error) throw error;
      
      setEmptyKeys(data?.map(d => d.translation_key) || []);
      setShowEmptyKeys(true);
    } catch (error: any) {
      toast({
        title: 'Error fetching empty keys',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkIntentionallyEmpty = async (key: string) => {
    const { error } = await supabase
      .from('translations')
      .update({ 
        is_intentionally_empty: true,
        review_status: 'approved'
      })
      .eq('translation_key', key)
      .eq('language_code', 'en');

    if (error) {
      toast({
        title: 'Error marking key',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setEmptyKeys(prev => prev.filter(k => k !== key));
      toast({
        title: 'Key marked as intentionally empty',
        description: key,
      });
    }
  };

  if (stats.englishComplete) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>English Source Complete!</AlertTitle>
          <AlertDescription>
            All {stats.englishTotalKeys} English translation keys have content. You can proceed to the next step.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">{stats.englishTotalKeys}</p>
            <p className="text-sm text-muted-foreground">Total Keys</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">{stats.englishActualKeys}</p>
            <p className="text-sm text-muted-foreground">With Content</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">100%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">
          Continue to Sync Keys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>English Source Incomplete</AlertTitle>
        <AlertDescription>
          {stats.englishEmptyKeys} English keys are missing content. These need to be filled before translations can proceed.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>English Completion</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold">{stats.englishTotalKeys}</p>
          <p className="text-sm text-muted-foreground">Total Keys</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold text-success">{stats.englishActualKeys}</p>
          <p className="text-sm text-muted-foreground">With Content</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold text-destructive">{stats.englishEmptyKeys}</p>
          <p className="text-sm text-muted-foreground">Empty</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handleViewEmptyKeys}
          disabled={loading}
          className="flex-1"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          View Empty Keys
        </Button>
        <Button
          variant="default"
          onClick={() => window.open('/design-system?tab=translations', '_blank')}
          className="flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Edit in CMS
        </Button>
      </div>

      {showEmptyKeys && emptyKeys.length > 0 && (
        <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
          <h4 className="font-medium mb-2">Empty Keys ({emptyKeys.length})</h4>
          {emptyKeys.map(key => (
            <div key={key} className="flex items-center justify-between p-2 bg-muted rounded">
              <code className="text-sm">{key}</code>
              <div className="flex gap-2">
                <Badge variant="destructive">Empty</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleMarkIntentionallyEmpty(key)}
                >
                  Mark Intentional
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showEmptyKeys && emptyKeys.length === 0 && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>All Empty Keys Resolved!</AlertTitle>
          <AlertDescription>
            Refresh the page to update the status.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
