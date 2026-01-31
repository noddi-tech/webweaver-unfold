import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WizardStats } from '@/hooks/useWizardStats';

interface WizardStepSyncProps {
  stats: WizardStats;
  onComplete: () => void;
}

export default function WizardStepSync({ stats, onComplete }: WizardStepSyncProps) {
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const progress = stats.totalExpectedRows > 0
    ? Math.round((stats.totalActualRows / stats.totalExpectedRows) * 100)
    : 0;

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncProgress(0);

    try {
      // Get all English keys
      const { data: englishKeys, error: keyError } = await supabase
        .from('translations')
        .select('translation_key, translated_text, page_location, context')
        .eq('language_code', 'en');

      if (keyError) throw keyError;

      // Get all enabled languages (excluding English)
      const { data: languages, error: langError } = await supabase
        .from('languages')
        .select('code, name')
        .eq('enabled', true)
        .neq('code', 'en');

      if (langError) throw langError;

      if (!englishKeys || !languages) {
        throw new Error('No keys or languages found');
      }

      toast({
        title: 'Starting sync...',
        description: `Syncing ${englishKeys.length} keys across ${languages.length} languages`,
      });

      // Process each language
      for (let i = 0; i < languages.length; i++) {
        const lang = languages[i];
        
        // Get existing keys for this language
        const { data: existingKeys } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', lang.code);

        const existingKeySet = new Set(existingKeys?.map(k => k.translation_key) || []);

        // Find missing keys
        const missingKeys = englishKeys.filter(k => !existingKeySet.has(k.translation_key));

        if (missingKeys.length > 0) {
          // Create empty entries for missing keys
          const newEntries = missingKeys.map(k => ({
            translation_key: k.translation_key,
            language_code: lang.code,
            translated_text: '', // Empty, will be translated in next step
            page_location: k.page_location,
            context: k.context,
            is_stale: true,
            review_status: 'needs_translation' as const,
          }));

          // Batch insert in chunks of 100
          const chunkSize = 100;
          for (let j = 0; j < newEntries.length; j += chunkSize) {
            const chunk = newEntries.slice(j, j + chunkSize);
            const { error: insertError } = await supabase
              .from('translations')
              .upsert(chunk, { onConflict: 'translation_key,language_code' });

            if (insertError) {
              console.error(`Error inserting chunk for ${lang.code}:`, insertError);
            }
          }

          toast({
            title: `✓ ${lang.name}`,
            description: `Created ${missingKeys.length} entries`,
            duration: 2000,
          });
        }

        setSyncProgress(Math.round(((i + 1) / languages.length) * 100));
      }

      toast({
        title: '🎉 Sync Complete!',
        description: 'All translation keys are now synced across languages',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  if (stats.syncComplete) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Keys Synced!</AlertTitle>
          <AlertDescription>
            All {stats.totalExpectedRows.toLocaleString()} translation entries exist across {stats.totalLanguages} languages.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold">{stats.totalLanguages}</p>
            <p className="text-sm text-muted-foreground">Languages</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">{stats.totalActualRows.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Entries</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">100%</p>
            <p className="text-sm text-muted-foreground">Synced</p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">
          Continue to Translate
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Keys Not Synced</AlertTitle>
        <AlertDescription>
          {stats.missingSyncRows.toLocaleString()} translation entries are missing. 
          These need to be created before translations can proceed.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Sync Progress</span>
          <span>{syncing ? syncProgress : progress}%</span>
        </div>
        <Progress value={syncing ? syncProgress : progress} className="h-3" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold">{stats.totalLanguages}</p>
          <p className="text-sm text-muted-foreground">Languages</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold">{stats.englishTotalKeys}</p>
          <p className="text-sm text-muted-foreground">Keys per Lang</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold text-success">{stats.totalActualRows.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Existing</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-3xl font-bold text-destructive">{stats.missingSyncRows.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Missing</p>
        </div>
      </div>

      <Button
        onClick={handleSyncAll}
        disabled={syncing}
        className="w-full"
        size="lg"
      >
        {syncing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Syncing... {syncProgress}%
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync All Keys ({stats.missingSyncRows.toLocaleString()} missing)
          </>
        )}
      </Button>
    </div>
  );
}
