import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  type: 'general' | 'features' | 'pricing';
  active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const useFAQs = (type?: string) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        let query = supabase
          .from('faqs')
          .select('*')
          .eq('active', true)
          .order('sort_order', { ascending: true });

        if (type) {
          query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) throw error;
        setFaqs((data || []) as FAQ[]);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [type]);

  return {
    faqs,
    loading,
    error,
  };
};
