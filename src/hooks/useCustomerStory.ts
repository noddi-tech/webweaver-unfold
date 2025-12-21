import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface CustomerStoryResult {
  icon: string;
  metric: string;
  description: string;
}

export interface CustomerStory {
  id: string;
  slug: string;
  company_name: string;
  company_logo_url: string | null;
  title: string;
  hero_image_url: string | null;
  about_company: string | null;
  use_case: string | null;
  impact_statement: string | null;
  product_screenshot_url: string | null;
  quote_text: string | null;
  quote_author: string | null;
  quote_author_title: string | null;
  results: CustomerStoryResult[];
  final_cta_heading: string | null;
  final_cta_description: string | null;
  final_cta_button_text: string | null;
  final_cta_button_url: string | null;
  active: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

function parseResults(results: Json | null): CustomerStoryResult[] {
  if (!results || !Array.isArray(results)) return [];
  return results as unknown as CustomerStoryResult[];
}

export function useCustomerStory(slug: string | undefined) {
  return useQuery({
    queryKey: ['customer-story', slug],
    queryFn: async (): Promise<CustomerStory | null> => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('customer_stories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer story:', error);
        return null;
      }

      return {
        ...data,
        results: parseResults(data.results)
      };
    },
    enabled: !!slug
  });
}

export function useCustomerStories() {
  return useQuery({
    queryKey: ['customer-stories'],
    queryFn: async (): Promise<CustomerStory[]> => {
      const { data, error } = await supabase
        .from('customer_stories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching customer stories:', error);
        return [];
      }

      return data.map(story => ({
        ...story,
        results: parseResults(story.results)
      }));
    }
  });
}
