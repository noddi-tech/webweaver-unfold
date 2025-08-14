import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TextContent {
  id: string;
  page_location: string;
  section: string;
  element_type: string;
  content: string;
  active: boolean;
  sort_order: number | null;
  color_token?: string;
  content_type: string;
}

export const useTextContent = (pageLocation?: string, section?: string) => {
  const [textContent, setTextContent] = useState<TextContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTextContent = async () => {
      try {
        let query = supabase
          .from('text_content')
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
        setTextContent(data || []);
      } catch (err) {
        console.error('Error fetching text content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch text content');
      } finally {
        setLoading(false);
      }
    };

    fetchTextContent();
  }, [pageLocation, section]);

  const getContent = (elementType: string, fallback: string = '') => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  const getContentBySection = (sectionName: string) => {
    return textContent.filter(tc => tc.section === sectionName);
  };

  return {
    textContent,
    loading,
    error,
    getContent,
    getContentBySection,
    // Keep backward compatibility with old naming
    headings: textContent,
    getHeading: getContent,
    getHeadingsBySection: getContentBySection,
  };
};
