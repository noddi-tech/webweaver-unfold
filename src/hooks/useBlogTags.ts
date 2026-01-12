import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  post_count: number;
  created_at: string;
}

export function useBlogTags() {
  return useQuery({
    queryKey: ['blog-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('post_count', { ascending: false });
      
      if (error) throw error;
      return (data || []) as BlogTag[];
    },
  });
}

export function useSearchBlogTags(searchTerm: string) {
  return useQuery({
    queryKey: ['blog-tags-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        // Return popular tags when no search term
        const { data, error } = await supabase
          .from('blog_tags')
          .select('*')
          .order('post_count', { ascending: false })
          .limit(10);
        
        if (error) throw error;
        return (data || []) as BlogTag[];
      }
      
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('post_count', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return (data || []) as BlogTag[];
    },
    enabled: true,
  });
}

export function useCreateBlogTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-');
      
      const { data, error } = await supabase
        .from('blog_tags')
        .insert({
          name,
          slug,
          post_count: 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}

export function useDeleteBlogTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_tags')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-tags'] });
    },
  });
}
