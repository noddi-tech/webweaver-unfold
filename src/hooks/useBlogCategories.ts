import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  sort_order: number;
  active: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export function useBlogCategories(includeInactive = false) {
  return useQuery({
    queryKey: ['blog-categories', includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('blog_categories')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!includeInactive) {
        query = query.eq('active', true);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return (data || []) as BlogCategory[];
    },
  });
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Partial<BlogCategory>) => {
      const slug = category.slug || 
        category.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-') || '';
      
      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: category.name,
          slug,
          description: category.description || null,
          color: category.color || '#6366f1',
          icon: category.icon || null,
          sort_order: category.sort_order || 0,
          active: category.active ?? true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BlogCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BlogCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-categories'] });
    },
  });
}
