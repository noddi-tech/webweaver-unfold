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
        console.log('[useUserRole] No user found');
        setRole(null);
        setLoading(false);
        return;
      }

      console.log('[useUserRole] Checking role for user:', user.id);

      // Use SECURITY DEFINER function to bypass RLS issues
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');

      if (adminError) {
        console.error('[useUserRole] Error checking admin status:', adminError);
        setRole(null);
        setLoading(false);
        return;
      }

      if (isAdmin) {
        console.log('[useUserRole] User is admin');
        setRole('admin');
        setLoading(false);
        return;
      }

      // Check for editor role using has_role function
      const { data: isEditor, error: editorError } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'editor'
      });

      if (editorError) {
        console.error('[useUserRole] Error checking editor status:', editorError);
        setRole(null);
      } else if (isEditor) {
        console.log('[useUserRole] User is editor');
        setRole('editor');
      } else {
        console.log('[useUserRole] User has no role');
        setRole(null);
      }
      
      setLoading(false);
    }

    fetchRole();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log('[useUserRole] Auth state changed, refetching role');
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
