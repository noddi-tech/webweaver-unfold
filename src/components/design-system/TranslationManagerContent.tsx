import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Upload, Loader2, Plus, RefreshCw, AlertTriangle, Sparkles, Search, CheckCircle2, Clock, TrendingUp, TrendingDown, AlertCircle, FileText, Code, RotateCcw } from 'lucide-react';
import * as Flags from 'country-flag-icons/react/3x2';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
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
import EvaluationControls from './EvaluationControls';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslationStats } from '@/hooks/useTranslationStats';
import LanguageStatsTable from './LanguageStatsTable';

export default function TranslationManagerContent() {
  const { toast } = useToast();
  const { stats: sharedStats, pageMetaStats, evaluationProgress, refresh: refreshStats } = useTranslationStats();
  const [languages, setLanguages] = useState<any[]>([]);
  const [translations, setTranslations] = useState<any[]>([]);
  const [englishTranslations, setEnglishTranslations] = useState<any[]>([]);
  const [selectedLang, setSelectedLang] = useState('en');
  const [searchFilter, setSearchFilter] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');
  const [newPageLocation, setNewPageLocation] = useState('homepage');
  const [isSyncing, setIsSyncing] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<string>('');
  const [isApprovingAll, setIsApprovingAll] = useState(false);
  const [approveAllLanguage, setApproveAllLanguage] = useState<string | null>(null);
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  const [showMissingOnly, setShowMissingOnly] = useState(false);
  const [pageLocationFilter, setPageLocationFilter] = useState<string>('all');
  const [contextFilter, setContextFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all'); // all, high (>=85), medium (70-84), low (<70)
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [completedLanguage, setCompletedLanguage] = useState<string>('');
  const [completedLanguageName, setCompletedLanguageName] = useState<string>('');
  const [translatedCount, setTranslatedCount] = useState<number>(0);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const updateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [tovContent, setTovContent] = useState<string>('');
  const [isResettingStuck, setIsResettingStuck] = useState(false);
  const [isRefiningBulk, setIsRefiningBulk] = useState(false);
  const [bulkRefineProgress, setBulkRefineProgress] = useState({ current: 0, total: 0 });
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('all'); // 'all', 'pending', 'approved'
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isSyncingVisibility, setIsSyncingVisibility] = useState(false);

  // Load saved filters on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('translation-filters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setApprovalStatusFilter(filters.approvalStatusFilter || 'all');
        setQualityFilter(filters.qualityFilter || 'all');
        setPageLocationFilter(filters.pageLocationFilter || 'all');
        setContextFilter(filters.contextFilter || 'all');
        setShowEmptyOnly(filters.showEmptyOnly || false);
      } catch (e) {
        console.error('Failed to load saved filters', e);
      }
    }
  }, []);

  // Save filters whenever they change
  useEffect(() => {
    const filters = {
      approvalStatusFilter,
      qualityFilter,
      pageLocationFilter,
      contextFilter,
      showEmptyOnly,
    };
    localStorage.setItem('translation-filters', JSON.stringify(filters));
  }, [approvalStatusFilter, qualityFilter, pageLocationFilter, contextFilter, showEmptyOnly]);

  useEffect(() => {
    loadData();
    
    // Load TOV content
    fetch('/content/brand/tov-noddi-tech.md')
      .then(res => res.text())
      .then(setTovContent)
      .catch(console.error);
  }, [selectedLang]); // Reload when language changes

  async function loadData() {
    // Load languages with show_in_switcher
    const { data: langs } = await supabase.from('languages').select('*').order('sort_order');
    
    // Only load English translations + currently selected language (much faster!)
    const { data: trans } = await supabase
      .from('translations')
      .select('*')
      .in('language_code', ['en', selectedLang])
      .order('translation_key');
    
    if (langs) setLanguages(langs);
    
    if (trans) {
      setTranslations(trans);
      setEnglishTranslations(trans.filter(t => t.language_code === 'en'));
    }
    
    // Refresh shared stats after loading
    refreshStats();
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

  // Helper function to get missing translations count
  const getMissingTranslationsCount = (languageCode: string): number => {
    if (languageCode === 'en') return 0;
    
    const englishKeys = new Set(englishTranslations.map(t => t.translation_key));
    const existingKeys = new Set(
      translations
        .filter(t => t.language_code === languageCode)
        .map(t => t.translation_key)
    );
    
    return Array.from(englishKeys).filter(key => !existingKeys.has(key)).length;
  };

  // Multi-filter logic - if showing missing only, generate virtual translations
  const filteredTranslations = (() => {
    // Handle missing only filter first
    if (showMissingOnly && selectedLang !== 'en') {
      const englishKeys = new Set(englishTranslations.map(t => t.translation_key));
      const existingKeys = new Set(
        translations
          .filter(t => t.language_code === selectedLang)
          .map(t => t.translation_key)
      );
      
      const missingKeys = Array.from(englishKeys).filter(key => !existingKeys.has(key));
      
      return missingKeys.map(key => {
        const englishTrans = englishTranslations.find(t => t.translation_key === key);
        return {
          id: `missing-${key}`,
          translation_key: key,
          language_code: selectedLang,
          translated_text: '',
          approved: false,
          quality_score: null,
          context: englishTrans?.context || null,
          page_location: englishTrans?.page_location || null,
          review_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      });
    }
    
    // Normal filtering
    return translations.filter(t => {
    // Language filter
    if (t.language_code !== selectedLang) return false;
    
    // Approval status filter
    if (approvalStatusFilter === 'pending' && t.approved) return false;
    if (approvalStatusFilter === 'approved' && !t.approved) return false;
    
    // Search filter - search in translation key, translated text, AND English source
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase();
      const keyMatch = t.translation_key.toLowerCase().includes(searchLower);
      const textMatch = t.translated_text?.toLowerCase().includes(searchLower);
      const englishMatch = getEnglishText(t.translation_key).toLowerCase().includes(searchLower);
      
      if (!keyMatch && !textMatch && !englishMatch) {
        return false;
      }
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
  })();

  // Apply smart preset filters
  function applyPreset(preset: string) {
    setActivePreset(preset);
    
    switch(preset) {
      case 'needs_attention':
        setApprovalStatusFilter('pending');
        setQualityFilter('all');
        setShowEmptyOnly(false);
        setShowMissingOnly(false);
        break;
      case 'ready_to_approve':
        setApprovalStatusFilter('pending');
        setQualityFilter('high');
        setShowEmptyOnly(false);
        setShowMissingOnly(false);
        break;
      case 'low_quality':
        setApprovalStatusFilter('all');
        setQualityFilter('low');
        setShowEmptyOnly(false);
        setShowMissingOnly(false);
        break;
      case 'recently_translated':
        setApprovalStatusFilter('pending');
        setQualityFilter('all');
        setShowEmptyOnly(false);
        setShowMissingOnly(false);
        break;
    }
  }

  // Bulk approve filtered translations
  async function handleBulkApprove(translations: any[]) {
    setIsApprovingAll(true);
    try {
      const ids = translations.filter(t => !t.approved).map(t => t.id);
      if (ids.length === 0) {
        toast({ title: 'No pending translations to approve' });
        return;
      }

      const { error } = await supabase
        .from('translations')
        .update({ approved: true, approved_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;

      toast({ 
        title: 'Bulk approval complete!',
        description: `Approved ${ids.length} translation${ids.length !== 1 ? 's' : ''}`
      });
      loadData();
    } catch (error: any) {
      toast({ title: 'Bulk approval failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsApprovingAll(false);
    }
  }

  // Bulk evaluate filtered translations
  async function handleBulkEvaluate(translations: any[]) {
    setIsEvaluating(true);
    try {
      const keys = translations.map(t => t.translation_key);
      
      const { error } = await supabase.functions.invoke('evaluate-translation-quality', {
        body: { 
          languageCode: selectedLang,
          translationKeys: keys
        }
      });

      if (error) throw error;

      toast({ 
        title: 'Bulk evaluation queued!',
        description: `Evaluating ${keys.length} translation${keys.length !== 1 ? 's' : ''}`
      });
      
      setTimeout(loadData, 2000);
    } catch (error: any) {
      toast({ title: 'Bulk evaluation failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsEvaluating(false);
    }
  }

  // Bulk refine filtered translations
  async function handleBulkRefine(translations: any[]) {
    setIsRefiningBulk(true);
    setBulkRefineProgress({ current: 0, total: 0 });
    
    try {
      const filtered = translations.filter(t => !t.approved);

      if (filtered.length === 0) {
        toast({ 
          title: 'No translations to refine',
          description: 'All filtered translations are already approved.'
        });
        return;
      }

      const total = filtered.length;
      setBulkRefineProgress({ current: 0, total });

      toast({
        title: 'Starting bulk refinement',
        description: `Refining ${total} translations...`,
        duration: 3000
      });

      // Process in small batches to avoid rate limits
      const BATCH_SIZE = 5;
      let refined = 0;
      let failed = 0;

      for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
        const batch = filtered.slice(i, Math.min(i + BATCH_SIZE, filtered.length));
        
        // Refine batch in parallel
        const refinePromises = batch.map(async (trans) => {
          try {
            const { data, error } = await supabase.functions.invoke('refine-translation', {
              body: {
                englishText: getEnglishText(trans.translation_key),
                currentTranslation: trans.translated_text,
                targetLanguage: selectedLang,
                targetLanguageName: languages.find(l => l.code === selectedLang)?.name,
                context: trans.context,
                pageLocation: trans.page_location,
                tovContent
              }
            });

            if (error) throw error;

            // Update translation
            await supabase
              .from('translations')
              .update({ 
                translated_text: data.refinedText,
                approved: false 
              })
              .eq('id', trans.id);

            return { success: true, key: trans.translation_key };
          } catch (err) {
            console.error('Refine failed for', trans.translation_key, err);
            return { success: false, key: trans.translation_key };
          }
        });

        const results = await Promise.all(refinePromises);
        refined += results.filter(r => r.success).length;
        failed += results.filter(r => !r.success).length;
        
        setBulkRefineProgress({ current: i + batch.length, total });

        // Small delay between batches
        if (i + BATCH_SIZE < filtered.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      toast({
        title: 'Bulk refinement complete!',
        description: `Refined ${refined} translations${failed > 0 ? `, ${failed} failed` : ''}`,
        duration: 5000
      });

      await loadData();
    } catch (error: any) {
      toast({ 
        title: 'Bulk refinement failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsRefiningBulk(false);
      setBulkRefineProgress({ current: 0, total: 0 });
    }
  }

  // Debug logging
  console.log('Translation Search Debug:', {
    searchFilter,
    selectedLang,
    totalTranslations: translations.length,
    afterLangFilter: translations.filter(t => t.language_code === selectedLang).length,
    afterSearchFilter: searchFilter ? translations.filter(t => {
      if (t.language_code !== selectedLang) return false;
      const searchLower = searchFilter.toLowerCase();
      const keyMatch = t.translation_key.toLowerCase().includes(searchLower);
      const textMatch = t.translated_text?.toLowerCase().includes(searchLower);
      const englishMatch = getEnglishText(t.translation_key).toLowerCase().includes(searchLower);
      return keyMatch || textMatch || englishMatch;
    }).length : 'N/A',
    finalFiltered: filteredTranslations.length,
    sampleMatches: searchFilter ? translations
      .filter(t => t.language_code === selectedLang)
      .filter(t => {
        const searchLower = searchFilter.toLowerCase();
        const textMatch = t.translated_text?.toLowerCase().includes(searchLower);
        return textMatch;
      })
      .slice(0, 3)
      .map(t => ({ key: t.translation_key, text: t.translated_text?.substring(0, 50) }))
      : []
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

  async function handleTranslateMissing(languageCode: string) {
    const englishKeys = new Set(englishTranslations.map(t => t.translation_key));
    const existingKeys = new Set(
      translations
        .filter(t => t.language_code === languageCode)
        .map(t => t.translation_key)
    );
    
    const missingKeys = Array.from(englishKeys).filter(key => !existingKeys.has(key));
    
    if (missingKeys.length === 0) {
      toast({ title: 'No missing translations!', description: 'All keys are already translated for this language' });
      return;
    }

    const targetLang = languages.find(l => l.code === languageCode);
    if (!targetLang) return;

    toast({ 
      title: `Translating ${missingKeys.length} missing keys...`,
      description: `Target language: ${targetLang.name}`
    });
    setIsTranslating(true);

    try {
      // Call translate-content edge function with correct payload format
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          translationKeys: missingKeys,
          targetLanguage: languageCode,
          sourceLanguage: 'en'
        }
      });

      if (error) throw error;

      const result = data as { translated: number; failed: number };
      
      toast({ 
        title: 'Translation complete!',
        description: `Successfully translated ${result.translated} of ${missingKeys.length} missing keys to ${targetLang.name}`
      });
      await loadData();
    } catch (error: any) {
      console.error('Translation error:', error);
      toast({ 
        title: 'Translation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
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

  async function handleToggleSwitcher(languageCode: string, languageName: string, currentValue: boolean) {
    const newValue = !currentValue;
    
    // Optimistic update
    setLanguages(prev => prev.map(l => 
      l.code === languageCode ? { ...l, show_in_switcher: newValue } : l
    ));

    const { error } = await supabase
      .from('languages')
      .update({ show_in_switcher: newValue })
      .eq('code', languageCode);

    if (error) {
      // Revert on error
      setLanguages(prev => prev.map(l => 
        l.code === languageCode ? { ...l, show_in_switcher: currentValue } : l
      ));
      toast({
        title: 'Error updating language',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Language visibility updated',
        description: `${languageName} ${newValue ? 'will show' : 'is hidden'} in language switcher`,
      });
    }
  }

  async function handleSyncLanguageVisibility() {
    setIsSyncingVisibility(true);
    try {
      const { error } = await supabase.rpc('sync_language_visibility');
      
      if (error) throw error;
      
      // Reload data to reflect changes
      await loadData();
      await refreshStats();
      
      toast({
        title: 'Language visibility synced',
        description: 'Languages automatically shown/hidden based on approval rates (95% threshold)',
      });
    } catch (error: any) {
      toast({
        title: 'Sync failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSyncingVisibility(false);
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

  async function handleTranslateMissingOnly() {
    setIsTranslating(true);
    
    try {
      // Get enabled languages (except English)
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');

      if (targetLanguages.length === 0) {
        toast({ title: 'No target languages enabled', variant: 'destructive' });
        return;
      }

      // Fetch fresh, unfiltered translations from database to accurately detect missing keys
      const { data: allTranslations, error: fetchError } = await supabase
        .from('translations')
        .select('translation_key, language_code');

      if (fetchError) throw fetchError;

      // Calculate missing keys for each language
      const englishKeys = new Set(englishTranslations.map(t => t.translation_key));
      const languageStats = targetLanguages.map(lang => {
        const existingKeys = new Set(
          (allTranslations || [])
            .filter(t => t.language_code === lang.code)
            .map(t => t.translation_key)
        );
        const missingKeys = Array.from(englishKeys).filter(key => !existingKeys.has(key));
        return { lang, missingKeys };
      }).filter(stat => stat.missingKeys.length > 0);

      if (languageStats.length === 0) {
        toast({ 
          title: 'Nothing to translate!', 
          description: 'All languages have all translation keys'
        });
        return;
      }

      const totalMissing = languageStats.reduce((sum, stat) => sum + stat.missingKeys.length, 0);
      
      toast({
        title: `Translating ${totalMissing} missing keys across ${languageStats.length} languages`,
        description: 'This may take a few minutes...',
        duration: 5000
      });

      let totalTranslated = 0;
      const results = [];

      for (let i = 0; i < languageStats.length; i++) {
        const { lang, missingKeys } = languageStats[i];
        
        setTranslationProgress(
          `Translating ${lang.name} (${i + 1}/${languageStats.length}): ${missingKeys.length} missing keys...`
        );

        try {
          const { data, error } = await supabase.functions.invoke('translate-content', {
            body: {
              translationKeys: missingKeys,
              targetLanguage: lang.code,
              sourceLanguage: 'en'
            }
          });

          if (error) throw error;

          totalTranslated += data.translated || 0;
          results.push({ lang: lang.name, translated: data.translated, failed: data.failed });

          toast({
            title: `${lang.name} complete`,
            description: `Translated ${data.translated || 0} missing keys${data.failed > 0 ? `, ${data.failed} failed` : ''}`,
            duration: 3000
          });

          await loadData();

          // Small delay between languages
          if (i < languageStats.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error: any) {
          console.error(`Error translating ${lang.name}:`, error);
          results.push({ lang: lang.name, error: error.message });
          
          if (error.message?.includes('429') || error.message?.includes('402')) {
            toast({
              title: `${lang.name}: ${error.message.includes('429') ? 'Rate limit' : 'Credits required'}`,
              description: error.message.includes('429') 
                ? 'Waiting 30 seconds...' 
                : 'Please add Lovable AI credits',
              variant: 'destructive'
            });
            if (error.message.includes('429')) {
              await new Promise(resolve => setTimeout(resolve, 30000));
            }
          }
        }
      }

      toast({
        title: '✅ Missing translations complete!',
        description: `Successfully translated ${totalTranslated} keys across ${languageStats.length} languages`,
        duration: 8000
      });

    } catch (error: any) {
      toast({
        title: 'Translation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
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

  function handleLocalUpdate(id: string, newText: string) {
    // Update local state immediately for smooth typing
    setEditingValues(prev => ({ ...prev, [id]: newText }));
    
    // Clear existing timeout
    if (updateTimeouts.current[id]) {
      clearTimeout(updateTimeouts.current[id]);
    }
    
    // Debounce database update (1 second after typing stops)
    updateTimeouts.current[id] = setTimeout(async () => {
      const { error } = await supabase
        .from('translations')
        .update({ translated_text: newText, approved: false })
        .eq('id', id);

      if (error) {
        toast({ title: 'Error saving', variant: 'destructive' });
      } else {
        // Silent save - no reload, update local state
        setTranslations(prev => 
          prev.map(t => t.id === id ? { ...t, translated_text: newText, approved: false } : t)
        );
        setEditingValues(prev => {
          const newVals = { ...prev };
          delete newVals[id];
          return newVals;
        });
      }
    }, 1000);
  }

  async function handleAIRefine(translation: any) {
    setRefiningId(translation.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('refine-translation', {
        body: {
          englishText: getEnglishText(translation.translation_key),
          currentTranslation: translation.translated_text,
          targetLanguage: translation.language_code,
          targetLanguageName: languages.find(l => l.code === translation.language_code)?.name,
          context: translation.context,
          pageLocation: translation.page_location,
          tovContent
        }
      });

      if (error) throw error;

      // Update with refined text
      const { error: updateError } = await supabase
        .from('translations')
        .update({ 
          translated_text: data.refinedText,
          approved: false 
        })
        .eq('id', translation.id);

      if (updateError) throw updateError;

      // Evaluate quality for this single translation
      const { data: qualityData, error: qualityError } = await supabase.functions.invoke(
        'evaluate-single-translation',
        {
          body: {
            translationKey: translation.translation_key,
            languageCode: translation.language_code,
            originalText: getEnglishText(translation.translation_key),
            translatedText: data.refinedText
          }
        }
      );

      // Update local state immediately
      setTranslations(prev => 
        prev.map(t => 
          t.id === translation.id 
            ? { 
                ...t, 
                translated_text: data.refinedText, 
                approved: false,
                quality_score: qualityData?.qualityScore || t.quality_score,
                quality_metrics: qualityData?.qualityMetrics || t.quality_metrics
              }
            : t
        )
      );

      toast({ 
        title: 'Translation refined!',
        description: qualityError ? 'Quality score will be updated shortly' : `Quality score: ${qualityData?.qualityScore || 'N/A'}%`,
        duration: 5000
      });

    } catch (error: any) {
      toast({ 
        title: 'AI refinement failed', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setRefiningId(null);
    }
  }

  async function handleAIRefineSelected(languageCode: string) {
    setIsRefiningBulk(true);
    setBulkRefineProgress({ current: 0, total: 0 });
    
    try {
      // Get filtered translations (respects current filters)
      const filtered = filteredTranslations.filter(t => 
        t.language_code === languageCode &&
        !t.approved // Only refine unapproved
      );

      if (filtered.length === 0) {
        toast({ 
          title: 'No translations to refine',
          description: 'All filtered translations are already approved.'
        });
        return;
      }

      const total = filtered.length;
      setBulkRefineProgress({ current: 0, total });

      toast({
        title: 'Starting bulk refinement',
        description: `Refining ${total} translations...`,
        duration: 3000
      });

      // Process in small batches to avoid rate limits
      const BATCH_SIZE = 5;
      let refined = 0;
      let failed = 0;

      for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
        const batch = filtered.slice(i, Math.min(i + BATCH_SIZE, filtered.length));
        
        // Refine batch in parallel
        const refinePromises = batch.map(async (trans) => {
          try {
            const { data, error } = await supabase.functions.invoke('refine-translation', {
              body: {
                englishText: getEnglishText(trans.translation_key),
                currentTranslation: trans.translated_text,
                targetLanguage: languageCode,
                targetLanguageName: languages.find(l => l.code === languageCode)?.name,
                context: trans.context,
                pageLocation: trans.page_location,
                tovContent
              }
            });

            if (error) throw error;

            // Update translation
            await supabase
              .from('translations')
              .update({ 
                translated_text: data.refinedText,
                approved: false 
              })
              .eq('id', trans.id);

            return { success: true, key: trans.translation_key };
          } catch (err) {
            console.error('Refine failed for', trans.translation_key, err);
            return { success: false, key: trans.translation_key };
          }
        });

        const results = await Promise.allSettled(refinePromises);
        
        results.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            refined++;
          } else {
            failed++;
          }
        });

        setBulkRefineProgress({ current: refined + failed, total });

        // Small delay between batches to avoid rate limiting
        if (i + BATCH_SIZE < filtered.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // After all refinements, show immediate results
      const langName = languages.find(l => l.code === languageCode)?.name || languageCode;
      
      toast({
        title: 'Bulk refinement complete!',
        description: `Refined ${refined} ${langName} translations${failed > 0 ? ` (${failed} failed)` : ''}. Quality evaluation running in background...`,
        duration: 6000
      });

      // Immediate refresh to show refined translations
      await loadData();

      // Trigger quality evaluation in background (non-blocking)
      handleEvaluateQuality(languageCode).then(() => {
        toast({
          title: 'Quality scores updated!',
          description: `${langName} translations have been re-evaluated.`,
          duration: 5000
        });
        loadData(); // Refresh again after evaluation completes
      }).catch(error => {
        console.error('Background quality evaluation failed:', error);
      });

    } catch (error: any) {
      toast({
        title: 'Bulk refinement failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsRefiningBulk(false);
      setBulkRefineProgress({ current: 0, total: 0 });
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
          : `Evaluated ${data.totalEvaluated}/${data.totalKeys} translations. Average: ${data.averageScore}% (${data.highQuality} high, ${data.mediumQuality} medium, ${data.lowQuality} low)`,
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

  // Find stuck evaluations
  async function findStuckEvaluations() {
    const { data: allProgress } = await supabase
      .from('evaluation_progress')
      .select('*');
    
    const now = Date.now();
    const stuckThreshold = 10 * 60 * 1000; // 10 minutes
    
    return allProgress?.filter(p => {
      if (p.status !== 'in_progress') return false;
      const lastUpdate = new Date(p.updated_at).getTime();
      const timeSinceUpdate = now - lastUpdate;
      // Stuck if: in_progress but no update for 10+ min OR at 0% for 5+ min
      return (timeSinceUpdate > stuckThreshold) || 
             (p.evaluated_keys === 0 && timeSinceUpdate > 5 * 60 * 1000);
    }) || [];
  }

  // Reset stuck evaluations
  async function resetStuckEvaluations() {
    setIsResettingStuck(true);
    
    try {
      const stuckLangs = await findStuckEvaluations();
      
      if (stuckLangs.length === 0) {
        toast({ title: 'No stuck evaluations found', variant: 'default' });
        return;
      }
      
      console.log('Resetting stuck evaluations:', stuckLangs.map(l => l.language_code));
      
      // Reset status to idle
      const { error } = await supabase
        .from('evaluation_progress')
        .update({ 
          status: 'idle',
          evaluated_keys: 0,
          last_evaluated_key: null,
          error_count: 0,
          last_error: null,
          error_message: null,
          updated_at: new Date().toISOString()
        })
        .in('language_code', stuckLangs.map(l => l.language_code));
      
      if (error) throw error;
      
      toast({ 
        title: `Reset ${stuckLangs.length} stuck evaluations`,
        description: 'You can now restart these languages'
      });
      
      loadData(); // Refresh UI
      
    } catch (error: any) {
      toast({ 
        title: 'Reset failed', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsResettingStuck(false);
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

  async function handleEvaluateIncomplete() {
    setIsEvaluating(true);
    
    try {
      const targetLanguages = languages.filter(l => l.enabled && l.code !== 'en');
      
      if (targetLanguages.length === 0) {
        toast({ title: 'No target languages enabled', variant: 'destructive' });
        return;
      }

      // Check progress to find incomplete languages
      const { data: progressData } = await supabase
        .from('evaluation_progress')
        .select('*')
        .neq('language_code', 'en');

      const completedLanguages = new Set(
        progressData?.filter(p => p.status === 'completed').map(p => p.language_code) || []
      );

      const incompleteLanguages = targetLanguages.filter(l => !completedLanguages.has(l.code));

      if (incompleteLanguages.length === 0) {
        toast({
          title: 'All languages already evaluated!',
          description: 'All enabled languages are at 100%',
          duration: 5000
        });
        return;
      }

      toast({
        title: `Evaluating ${incompleteLanguages.length} incomplete languages`,
        description: `Skipping ${targetLanguages.length - incompleteLanguages.length} completed languages`,
        duration: 3000
      });

      let successCount = 0;

      for (let i = 0; i < incompleteLanguages.length; i++) {
        const lang = incompleteLanguages[i];
        const inProgress = progressData?.find(p => p.language_code === lang.code);
        
        const progressMsg = inProgress
          ? `Resuming ${lang.name} from ${inProgress.evaluated_keys}/${inProgress.total_keys} (${i + 1}/${incompleteLanguages.length})...`
          : `Evaluating ${lang.name} (${i + 1}/${incompleteLanguages.length})...`;
        
        setTranslationProgress(progressMsg);

        try {
          await handleEvaluateQuality(lang.code, inProgress?.last_evaluated_key || null);
          successCount++;
        } catch (error: any) {
          console.error(`Error evaluating ${lang.name}:`, error);
          
          toast({
            title: `${lang.name} evaluation failed`,
            description: error.message,
            variant: 'destructive',
            duration: 5000
          });
        }

        // Small delay between languages
        if (i < incompleteLanguages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: 'Batch evaluation complete',
        description: `Successfully evaluated ${successCount}/${incompleteLanguages.length} languages`,
        duration: 8000
      });

    } catch (error: any) {
      toast({
        title: 'Evaluation failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsEvaluating(false);
      setTranslationProgress('');
      loadData();
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

        {/* Action Groups - Organized by Function */}
        <div className="space-y-6 mb-6">
          {/* Setup Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Setup & Sync</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
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
              </div>
            </CardContent>
          </Card>

          {/* Translation Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Translation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleTranslateMissingOnly} 
                  disabled={isTranslating || isEvaluating}
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI Translate Missing Only
                    </>
                  )}
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleTranslateAll} 
                        disabled={isTranslating || isEvaluating}
                        variant="outline"
                        className="border-orange-500/50 text-orange-600 hover:bg-orange-50"
                      >
                        {isTranslating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Translating...
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            AI Re-translate Everything
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-orange-100 border-orange-500">
                      <p className="font-semibold text-orange-900">⚠️ Warning: Overwrites ALL translations</p>
                      <p className="text-sm text-orange-800">Use "Translate Missing Only" instead</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {/* Evaluation Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleEvaluateIncomplete} 
                        disabled={isTranslating || isEvaluating}
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
                            Evaluate Incomplete
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Only evaluate languages not yet at 100%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleEvaluateAllLanguages} 
                        disabled={isTranslating || isEvaluating}
                        variant="outline"
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
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Re-evaluate all languages including completed ones</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  onClick={resetStuckEvaluations}
                  variant="outline"
                  disabled={isResettingStuck || isEvaluating}
                >
                  {isResettingStuck ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Reset Stuck Evaluations
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Language Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Language Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleSyncLanguageVisibility}
                        variant="outline"
                        disabled={isSyncingVisibility}
                        className="border-blue-500/50 text-blue-600 hover:bg-blue-50"
                      >
                        {isSyncingVisibility ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync Language Visibility
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-100 border-blue-500">
                      <p className="font-semibold text-blue-900">Auto-hide incomplete languages</p>
                      <p className="text-sm text-blue-800">Languages with &lt;95% approval will be hidden from switcher</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        </div>

        {translationProgress && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">{translationProgress}</p>
          </div>
        )}

        {/* Language Stats Table - Same as Overview */}
        <div className="mb-8">
          <LanguageStatsTable
            stats={sharedStats}
            pageMetaStats={pageMetaStats}
            evaluationProgress={evaluationProgress}
            englishCount={englishTranslations.length}
            onToggleSwitcher={handleToggleSwitcher}
            onRefresh={refreshStats}
          />
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
                const stat = sharedStats.find(s => s.code === approveAllLanguage);
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
          const langStat = sharedStats.find(s => s.code === lang.code);
          const unapprovedCount = langStat ? langStat.total_translations - langStat.approved_translations : 0;
          const emptyCount = hasEmptyTranslations(lang.code);
          
          return (
            <TabsContent key={lang.code} value={lang.code}>
              <div className="mb-4 space-y-3">
                {/* Search and Approve All Row */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search keys, translations, or English text..."
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
                    onClick={() => handleAIRefineSelected(lang.code)}
                    disabled={isRefiningBulk || isTranslating || filteredTranslations.filter(t => !t.approved).length === 0}
                  >
                    {isRefiningBulk ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Refining {bulkRefineProgress.current}/{bulkRefineProgress.total}...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Refine Selected ({filteredTranslations.filter(t => !t.approved).length})
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
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

                {/* Active Filter Pills */}
                {(searchFilter || approvalStatusFilter !== 'all' || qualityFilter !== 'all' || pageLocationFilter !== 'all' || contextFilter !== 'all' || showEmptyOnly) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {searchFilter && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSearchFilter('')}>
                        Search: "{searchFilter}"
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {approvalStatusFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setApprovalStatusFilter('all')}>
                        Status: {approvalStatusFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {qualityFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setQualityFilter('all')}>
                        Quality: {qualityFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {pageLocationFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPageLocationFilter('all')}>
                        Page: {pageLocationFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {contextFilter !== 'all' && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setContextFilter('all')}>
                        Context: {contextFilter}
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                    {showEmptyOnly && (
                      <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setShowEmptyOnly(false)}>
                        Empty only
                        <X className="w-3 h-3" />
                      </Badge>
                    )}
                  </div>
                )}

                {/* Smart Presets Section */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Quick Filters</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={activePreset === 'needs_attention' ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyPreset('needs_attention')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Needs Attention
                    </Button>
                    <Button
                      variant={activePreset === 'ready_to_approve' ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyPreset('ready_to_approve')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Ready to Approve
                    </Button>
                    <Button
                      variant={activePreset === 'low_quality' ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyPreset('low_quality')}
                    >
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Low Quality
                    </Button>
                    <Button
                      variant={activePreset === 'recently_translated' ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyPreset('recently_translated')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Recently Added
                    </Button>
                  </div>
                </div>

                {/* Filter Options Section */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Filter Options</Label>
                  <div className="flex gap-2 flex-wrap">
                    {/* Approval Status Filter */}
                    <Select value={approvalStatusFilter} onValueChange={setApprovalStatusFilter}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            All Status
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-orange-500" />
                            Pending Only
                          </div>
                        </SelectItem>
                        <SelectItem value="approved">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Approved Only
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Quality Filter */}
                    <Select value={qualityFilter} onValueChange={setQualityFilter}>
                      <SelectTrigger className="w-[180px] h-9">
                        <SelectValue placeholder="Filter by quality" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            All Quality
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            High (≥85%)
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-yellow-500" />
                            Medium (70-84%)
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            Low (&lt;70%)
                          </div>
                        </SelectItem>
                        <SelectItem value="needs_review">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            Needs Review
                          </div>
                        </SelectItem>
                        <SelectItem value="technical_terms">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-purple-500" />
                            Technical Terms Issues
                          </div>
                        </SelectItem>
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
                  </div>
                </div>

                {/* Actions Section */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Actions</Label>
                  <div className="flex gap-2 flex-wrap">
                    {/* Show Empty Toggle */}
                    <Button
                      variant={showEmptyOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setShowEmptyOnly(!showEmptyOnly);
                        if (!showEmptyOnly) setShowMissingOnly(false);
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Show Empty Only ({emptyCount})
                    </Button>
                    
                    {/* Show Missing Only */}
                    {lang.code !== 'en' && (
                      <>
                        <Button
                          variant={showMissingOnly ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setShowMissingOnly(!showMissingOnly);
                            if (!showMissingOnly) setShowEmptyOnly(false);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Show Missing Only ({getMissingTranslationsCount(lang.code)})
                        </Button>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleTranslateMissing(lang.code)}
                          disabled={isTranslating || getMissingTranslationsCount(lang.code) === 0}
                        >
                          {isTranslating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Translating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Translate {getMissingTranslationsCount(lang.code)} Missing
                            </>
                          )}
                        </Button>
                      </>
                    )}

                    {/* Reset to Defaults */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        localStorage.removeItem('translation-filters');
                        setApprovalStatusFilter('all');
                        setQualityFilter('all');
                        setPageLocationFilter('all');
                        setContextFilter('all');
                        setShowEmptyOnly(false);
                        setActivePreset(null);
                        toast({ title: 'Filters reset to defaults' });
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset to Defaults
                    </Button>

                    {/* Clear All Filters */}
                    {(approvalStatusFilter !== 'all' || showEmptyOnly || pageLocationFilter !== 'all' || contextFilter !== 'all' || qualityFilter !== 'all' || searchFilter) && (
                      <Button
                        variant={filteredTranslations.length === 0 ? "destructive" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setApprovalStatusFilter('all');
                          setShowEmptyOnly(false);
                          setPageLocationFilter('all');
                          setContextFilter('all');
                          setQualityFilter('all');
                          setSearchFilter('');
                          setActivePreset(null);
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear All Filters
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Results Counter */}
              {filteredTranslations.length > 0 && (
                <Card className="bg-muted/50 mb-4">
                  <CardContent className="py-2 px-3">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">
                          Showing {filteredTranslations.length} of {translations.filter(t => t.language_code === selectedLang).length}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-orange-500" />
                          {filteredTranslations.filter(t => !t.approved).length} pending
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-500" />
                          {filteredTranslations.filter(t => t.approved).length} approved
                        </span>
                        {filteredTranslations.some(t => t.quality_score) && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-blue-500" />
                            Avg: {Math.round(
                              filteredTranslations
                                .filter(t => t.quality_score)
                                .reduce((sum, t) => sum + t.quality_score, 0) / 
                              filteredTranslations.filter(t => t.quality_score).length
                            )}%
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bulk Actions Bar */}
              {filteredTranslations.length > 0 && approvalStatusFilter === 'pending' && filteredTranslations.some(t => !t.approved) && (
                <Card className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">
                            {filteredTranslations.filter(t => !t.approved).length} pending translation{filteredTranslations.filter(t => !t.approved).length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Select actions to perform on filtered results
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleBulkApprove(filteredTranslations)}
                          disabled={isApprovingAll}
                        >
                          {isApprovingAll ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Approve All ({filteredTranslations.filter(t => !t.approved).length})
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleBulkRefine(filteredTranslations)}
                          disabled={isRefiningBulk}
                        >
                          {isRefiningBulk ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Refining {bulkRefineProgress.current}/{bulkRefineProgress.total}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Refine All ({filteredTranslations.length})
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleBulkEvaluate(filteredTranslations)}
                          disabled={isEvaluating}
                        >
                          {isEvaluating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Evaluating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Re-evaluate All
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            <div className="space-y-4">
              {filteredTranslations.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center space-y-4">
                      {approvalStatusFilter === 'pending' && !searchFilter ? (
                        <>
                          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">All caught up! 🎉</h3>
                            <p className="text-muted-foreground mb-4">
                              No pending translations for {languages.find(l => l.code === selectedLang)?.name}
                            </p>
                            <Button
                              variant="default"
                              onClick={() => {
                                setApprovalStatusFilter('all');
                              }}
                            >
                              View All Translations
                            </Button>
                          </div>
                        </>
                      ) : qualityFilter === 'low' && !searchFilter ? (
                        <>
                          <TrendingUp className="w-12 h-12 mx-auto text-green-500" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Great quality! ✨</h3>
                            <p className="text-muted-foreground mb-4">
                              No low-quality translations found
                            </p>
                            <Button
                              variant="default"
                              onClick={() => setQualityFilter('all')}
                            >
                              View All Translations
                            </Button>
                          </div>
                        </>
                      ) : searchFilter ? (
                        <>
                          <Search className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                            <p className="text-muted-foreground mb-4">
                              No results for "{searchFilter}"
                            </p>
                            <div className="flex gap-2 justify-center">
                              <Button
                                variant="default"
                                onClick={() => setSearchFilter('')}
                              >
                                Clear Search
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setApprovalStatusFilter('all');
                                  setQualityFilter('all');
                                  setPageLocationFilter('all');
                                  setContextFilter('all');
                                  setShowEmptyOnly(false);
                                  setSearchFilter('');
                                  setActivePreset(null);
                                }}
                              >
                                Clear All Filters
                              </Button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">No translations found</h3>
                            <p className="text-muted-foreground mb-4">
                              Try adjusting your filters
                            </p>
                            <Button
                              variant="default"
                              onClick={() => {
                                setApprovalStatusFilter('all');
                                setShowEmptyOnly(false);
                                setPageLocationFilter('all');
                                setContextFilter('all');
                                setQualityFilter('all');
                                setSearchFilter('');
                                setActivePreset(null);
                              }}
                            >
                              Clear All Filters
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                filteredTranslations.map((translation) => (
                <Card 
                  key={translation.id}
                  className={cn(
                    "transition-all",
                    !translation.approved && "border-l-4 border-l-orange-500",
                    translation.approved && "border-l-4 border-l-green-500",
                    translation.quality_score && translation.quality_score < 70 && "border-l-4 border-l-red-500"
                  )}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          translation.approved ? "bg-green-500" : "bg-orange-500"
                        )} />
                        <span className="text-base font-mono">{translation.translation_key}</span>
                      </div>
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
                          value={editingValues[translation.id] ?? translation.translated_text}
                          onChange={(e) => handleLocalUpdate(translation.id, e.target.value)}
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
                    
                    <div className="flex gap-2 flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAIRefine(translation)}
                        disabled={refiningId === translation.id}
                      >
                        {refiningId === translation.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Refining...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-1" />
                            AI Refine
                          </>
                        )}
                      </Button>
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
              ))
              )}
            </div>
          </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
