import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Languages, Globe, Sparkles, Loader2, AlertTriangle, RefreshCw, Plus, RotateCcw } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from '@/components/ui/separator';

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  flag_code: string;
  enabled: boolean;
}

interface LanguageStats {
  code: string;
  missing_translations: number;
  actual_translations: number;
  total_translations: number;
  avg_quality_score: number | null;
  evaluated_count?: number;
}

interface LanguageSelectionPanelProps {
  languages: Language[];
  selectedLanguages: string[];
  onSelectionChange: (selected: string[]) => void;
  languageStats?: LanguageStats[];
  englishCount?: number;
  // Operations state
  isTranslating?: boolean;
  isEvaluating?: boolean;
  isSyncing?: boolean;
  isResettingStuck?: boolean;
  // Operation handlers
  onTranslateSelected: () => void;
  onEvaluateSelected: () => void;
  onSyncKeys?: () => void;
  onResetStuck?: () => void;
  onResetForReEvaluation?: (languageCode: string) => void;
  onAddKey?: () => void;
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
  languageStats = [],
  englishCount = 0,
  isTranslating = false,
  isEvaluating = false,
  isSyncing = false,
  isResettingStuck = false,
  onTranslateSelected,
  onEvaluateSelected,
  onSyncKeys,
  onResetStuck,
  onResetForReEvaluation,
  onAddKey,
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

  const isProcessing = isTranslating || isEvaluating || isSyncing || isResettingStuck;

  // Calculate totals based on selection
  const selectedStats = languageStats.filter(s => 
    selectedLanguages.length === 0 
      ? targetLanguages.some(l => l.code === s.code)
      : selectedLanguages.includes(s.code)
  );

  const totalMissingKeys = selectedStats.reduce((sum, s) => sum + (s.missing_translations || 0), 0);
  const totalTranslations = selectedStats.reduce((sum, s) => sum + (s.actual_translations || 0), 0);
  const languagesWithMissing = selectedStats.filter(s => (s.missing_translations || 0) > 0).length;

  // Get stats for a specific language
  const getLanguageStats = (code: string) => {
    return languageStats.find(s => s.code === code);
  };

  // Scope label
  const getScopeLabel = () => {
    if (selectedLanguages.length === 0) return 'All languages';
    if (selectedLanguages.length === 1) {
      const lang = languages.find(l => l.code === selectedLanguages[0]);
      return lang?.name || selectedLanguages[0];
    }
    return `${selectedLanguages.length} languages`;
  };

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Translation Operations</CardTitle>
                {selectedLanguages.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedLanguages.length} selected
                  </Badge>
                )}
                {totalMissingKeys > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {totalMissingKeys} missing
                  </Badge>
                )}
              </div>
              <ChevronDown className={cn(
                "w-5 h-5 transition-transform",
                isOpen && "rotate-180"
              )} />
            </div>
            <CardDescription>
              Select languages to scope all operations, or leave empty to operate on all
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

            {/* Language Grid with Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {targetLanguages.map(lang => {
                const FlagIcon = (Flags as any)[lang.flag_code];
                const isSelected = selectedLanguages.includes(lang.code);
                const stats = getLanguageStats(lang.code);
                const missingCount = stats?.missing_translations || 0;
                
                return (
                  <div
                    key={lang.code}
                    role="button"
                    tabIndex={isProcessing ? -1 : 0}
                    onClick={() => !isProcessing && toggleLanguage(lang.code)}
                    onKeyDown={(e) => {
                      if (!isProcessing && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleLanguage(lang.code);
                      }
                    }}
                    className={cn(
                      "flex flex-col p-2 rounded-lg border transition-all text-left cursor-pointer",
                      isSelected 
                        ? "border-primary bg-primary/10 ring-1 ring-primary" 
                        : "border-border hover:border-muted-foreground/50",
                      isProcessing && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        className="pointer-events-none"
                        tabIndex={-1}
                      />
                      {FlagIcon && <FlagIcon className="w-5 h-4 flex-shrink-0" />}
                      <span className="text-sm truncate">{lang.name}</span>
                    </div>
                    {missingCount > 0 && (
                      <span className="text-xs text-destructive mt-1 ml-6">
                        {missingCount} missing
                      </span>
                    )}
                  </div>
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

            {/* Scope Indicator */}
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Operating on:</span>
                <span className="font-medium">{getScopeLabel()}</span>
                {totalMissingKeys > 0 && (
                  <>
                    <Separator orientation="vertical" className="h-4" />
                    <span className="text-destructive">{totalMissingKeys} total missing keys</span>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Consolidated Action Buttons */}
            <div className="space-y-4">
              {/* Translation Actions */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Translation</span>
                <div className="flex flex-wrap gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={onTranslateSelected}
                          disabled={isProcessing || (selectedLanguages.length > 0 && totalMissingKeys === 0)}
                          className="gap-2"
                        >
                          {isTranslating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Globe className="w-4 h-4" />
                          )}
                          Translate Missing
                          {totalMissingKeys > 0 && (
                            <Badge variant="secondary" className="ml-1 bg-background">
                              {totalMissingKeys}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Translate only empty/missing translations for {getScopeLabel()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Evaluation Actions */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Quality Evaluation</span>
                <div className="flex flex-wrap gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="secondary"
                          onClick={onEvaluateSelected}
                          disabled={isProcessing || (selectedLanguages.length > 0 && totalTranslations === 0)}
                          className="gap-2"
                        >
                          {isEvaluating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                          Evaluate Quality
                          {selectedLanguages.length > 0 && (
                            <Badge variant="outline" className="ml-1">
                              {selectedLanguages.length === 1 ? getScopeLabel() : `${selectedLanguages.length} langs`}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Run AI quality evaluation for {getScopeLabel()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {onResetStuck && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={onResetStuck}
                            disabled={isProcessing}
                            className="gap-2"
                          >
                            {isResettingStuck ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4" />
                            )}
                            Reset Stuck
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Reset evaluations stuck for &gt;10 minutes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {onResetForReEvaluation && selectedLanguages.length === 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => onResetForReEvaluation(selectedLanguages[0])}
                            disabled={isProcessing}
                            className="gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reset for Re-evaluation
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clear all quality scores so {selectedLanguages[0].toUpperCase()} can be re-evaluated from scratch</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>

              {/* Setup Actions */}
              {(onAddKey || onSyncKeys) && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">Setup (Global)</span>
                  <div className="flex flex-wrap gap-3">
                    {onAddKey && (
                      <Button
                        variant="outline"
                        onClick={onAddKey}
                        disabled={isProcessing}
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Translation Key
                      </Button>
                    )}

                    {onSyncKeys && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              onClick={onSyncKeys}
                              disabled={isProcessing}
                              className="gap-2"
                            >
                              {isSyncing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                              Sync Keys
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ensure all languages have entries for all English keys</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Help text */}
            {selectedLanguages.length === 0 && (
              <p className="text-xs text-muted-foreground">
                💡 Tip: Select specific languages above to scope operations, or leave empty to operate on all enabled languages.
              </p>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
