import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TechStackItem {
  id: string;
  name: string;
  logo_url: string | null;
  category: string;
  description: string | null;
  sort_order: number;
  active: boolean;
}

export function useTechStack() {
  return useQuery({
    queryKey: ["tech-stack-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_stack_items")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TechStackItem[];
    },
  });
}

export function useTechStackByIds(ids: string[]) {
  return useQuery({
    queryKey: ["tech-stack-items", ids],
    queryFn: async () => {
      if (!ids || ids.length === 0) return [];
      
      const { data, error } = await supabase
        .from("tech_stack_items")
        .select("*")
        .in("id", ids)
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as TechStackItem[];
    },
    enabled: ids.length > 0,
  });
}
