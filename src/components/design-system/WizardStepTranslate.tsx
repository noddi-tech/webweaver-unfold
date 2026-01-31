import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Loader2, Languages, Sparkles } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { WizardStats, LanguageStat } from '@/hooks/useWizardStats';

interface WizardStepTranslateProps {
  stats: WizardStats;
  onComplete: () => void;
}

export default function WizardStepTranslate({ stats, onComplete }: WizardStepTranslateProps) {
  const { toast } = useToast();
  const [translating, setTranslating] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  // Filter to non-English languages with empty translations
  const languagesNeedingTranslation = stats.languageStats
    .filter(l => l.code !== 'en' && l.emptyCount > 0)
    .sort((a, b) => b.emptyCount - a.emptyCount);

  const totalEmptyCount = stats.totalEmpty;
  const overallProgress = stats.totalExpectedRows > 0
    ? Math.round(((stats.totalExpectedRows - stats.totalEmpty) / stats.totalExpectedRows) * 100)
    : 100;

  const handleSelectAll = () => {
    if (selectedLanguages.length === languagesNeedingTranslation.length) {
      setSelectedLanguages([]);
    } else {
      setSelectedLanguages(languagesNeedingTranslation.map(l => l.code));
    }
  };

  const handleToggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const handleTranslateSelected = async () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: 'No languages selected',
        description: 'Please select at least one language to translate',
        variant: 'destructive',
      });
      return;
    }

    setTranslating(true);
    setProgress(0);

    try {
      for (let i = 0; i < selectedLanguages.length; i++) {
        const langCode = selectedLanguages[i];
        const langStat = stats.languageStats.find(l => l.code === langCode);
        setCurrentLanguage(langStat?.name || langCode);

        // Get empty translation keys for this language
        const { data: emptyTranslations, error: fetchError } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', langCode)
          .or('translated_text.is.null,translated_text.eq.');

        if (fetchError) throw fetchError;

        const keys = emptyTranslations?.map(t => t.translation_key) || [];

        if (keys.length > 0) {
          toast({
            title: `Translating ${langStat?.name}...`,
            description: `${keys.length} translations`,
            duration: 2000,
          });

          const { error: translateError } = await supabase.functions.invoke('translate-content', {
            body: {
              translationKeys: keys,
              targetLanguage: langCode,
              sourceLanguage: 'en',
            },
          });

          if (translateError) {
            console.error(`Translation failed for ${langCode}:`, translateError);
            toast({
              title: `⚠️ ${langStat?.name} partial failure`,
              description: translateError.message,
              variant: 'destructive',
              duration: 3000,
            });
          } else {
            toast({
              title: `✅ ${langStat?.name} complete`,
              description: `Translated ${keys.length} entries`,
              duration: 2000,
            });
          }
        }

        setProgress(Math.round(((i + 1) / selectedLanguages.length) * 100));
      }

      toast({
        title: '🎉 Translation Complete!',
        description: `Processed ${selectedLanguages.length} languages`,
      });

      setSelectedLanguages([]);
      onComplete();
    } catch (error: any) {
      toast({
        title: 'Translation failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTranslating(false);
      setCurrentLanguage('');
    }
  };

  if (stats.translationComplete) {
    return (
      <div className="space-y-6">
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>All Languages Translated!</AlertTitle>
          <AlertDescription>
            All {stats.totalTranslated.toLocaleString()} translations are complete across {stats.totalLanguages} languages.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold">{stats.totalLanguages}</p>
            <p className="text-sm text-muted-foreground">Languages</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">{stats.totalTranslated.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Translated</p>
          </div>
          <div className="p-4 bg-muted rounded-lg text-center">
            <p className="text-3xl font-bold text-success">100%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>

        <Button onClick={onComplete} className="w-full">
          Continue to Evaluate
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Translations Missing</AlertTitle>
        <AlertDescription>
          {totalEmptyCount.toLocaleString()} translations are empty and need to be translated.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Overall Translation Progress</span>
          <span>{translating ? progress : overallProgress}%</span>
        </div>
        <Progress value={translating ? progress : overallProgress} className="h-3" />
        {translating && currentLanguage && (
          <p className="text-sm text-muted-foreground">
            Currently translating: {currentLanguage}
          </p>
        )}
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Select Languages to Translate</h4>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedLanguages.length === languagesNeedingTranslation.length 
              ? 'Deselect All' 
              : 'Select All'}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
          {languagesNeedingTranslation.map(lang => {
            const Flag = (Flags as any)[lang.code.toUpperCase()];
            const isSelected = selectedLanguages.includes(lang.code);
            
            return (
              <button
                key={lang.code}
                onClick={() => handleToggleLanguage(lang.code)}
                disabled={translating}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                } ${translating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox checked={isSelected} disabled={translating} />
                  {Flag && <Flag className="w-5 h-3" />}
                  <span className="font-medium text-sm">{lang.name}</span>
                </div>
                <Badge variant="destructive" className="text-xs">
                  {lang.emptyCount} missing
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <Button
        onClick={handleTranslateSelected}
        disabled={translating || selectedLanguages.length === 0}
        className="w-full"
        size="lg"
      >
        {translating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Translating... {progress}%
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Translate {selectedLanguages.length} Language{selectedLanguages.length !== 1 ? 's' : ''}
          </>
        )}
      </Button>
    </div>
  );
}
