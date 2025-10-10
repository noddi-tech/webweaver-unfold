import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Upload, Loader2, Plus, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import LanguageSettings from './LanguageSettings';

export default function TranslationManagerContent() {
  const { toast } = useToast();
  const [languages, setLanguages] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchFilter, setSearchFilter] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [stats, setStats] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('homepage');
  const [isSyncing, setIsSyncing] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<string>('');
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [approveAllLanguage, setApproveAllLanguage] = useState<string | null>(null);
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [pageLocationFilter, setPageLocationFilter] = useState<string>('all');
  const [contextFilter, setContextFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all'); // all, high (>=85), medium (70-84), low (<70)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [completedLanguage, setCompletedLanguage] = useState<string>('');
  const [completedLanguageName, setCompletedLanguageName] = useState<string>('');
  const [translatedCount, setTranslatedCount] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: langs }, { data: trans }] = await Promise.all([
      supabase.from('languages').select('*').order('sort_order'),
      supabase.from('translations').select('*').limit(100000).order('translation_key'),
    ]);
    
    // Get stats from view
    const { data: st } = await supabase.from('translation_stats' as any).select('*');
    
    if (langs) setLanguages(langs);
    if (trans) {
      setTranslations(trans);
      // Store English translations separately for reference
      setEnglishTranslations(trans.filter(t => t.language_code === 'en'));
    }
    if (st) setStats(st);
  }

  // Helper to get English source text for a key
  const getEnglishText = (translationKey: string): string => {
    const englishTranslation = englishTranslations.find(t => t.translation_key === translationKey);
    return englishTranslation?.translated_text || '';
  };

  // Get unique page locations and contexts for filter dropdowns
  const uniquePageLocations = Array.from(new Set(
    translations
      .filter(t => t.language_code === selectedLang)
      .map(t => t.page_location)
      .filter(Boolean)
  )).sort();

  const uniqueContexts = Array.from(new Set(
    translations
      .filter(t => t.language_code === selectedLang)
      .map(t => t.context)
      .filter(Boolean)
  )).sort();

  // Helper function to check for empty translations
  const hasEmptyTranslations = (languageCode: string): number => {
    return translations.filter(
      t => t.language_code === languageCode && 
           !t.approved && 
           (!t.translated_text || t.translated_text.trim() === '')
    ).length;
  };

  // Multi-filter logic
  const filteredTranslations = translations.filter(t => {
    // Language filter
    if (t.language_code !== selectedLang) return false;
    
    // Search filter
    if (searchFilter && !t.translation_key.toLowerCase().includes(searchFilter.toLowerCase())) {
      return false;
    }
    
    // Empty translations filter
    if (showEmptyOnly && t.translated_text?.trim()) {
      return false;
    }
    
    // Page location filter
    if (pageLocationFilter !== 'all' && t.page_location !== pageLocationFilter) {
      return false;
    }
    
    // Context filter
    if (contextFilter !== 'all' && t.context !== contextFilter) {
      return false;
    }
    
    // Quality filter
    if (qualityFilter !== 'all') {
      const score = t.quality_score;
      if (qualityFilter === 'high' && (score === null || score < 85)) return false;
      if (qualityFilter === 'medium' && (score === null || score < 70 || score >= 85)) return false;
      if (qualityFilter === 'low' && (score === null || score >= 70)) return false;
      if (qualityFilter === 'needs_review' && t.review_status !== 'needs_review') return false;
      if (qualityFilter === 'technical_terms' && (!t.quality_metrics?.technical_term_issues || t.quality_metrics.technical_term_issues.length === 0)) return false;
    }
    
    return true;
  });

  // Debug logging for needs_review filter
  console.log('Filter Debug:', {
    selectedLang,
    qualityFilter,
    totalTranslations: translations.length,
    afterLangFilter: translations.filter(t => t.language_code === selectedLang).length,
    needsReviewInLang: translations.filter(t => t.language_code === selectedLang && t.review_status === 'needs_review').length,
    finalFiltered: filteredTranslations.length
  });

  async function handleApprove(id: string) {
    const { error } = await supabase
      .from('translations')
      .update({ approved: true, approved_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error approving translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation approved' });
      loadData();
    }
  }

  async function handleReject(id: string) {
    const { error } = await supabase
      .from('translations')
      .update({ approved: false })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error rejecting translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation rejected' });
      loadData();
    }
  }

  async function handleApproveAll(languageCode: string) {
    setIsApprovingAll(true);
    
    try {
      // Check for empty translations first
      const emptyCount = hasEmptyTranslations(languageCode);
      
      if (emptyCount > 0) {
        toast({
          title: `Cannot approve all translations`,
          description: `Found ${emptyCount} empty translation${emptyCount > 1 ? 's' : ''}. Please add content to all translations before approving.`,
          variant: 'destructive'
        });
        setApproveAllLanguage(null);
        setIsApprovingAll(false);
        return;
      }

      // Get count of unapproved translations
      const { count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', languageCode)
        .eq('approved', false);

      if (!count || count === 0) {
        toast({ title: 'All translations already approved' });
        setApproveAllLanguage(null);
        setIsApprovingAll(false);
        return;
      }

      // Batch approve all translations for this language
      const { error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('language_code', languageCode)
        .eq('approved', false);

      if (error) {
        toast({ 
          title: 'Error approving translations', 
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        const langName = languages.find(l => l.code === languageCode)?.name || languageCode;
        toast({ 
          title: 'All translations approved!', 
          description: `Approved ${count} ${langName} translations`
        });
        loadData();
      }
    } catch (error: any) {
      toast({ 
        title: 'Approval failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsApprovingAll(false);
      setApproveAllLanguage(null);
    }
  }

  async function handleApproveHighQuality(languageCode: string) {
    setIsApprovingAll(true);
    
    try {
      // Get count of high-quality unapproved translations (score >= 85)
      const { count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', languageCode)
        .eq('approved', false)
        .gte('quality_score', 85);

      if (!count || count === 0) {
        toast({ 
          title: 'No high-quality translations to approve',
          description: 'All high-quality translations are already approved'
        });
        setIsApprovingAll(false);
        return;
      }

      // Batch approve high-quality translations
      const { error } = await supabase
        .from('translations')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString(),
          review_status: 'approved'
        })
        .eq('language_code', languageCode)
        .eq('approved', false)
        .gte('quality_score', 85);

      if (error) {
        toast({ 
          title: 'Error approving translations', 
          description: error.message,
          variant: 'destructive' 
        });
      } else {
        const langName = languages.find(l => l.code === languageCode)?.name || languageCode;
        toast({ 
          title: 'High-quality translations approved!', 
          description: `Auto-approved ${count} high-quality ${langName} translations (≥85% quality)`
        });
        loadData();
      }
    } catch (error: any) {
      toast({ 
        title: 'Auto-approval failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsApprovingAll(false);
    }
  }

  async function handleFlagLowQuality(languageCode: string) {
    try {
      // Flag translations with quality score < 70 for review
      const { count } = await supabase
        .from('translations')
        .select('*', { count: 'exact', head: true })
        .eq('language_code', languageCode)
        .lt('quality_score', 70);

      if (!count || count === 0) {
        toast({ title: 'No low-quality translations found' });
        return;
      }

      const { error } = await supabase
        .from('translations')
        .update({ review_status: 'needs_review' })
        .eq('language_code', languageCode)
        .lt('quality_score', 70);

      if (error) throw error;

      toast({ 
        title: 'Low-quality translations flagged',
        description: `Flagged ${count} translations for review (quality <70%)`
      });
      loadData();
    } catch (error: any) {
      toast({ 
        title: 'Error flagging translations', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  }

  async function handleExportTranslations(languageCode: string) {
    try {
      const exportData = translations
        .filter(t => t.language_code === languageCode)
        .map(t => ({
          key: t.translation_key,
          text: t.translated_text,
          page: t.page_location,
          context: t.context,
          quality_score: t.quality_score,
          review_status: t.review_status,
          approved: t.approved
        }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `translations-${languageCode}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Translations exported successfully' });
    } catch (error: any) {
      toast({ 
        title: 'Export failed', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  }

  async function handleSyncKeys() {
    setIsSyncing(true);
    
    try {
      // Get ALL English translations (the master set)
      const { data: englishKeys, error: englishError } = await supabase
        .from('translations')
        .select('translation_key, page_location, context')
        .eq('language_code', 'en');

      if (englishError || !englishKeys || englishKeys.length === 0) {
        toast({ title: 'No English translations found', variant: 'destructive' });
        setIsSyncing(false);
        return;
      }

      // Get enabled languages (except English)
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');
      
      if (targetLanguages.length === 0) {
        toast({ title: 'No target languages enabled', variant: 'destructive' });
        setIsSyncing(false);
        return;
      }

      let totalKeysCreated = 0;

      // Process each language
      for (let i = 0; i < targetLanguages.length; i++) {
        const lang = targetLanguages[i];
        setTranslationProgress(`Syncing ${lang.name} (${i + 1}/${targetLanguages.length})...`);

        // Fetch ALL existing translations for this language in one query
        const { data: existingTranslations } = await supabase
          .from('translations')
          .select('translation_key')
          .eq('language_code', lang.code);

        // Create a Set for fast lookup of existing keys
        const existingKeys = new Set(
          existingTranslations?.map(t => t.translation_key) || []
        );

        // Find missing keys by comparing with English keys
        const missingKeys = englishKeys.filter(
          enKey => !existingKeys.has(enKey.translation_key)
        );

        // Batch insert all missing keys in one operation
        if (missingKeys.length > 0) {
          const newTranslations = missingKeys.map(enKey => ({
            translation_key: enKey.translation_key,
            language_code: lang.code,
            translated_text: enKey.translation_key, // Use key as placeholder
            approved: false,
            page_location: enKey.page_location,
            context: enKey.context,
          }));

          const { error: insertError } = await supabase
            .from('translations')
            .insert(newTranslations);

          if (insertError) {
            console.error(`Error inserting translations for ${lang.name}:`, insertError);
            toast({ 
              title: `Failed to sync ${lang.name}`, 
              description: insertError.message, 
              variant: 'destructive' 
            });
          } else {
            totalKeysCreated += missingKeys.length;
          }
        }
      }

      toast({ 
        title: 'Sync complete!', 
        description: `Created ${totalKeysCreated} placeholder translations across ${targetLanguages.length} languages`
      });
      loadData();
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({ title: 'Sync failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
      setTranslationProgress('');
    }
  }

  async function handleTranslateAll() {
    setIsTranslating(true);
    
    // Get all English keys
    const { data: englishKeys } = await supabase
      .from('translations')
      .select('translation_key')
      .eq('language_code', 'en');

    if (!englishKeys || englishKeys.length === 0) {
      toast({ title: 'No English translations found', variant: 'destructive' });
      setIsTranslating(false);
      setTranslationProgress('');
      return;
    }

    // Get enabled languages (except English)
    const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');

    if (targetLanguages.length === 0) {
      toast({ title: 'No target languages enabled', variant: 'destructive' });
      setIsTranslating(false);
      setTranslationProgress('');
      return;
    }

    const batchSize = 100;
    const totalBatches = Math.ceil(englishKeys.length / batchSize);
    const translationKeys = englishKeys.map(k => k.translation_key);
    
    setTranslationProgress(`Preparing to translate ${translationKeys.length} keys to ${targetLanguages.length} languages...`);

    try {
      const results = [];
      
      // Process each language sequentially
      for (let i = 0; i < targetLanguages.length; i++) {
        const lang = targetLanguages[i];
        setTranslationProgress(
          `Translating ${lang.name} (${i + 1}/${targetLanguages.length})... ${totalBatches} batches`
        );

        console.log(`Translating to ${lang.code}...`);

        const { data, error } = await supabase.functions.invoke('translate-content', {
          body: {
            translationKeys,
            targetLanguage: lang.code,
            sourceLanguage: 'en',
          }
        });

        if (error) {
          console.error(`Error translating ${lang.name}:`, error);
          results.push({
            language: lang.code,
            languageName: lang.name,
            status: 'error',
            error: error.message
          });
          
          // Handle specific errors but continue with other languages
          if (error.message?.includes('429')) {
            toast({
              title: `${lang.name}: Rate limit`,
              description: 'Waiting 30 seconds before continuing...',
              variant: 'default'
            });
            await new Promise(resolve => setTimeout(resolve, 30000));
          } else if (error.message?.includes('402')) {
            toast({
              title: `${lang.name}: Payment required`,
              description: 'Please check your Lovable AI credits',
              variant: 'destructive'
            });
          }
          
          continue;
        }

        // Store result
        const result = {
          ...data,
          languageName: lang.name
        };
        results.push(result);

        // Show per-language completion
        toast({
          title: `${lang.name} complete`,
          description: `${data.count} translations saved${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
          duration: 3000
        });

        // Reload data to show updated translations
        await new Promise(resolve => setTimeout(resolve, 1000));
        await loadData();

        // Show quality evaluation dialog
        setCompletedLanguage(lang.code);
        setCompletedLanguageName(lang.name);
        setTranslatedCount(data.count);
        setShowQualityDialog(true);

        // Small delay between languages to avoid overwhelming the system
        if (i < targetLanguages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Show final summary
      const successCount = results.filter(r => r.status === 'success').length;
      const partialCount = results.filter(r => r.status === 'partial').length;
      const failedCount = results.filter(r => r.status === 'error').length;
      const totalTranslated = results.reduce((sum, r) => sum + (r.count || 0), 0);

      toast({
        title: 'Translation complete!',
        description: `${successCount} languages completed successfully${partialCount > 0 ? `, ${partialCount} partial` : ''}${failedCount > 0 ? `, ${failedCount} failed` : ''}. Total: ${totalTranslated} translations.`,
        duration: 8000
      });

      await loadData();
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({
        title: 'Translation failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
      setTranslationProgress('');
    }
  }

  async function handleUpdate(id: string, newText: string) {
    const { error } = await supabase
      .from('translations')
      .update({ translated_text: newText, approved: false })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating translation', variant: 'destructive' });
    } else {
      toast({ title: 'Translation updated' });
      loadData();
    }
  }

  // Enhanced evaluation with auto-resume capability
  async function handleEvaluateQuality(languageCode: string, startFromKey: string | null = null) {
    setIsEvaluating(true);
    
    try {
      const langName = languages.find(l => l.code === languageCode)?.name || languageCode;

      if (!startFromKey) {
        setTranslationProgress(`Starting evaluation for ${langName}...`);
      } else {
        setTranslationProgress(`Resuming evaluation for ${langName}...`);
      }

      const { data, error } = await supabase.functions.invoke('evaluate-translation-quality', {
        body: {
          targetLanguage: languageCode,
          sourceLanguage: 'en',
          startFromKey
        }
      });

      if (error) {
        throw error;
      }

      // Check if we need to continue
      if (data.shouldContinue && data.lastKey) {
        console.log(`Partial completion: ${data.evaluatedCount} translations. Resuming from ${data.lastKey}...`);
        
        toast({
          title: `${langName}: Batch complete`,
          description: `${data.totalEvaluated}/${data.totalKeys} translations evaluated (${Math.round((data.totalEvaluated/data.totalKeys)*100)}%). Continuing automatically...`,
          duration: 3000
        });

        await loadData();
        
        // Small delay then continue
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Recursively call with last key to resume
        return await handleEvaluateQuality(languageCode, data.lastKey);
      }

      // Evaluation complete
      toast({
        title: `${langName} evaluation complete! ✓`,
        description: data.status === 'completed' 
          ? `All translations evaluated successfully` 
          : `Evaluated ${data.evaluatedCount} translations. Average: ${data.averageScore}% (${data.highQuality} high, ${data.mediumQuality} medium, ${data.lowQuality} low)`,
        duration: 8000
      });

      await loadData();
    } catch (error: any) {
      console.error('Quality evaluation error:', error);
      toast({
        title: 'Evaluation failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      if (!isEvaluating) return; // Prevent setting to false if recursion is happening
      setIsEvaluating(false);
      setTranslationProgress('');
    }
  }

  // Enhanced evaluation with progress tracking and auto-resume
  async function handleEvaluateAllLanguages() {
    setIsEvaluating(true);
    
    try {
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');
      
      if (targetLanguages.length === 0) {
        toast({ title: 'No target languages enabled', variant: 'destructive' });
        return;
      }

      // Check progress to determine which languages need evaluation
      const { data: progressData } = await supabase
        .from('evaluation_progress')
        .select('*')
        .neq('language_code', 'en');

      const completedLanguages = new Set(
        progressData?.filter(p => p.status === 'completed').map(p => p.language_code) || []
      );

      const inProgressLanguages = progressData?.filter(p => p.status === 'in_progress') || [];

      const pendingLanguages = targetLanguages.filter(l => !completedLanguages.has(l.code));
      const skippedCount = targetLanguages.length - pendingLanguages.length;

      if (skippedCount > 0) {
        toast({
          title: `Skipping ${skippedCount} completed languages`,
          description: 'Will only evaluate pending languages',
          duration: 5000
        });
      }

      if (pendingLanguages.length === 0) {
        toast({
          title: 'All languages already evaluated!',
          description: 'Use individual "Restart Evaluation" buttons to re-evaluate',
          duration: 5000
        });
        return;
      }

      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < pendingLanguages.length; i++) {
        const lang = pendingLanguages[i];
        const inProgress = inProgressLanguages.find(p => p.language_code === lang.code);
        
        const progressMsg = inProgress
          ? `Resuming ${lang.name} from ${inProgress.evaluated_keys}/${inProgress.total_keys} (${i + 1}/${pendingLanguages.length})...`
          : `Evaluating ${lang.name} (${i + 1}/${pendingLanguages.length})...`;
        
        setTranslationProgress(progressMsg);

        try {
          // Use the enhanced evaluation function with auto-resume
          await handleEvaluateQuality(lang.code, inProgress?.last_evaluated_key || null);

          successCount++;

        } catch (error: any) {
          failureCount++;
          console.error(`Error evaluating ${lang.name}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : String(error);
          const isTimeout = errorMessage.toLowerCase().includes('timeout') || 
                           errorMessage.toLowerCase().includes('timed out');
          
          toast({
            title: `${lang.name} evaluation ${isTimeout ? 'paused' : 'failed'}`,
            description: errorMessage || 'An unexpected error occurred',
            variant: isTimeout ? 'default' : 'destructive',
            duration: 8000
          });

          // If timeout, break the loop so user can restart
          if (isTimeout) {
            toast({
              title: 'Evaluation paused',
              description: `Completed ${successCount}/${pendingLanguages.length}. Click "Evaluate All Languages" to continue.`,
              duration: 10000
            });
            break;
          }
        }

        // Small delay between languages
        if (i < pendingLanguages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (successCount === pendingLanguages.length) {
        toast({
          title: '🎉 All quality evaluations complete!',
          description: `Successfully evaluated ${successCount} languages with 2-stage AI validation`,
          duration: 8000
        });
      } else if (successCount > 0) {
        toast({
          title: 'Partial completion',
          description: `Evaluated ${successCount}/${pendingLanguages.length} languages. ${failureCount} failed or timed out.`,
          duration: 8000
        });
      }

    } catch (error: any) {
      console.error('Bulk evaluation error:', error);
      toast({
        title: 'Evaluation failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
        duration: 8000
      });
    } finally {
      setIsEvaluating(false);
      setTranslationProgress('');
    }
  }

  async function handleAddTranslation() {
    if (!newKey || !newText) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    // Add for English first
    const { error } = await supabase
      .from('translations')
      .insert({
        translation_key: newKey,
        language_code: 'en',
        translated_text: newText,
        approved: true,
        page_location: newPageLocation,
      });

    if (error) {
      toast({ title: 'Error adding translation', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Translation added successfully' });
      setNewKey('');
      setNewText('');
      setNewPageLocation('homepage');
      setIsAddDialogOpen(false);
      loadData();
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Translation Manager</h2>
        <p className="text-muted-foreground mb-6">
          Manage translations across all languages. AI-translate, review, and approve content.
        </p>

        {/* Language Settings Section */}
        <Collapsible className="mb-6">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="mb-4">
              Language Settings
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <LanguageSettings />
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Translation Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Translation Key</DialogTitle>
                <DialogDescription>
                  Create a new translation key with English text. Other languages can be AI-translated later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="key">Translation Key</Label>
                  <Input
                    id="key"
                    placeholder="e.g. hero.title"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="text">English Text</Label>
                  <Textarea
                    id="text"
                    placeholder="Enter the English text..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Page Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. homepage, contact, pricing"
                    value={newPageLocation}
                    onChange={(e) => setNewPageLocation(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTranslation}>Add Translation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            onClick={handleSyncKeys} 
            disabled={isSyncing}
            size="lg"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Sync Translation Keys
              </>
            )}
          </Button>

          <Button 
            onClick={handleTranslateAll} 
            disabled={isTranslating || isEvaluating}
            size="lg"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                AI Translate All Languages
              </>
            )}
          </Button>

          <Button 
            onClick={handleEvaluateAllLanguages} 
            disabled={isTranslating || isEvaluating}
            size="lg"
            variant="secondary"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Evaluate All Languages
              </>
            )}
          </Button>
        </div>

        {translationProgress && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{translationProgress}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat: any) => {
            const Flag = (Flags as any)[languages.find(l => l.code === stat.code)?.flag_code];
            const avgQuality = stat.avg_quality_score ? Math.round(stat.avg_quality_score) : null;
            const qualityColor = avgQuality >= 85 ? 'text-green-600' : avgQuality >= 70 ? 'text-yellow-600' : avgQuality ? 'text-red-600' : 'text-muted-foreground';
            
            return (
              <Card key={stat.code}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    {Flag && <Flag className="w-6 h-4" />}
                    <span className="font-semibold">{stat.name}</span>
                  </div>
                  <div className="text-2xl font-bold">{stat.approved_translations}/{stat.total_translations}</div>
                  <div className="text-sm text-muted-foreground">{stat.approval_percentage}% approved</div>
                  {avgQuality && (
                    <div className={cn("text-sm font-medium mt-1", qualityColor)}>
                      Quality: {avgQuality}%
                    </div>
                  )}
                  {stat.needs_review_count > 0 && (
                    <div className="text-xs text-orange-600 mt-1">
                      {stat.needs_review_count} need review
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Approve All Confirmation Dialog */}
      <AlertDialog open={approveAllLanguage !== null} onOpenChange={(open) => !open && setApproveAllLanguage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve all translations?</AlertDialogTitle>
            <AlertDialogDescription>
              {approveAllLanguage && (() => {
                const lang = languages.find(l => l.code === approveAllLanguage);
                const stat = stats.find(s => s.code === approveAllLanguage);
                const unapprovedCount = stat ? stat.total_translations - stat.approved_translations : 0;
                const Flag = lang ? (Flags as any)[lang.flag_code] : null;
                
                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {Flag && <Flag className="w-6 h-4" />}
                      <span className="font-semibold">{lang?.name}</span>
                    </div>
                    <p>
                      This will mark <strong>{unapprovedCount} translation{unapprovedCount !== 1 ? 's' : ''}</strong> as approved. 
                      You can still edit them later if needed.
                    </p>
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApprovingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => approveAllLanguage && handleApproveAll(approveAllLanguage)}
              disabled={isApprovingAll}
            >
              {isApprovingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve All'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quality Evaluation Dialog */}
      <AlertDialog open={showQualityDialog} onOpenChange={setShowQualityDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Translation Complete!</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  {completedLanguageName} translation is complete with {translatedCount} translations saved.
                </p>
                <p>
                  Would you like to evaluate translation quality now? This will check accuracy, tone, grammar, and cultural fit.
                </p>
                <p className="text-xs text-muted-foreground">
                  Takes ~2-3 minutes. You can also evaluate later from the language tab.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Skip for now</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowQualityDialog(false);
              handleEvaluateQuality(completedLanguage);
            }}>
              <Sparkles className="w-4 h-4 mr-2" />
              Evaluate Quality
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Language Tabs */}
      <Tabs value={selectedLang} onValueChange={setSelectedLang}>
        <TabsList className="flex-wrap h-auto">
          {languages.map((lang) => {
            const Flag = (Flags as any)[lang.flag_code];
            return (
              <TabsTrigger key={lang.code} value={lang.code} className="flex items-center gap-2">
                {Flag && <Flag className="w-5 h-3" />}
                {lang.native_name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {languages.map((lang) => {
          const langStat = stats.find(s => s.code === lang.code);
          const unapprovedCount = langStat ? langStat.total_translations - langStat.approved_translations : 0;
          const emptyCount = hasEmptyTranslations(lang.code);
          
          return (
            <TabsContent key={lang.code} value={lang.code}>
              <div className="mb-4 space-y-3">
                {/* Search and Approve All Row */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search translation keys..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="flex-1"
                  />
                  {unapprovedCount > 0 && (
                    <Button 
                      variant={emptyCount > 0 ? "destructive" : "outline"}
                      onClick={() => setApproveAllLanguage(lang.code)}
                      disabled={isApprovingAll || emptyCount > 0}
                    >
                      {emptyCount > 0 ? (
                        <>
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          {emptyCount} Empty
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Approve All ({unapprovedCount})
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Quality-Based Actions Row */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApproveHighQuality(lang.code)}
                    disabled={isApprovingAll}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-Approve Quality (≥85%)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFlagLowQuality(lang.code)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Flag Low Quality (&lt;70%)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportTranslations(lang.code)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Export JSON
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEvaluateQuality(lang.code)}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Evaluate Quality
                      </>
                    )}
                  </Button>
                </div>

                {/* Filter Options Row */}
                <div className="flex gap-2 flex-wrap">
                  {/* Show Empty Toggle */}
                  <Button
                    variant={showEmptyOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEmptyOnly(!showEmptyOnly)}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {showEmptyOnly ? "Show All" : "Show Empty Only"}
                  </Button>

                  {/* Quality Filter */}
                  <Select value={qualityFilter} onValueChange={setQualityFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue placeholder="Filter by quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Quality</SelectItem>
                      <SelectItem value="high">High (≥85%)</SelectItem>
                      <SelectItem value="medium">Medium (70-84%)</SelectItem>
                      <SelectItem value="low">Low (&lt;70%)</SelectItem>
                      <SelectItem value="needs_review">Needs Review</SelectItem>
                      <SelectItem value="technical_terms">Technical Terms Issues</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Page Location Filter */}
                  <Select value={pageLocationFilter} onValueChange={setPageLocationFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Filter by page" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      {uniquePageLocations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Context Filter */}
                  {uniqueContexts.length > 0 && (
                    <Select value={contextFilter} onValueChange={setContextFilter}>
                      <SelectTrigger className="w-[200px] h-9">
                        <SelectValue placeholder="Filter by component" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Components</SelectItem>
                        {uniqueContexts.map(context => (
                          <SelectItem key={context} value={context}>
                            {context}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Active Filters Count */}
                  {(showEmptyOnly || pageLocationFilter !== 'all' || contextFilter !== 'all' || qualityFilter !== 'all') && (
                    <Badge variant="secondary" className="h-9 px-3 flex items-center">
                      {filteredTranslations.length} result{filteredTranslations.length !== 1 ? 's' : ''}
                    </Badge>
                  )}

                  {/* Clear Filters */}
                  {(showEmptyOnly || pageLocationFilter !== 'all' || contextFilter !== 'all' || qualityFilter !== 'all' || searchFilter) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowEmptyOnly(false);
                        setPageLocationFilter('all');
                        setContextFilter('all');
                        setQualityFilter('all');
                        setSearchFilter('');
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

            <div className="space-y-4">
              {filteredTranslations.map((translation) => (
                <Card key={translation.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-base font-mono">{translation.translation_key}</span>
                      <div className="flex gap-2">
                        {translation.quality_score && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              translation.quality_score >= 85 ? "border-green-600 text-green-600" :
                              translation.quality_score >= 70 ? "border-yellow-600 text-yellow-600" :
                              "border-red-600 text-red-600"
                            )}
                          >
                            Quality: {translation.quality_score}%
                          </Badge>
                        )}
                        {translation.review_status === 'needs_review' && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Needs Review
                          </Badge>
                        )}
                        {translation.approved ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="w-3 h-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        <Badge variant="outline">{translation.page_location}</Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* English Source Text */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">
                          English (Source)
                        </Label>
                        <div className="rounded-md bg-muted/50 p-3 font-mono text-sm text-muted-foreground border border-border">
                          {getEnglishText(translation.translation_key) || 'No English text found'}
                        </div>
                      </div>

                      {/* Translation Input */}
                      <div className="space-y-2">
                        <Label htmlFor={`translation-${translation.id}`}>
                          {languages.find(l => l.code === selectedLang)?.name || selectedLang} Translation
                        </Label>
                        <Textarea
                          id={`translation-${translation.id}`}
                          value={translation.translated_text}
                          onChange={(e) => handleUpdate(translation.id, e.target.value)}
                          className={cn(
                            "font-mono text-sm",
                            !translation.translated_text?.trim() && "border-destructive border-2"
                          )}
                          rows={3}
                        />
                        {!translation.translated_text?.trim() && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Translation text is empty - please add content before approving
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Technical Term Issues Warning */}
                    {translation.quality_metrics?.technical_term_issues && 
                     translation.quality_metrics.technical_term_issues.length > 0 && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Technical Terms Incorrectly Translated</AlertTitle>
                        <AlertDescription className="space-y-2">
                          {translation.quality_metrics.technical_term_issues.map((issue: any, idx: number) => (
                            <div key={idx} className="border-l-2 border-red-400 pl-3 py-1 text-sm">
                              <div className="font-semibold">
                                <span className="text-red-600">{issue.term_original}</span> → {issue.term_translated}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <strong>Should be:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{issue.suggestion}</code>
                              </div>
                              {issue.confidence && (
                                <Badge 
                                  variant={issue.confidence === 'high' ? 'destructive' : 'secondary'} 
                                  className="text-xs mt-1"
                                >
                                  {issue.confidence} confidence
                                  {issue.validated_by_stage2 && ' (AI validated)'}
                                </Badge>
                              )}
                              {issue.deep_reasoning && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  <strong>Reasoning:</strong> {issue.deep_reasoning}
                                </div>
                              )}
                              {issue.industry_standard && (
                                <div className="text-xs text-green-700 dark:text-green-400 mt-1">
                                  <strong>Industry standard:</strong> {issue.industry_standard}
                                </div>
                              )}
                            </div>
                          ))}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Quality Metrics Collapsible */}
                    {translation.quality_metrics && (
                      <Collapsible className="mb-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                            View Quality Analysis →
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-md space-y-2">
                          <div className="text-xs">
                            <div className="font-semibold mb-1">Score: {translation.quality_score}%</div>
                            {translation.quality_metrics.strengths?.length > 0 && (
                              <div className="mb-2">
                                <div className="font-medium text-green-600">✓ Strengths:</div>
                                <ul className="list-disc list-inside pl-2">
                                  {translation.quality_metrics.strengths.map((s: string, i: number) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {translation.quality_metrics.issues?.length > 0 && (
                              <div>
                                <div className="font-medium text-orange-600">⚠ Issues:</div>
                                <ul className="list-disc list-inside pl-2">
                                  {translation.quality_metrics.issues.map((issue: string, i: number) => (
                                    <li key={i}>{issue}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleApprove(translation.id)}
                        disabled={translation.approved}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleReject(translation.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
