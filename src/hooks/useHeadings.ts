import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Heading {
  id: string;
  page_location: string;
  section: string;
  element_type: string;
  content: string;
  active: boolean;
  sort_order: number | null;
  color_token?: string;
}

export const useHeadings = (pageLocation?: string, section?: string) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHeadings = async () => {
      try {
        let query = supabase
          .from('headings')
          .select('*')
          .eq('active', true);

        if (pageLocation) {
          query = query.eq('page_location', pageLocation);
        }

        if (section) {
          query = query.eq('section', section);
        }

        query = query.order('sort_order', { ascending: true });

        const { data, error } = await query;

        if (error) throw error;
        setHeadings(data || []);
      } catch (err) {
        console.error('Error fetching headings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch headings');
      } finally {
        setLoading(false);
      }
    };

    fetchHeadings();
  }, [pageLocation, section]);

  const getHeading = (elementType: string, fallback: string = '') => {
    const heading = headings.find(h => h.element_type === elementType);
    return heading?.content || fallback;
  };

  const getHeadingsBySection = (sectionName: string) => {
    return headings.filter(h => h.section === sectionName);
  };

  return {
    headings,
    loading,
    error,
    getHeading,
    getHeadingsBySection,
  };
};