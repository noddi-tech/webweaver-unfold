import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface JobListing {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_range: string | null;
  application_url: string | null;
  application_email: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  posted_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useJobListings(includeInactive = false) {
  return useQuery({
    queryKey: ['job-listings', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('job_listings')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('posted_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as JobListing[];
    },
  });
}

export function useJobListing(slug: string) {
  return useQuery({
    queryKey: ['job-listing', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as JobListing;
    },
    enabled: !!slug,
  });
}
