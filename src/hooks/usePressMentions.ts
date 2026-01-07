import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PressMention {
  id: string;
  title: string;
  source_name: string;
  source_logo_url: string | null;
  article_url: string;
  published_at: string | null;
  excerpt: string | null;
  category: string;
  active: boolean;
  featured: boolean;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

export const usePressMentions = () => {
  return useQuery({
    queryKey: ["press-mentions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_mentions")
        .select("*")
        .eq("active", true)
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as PressMention[];
    },
  });
};

export const useAllPressMentions = () => {
  return useQuery({
    queryKey: ["press-mentions-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("press_mentions")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as PressMention[];
    },
  });
};
