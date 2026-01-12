import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type BlogPostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

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
  category_id: string | null;
  tags: string[];
  reading_time_minutes: number;
  published_at: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  status: BlogPostStatus;
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

/**
 * Fetch blog posts
 * @param includeAll - If true, includes all statuses (for admin). If false, only published posts.
 */
export function useBlogPosts(includeAll = false) {
  return useQuery({
    queryKey: ['blog-posts', includeAll],
    queryFn: async () => {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false });

      if (!includeAll) {
        // Only show published posts that have passed their publish date
        query = query
          .eq('status', 'published')
          .eq('active', true)
          .lte('published_at', new Date().toISOString());
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []).map(p => ({
        ...p,
        tags: Array.isArray(p.tags) ? p.tags : [],
        status: p.status || 'draft',
      })) as BlogPost[];
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
      return {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status || 'draft',
      } as BlogPost;
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
        .eq('status', 'published')
        .eq('active', true)
        .eq('featured', true)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        tags: Array.isArray(data.tags) ? data.tags : [],
        status: data.status || 'draft',
      } as BlogPost;
    },
  });
}

// Helper to calculate time until publish
export function getTimeUntilPublish(publishDate: string | null): string | null {
  if (!publishDate) return null;
  
  const diff = new Date(publishDate).getTime() - Date.now();
  if (diff <= 0) return null;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
