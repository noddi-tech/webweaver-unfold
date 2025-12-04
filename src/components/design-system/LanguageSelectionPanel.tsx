import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Languages, Globe, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_code: string;
  enabled: boolean;
}

interface LanguageSelectionPanelProps {
  languages: Language[];
  selectedLanguages: string[];
  onSelectionChange: (selected: string[]) => void;
  isTranslating?: boolean;
  isEvaluating?: boolean;
  onTranslateSelected: () => void;
  onEvaluateSelected: () => void;
  translationProgress?: string;
}

// Language group presets
const LANGUAGE_PRESETS = {
  nordic: { name: 'Nordic', codes: ['no', 'sv', 'da', 'fi'], icon: '🇳🇴' },
  central_european: { name: 'Central European', codes: ['de', 'pl', 'cs', 'hu'], icon: '🇩🇪' },
  romance: { name: 'Romance', codes: ['fr', 'es', 'it', 'pt', 'ro'], icon: '🇫🇷' },
  benelux: { name: 'Benelux', codes: ['nl', 'de', 'fr'], icon: '🇳🇱' },
};

export default function LanguageSelectionPanel({
  languages,
  selectedLanguages,
  onSelectionChange,
  isTranslating = false,
  isEvaluating = false,
  onTranslateSelected,
  onEvaluateSelected,
  translationProgress,
}: LanguageSelectionPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Filter to non-English enabled languages
  const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');

  const toggleLanguage = (code: string) => {
    if (selectedLanguages.includes(code)) {
      onSelectionChange(selectedLanguages.filter(c => c !== code));
    } else {
      onSelectionChange([...selectedLanguages, code]);
    }
  };

  const selectAll = () => {
    onSelectionChange(targetLanguages.map(l => l.code));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  const applyPreset = (presetKey: keyof typeof LANGUAGE_PRESETS) => {
    const preset = LANGUAGE_PRESETS[presetKey];
    const availableCodes = preset.codes.filter(code => 
      targetLanguages.some(l => l.code === code)
    );
    onSelectionChange(availableCodes);
  };

  const isProcessing = isTranslating || isEvaluating;

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Language Selection</CardTitle>
                {selectedLanguages.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedLanguages.length} selected
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
            <CardDescription>
              Select specific languages to translate or evaluate
            </CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground mr-2 self-center">Quick select:</span>
              {Object.entries(LANGUAGE_PRESETS).map(([key, preset]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(key as keyof typeof LANGUAGE_PRESETS)}
                  disabled={isProcessing}
                >
                  <span className="mr-1">{preset.icon}</span>
                  {preset.name}
                </Button>
              ))}
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={selectAll}
                disabled={isProcessing}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deselectAll}
                disabled={isProcessing || selectedLanguages.length === 0}
              >
                Deselect All
              </Button>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {targetLanguages.map(lang => {
                const FlagIcon = (Flags as any)[lang.flag_code];
                const isSelected = selectedLanguages.includes(lang.code);
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggleLanguage(lang.code)}
                    disabled={isProcessing}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg border transition-all text-left",
                      isSelected 
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border hover:border-muted-foreground/50",
                      isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                    {FlagIcon && <FlagIcon className="w-5 h-4 flex-shrink-0" />}
                    <span className="text-sm truncate">{lang.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress indicator */}
            {translationProgress && (
              <div className="p-3 bg-muted rounded-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">{translationProgress}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2 border-t">
              <Button
                onClick={onTranslateSelected}
                disabled={isProcessing || selectedLanguages.length === 0}
                className="gap-2"
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                Translate Selected ({selectedLanguages.length})
              </Button>
              
              <Button
                variant="outline"
                onClick={onEvaluateSelected}
                disabled={isProcessing || selectedLanguages.length === 0}
                className="gap-2"
              >
                {isEvaluating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                Evaluate Selected ({selectedLanguages.length})
              </Button>

              {selectedLanguages.length === 0 && (
                <span className="text-sm text-muted-foreground self-center ml-2">
                  Select at least one language
                </span>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
