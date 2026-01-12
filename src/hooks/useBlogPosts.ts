import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  author_title: string | null;
  author_employee_id: string | null;
  category: string | null;
  tags: string[];
  reading_time_minutes: number;
  published_at: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // SEO fields
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
}

export function useBlogPosts(includeInactive = false) {
  return useQuery({
    queryKey: ['blog-posts', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}

export function useFeaturedBlogPost() {
  return useQuery({
    queryKey: ['blog-post-featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data as BlogPost | null;
    },
  });
}
