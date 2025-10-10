import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EvaluationProgress {
  language_code: string;
  total_keys: number;
  evaluated_keys: number;
  last_evaluated_key: string | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
  status: 'idle' | 'in_progress' | 'completed' | 'paused' | 'error';
  error_message: string | null;
}

export function useEvaluationProgress(languageCode?: string) {
  const [progress, setProgress] = useState<EvaluationProgress | null>(null);
  const [allProgress, setAllProgress] = useState<EvaluationProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('evaluation_progress_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evaluation_progress',
          filter: languageCode ? `language_code=eq.${languageCode}` : undefined
        },
        () => {
          loadProgress();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [languageCode]);

  async function loadProgress() {
    try {
      if (languageCode) {
        const { data } = await supabase
          .from('evaluation_progress')
          .select('*')
          .eq('language_code', languageCode)
          .single();
        
        setProgress(data as EvaluationProgress | null);
      } else {
        const { data } = await supabase
          .from('evaluation_progress')
          .select('*')
          .order('updated_at', { ascending: false });
        
        setAllProgress((data || []) as EvaluationProgress[]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function startEvaluation(langCode: string, totalKeys: number) {
    const { error } = await supabase
      .from('evaluation_progress')
      .upsert({
        language_code: langCode,
        total_keys: totalKeys,
        evaluated_keys: 0,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

    if (!error) {
      loadProgress();
    }
    return { error };
  }

  async function updateProgress(langCode: string, evaluatedKeys: number, lastKey: string) {
    const { error } = await supabase
      .from('evaluation_progress')
      .update({
        evaluated_keys: evaluatedKeys,
        last_evaluated_key: lastKey,
        updated_at: new Date().toISOString(),
      })
      .eq('language_code', langCode);

    return { error };
  }

  async function completeEvaluation(langCode: string) {
    const { error } = await supabase
      .from('evaluation_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('language_code', langCode);

    if (!error) {
      loadProgress();
    }
    return { error };
  }

  async function pauseEvaluation(langCode: string) {
    const { error } = await supabase
      .from('evaluation_progress')
      .update({
        status: 'paused',
      })
      .eq('language_code', langCode);

    if (!error) {
      loadProgress();
    }
    return { error };
  }

  async function resumeEvaluation(langCode: string) {
    const { error } = await supabase
      .from('evaluation_progress')
      .update({
        status: 'in_progress',
      })
      .eq('language_code', langCode);

    if (!error) {
      loadProgress();
    }
    return { error };
  }

  return {
    progress,
    allProgress,
    loading,
    startEvaluation,
    updateProgress,
    completeEvaluation,
    pauseEvaluation,
    resumeEvaluation,
    refresh: loadProgress,
  };
}
