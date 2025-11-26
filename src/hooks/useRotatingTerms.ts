import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RotatingTerm {
  id: string;
  term_key: string;
  descriptor_key: string;
  term_fallback: string;
  descriptor_fallback: string;
  icon_name: string;
  active: boolean;
  sort_order: number;
}

export function useRotatingTerms() {
  const [terms, setTerms] = useState<RotatingTerm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      const { data, error } = await supabase
        .from('rotating_headline_terms')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setTerms(data);
      }
      setLoading(false);
    };

    fetchTerms();
  }, []);

  return { terms, loading };
}
