import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'editor' | 'viewer' | null;

interface UserRoleData {
  role: AppRole;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
}

export function useUserRole(): UserRoleData {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
      } else {
        setRole(data?.role || null);
      }
      
      setLoading(false);
    }

    fetchRole();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    loading,
    isAdmin: role === 'admin',
    isEditor: role === 'editor' || role === 'admin',
  };
}
