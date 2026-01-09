import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export function useSavedJobs() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const { data: savedJobs = [], isLoading } = useQuery({
    queryKey: ["saved-jobs", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(`
          id,
          job_id,
          created_at,
          job_listings (
            id,
            title,
            slug,
            department,
            location,
            employment_type,
            posted_at
          )
        `)
        .eq("user_id", userId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const saveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("saved_jobs")
        .insert({ user_id: userId, job_id: jobId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast({ title: "Job saved!" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save job", description: err.message, variant: "destructive" });
    },
  });

  const unsaveJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("saved_jobs")
        .delete()
        .eq("user_id", userId)
        .eq("job_id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast({ title: "Job removed from saved" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to remove job", description: err.message, variant: "destructive" });
    },
  });

  const isJobSaved = (jobId: string) => {
    return savedJobs.some((sj) => sj.job_id === jobId);
  };

  const toggleSaveJob = async (jobId: string) => {
    if (!userId) {
      toast({ 
        title: "Sign in required", 
        description: "Please sign in to save jobs",
        variant: "destructive" 
      });
      return;
    }
    if (isJobSaved(jobId)) {
      await unsaveJobMutation.mutateAsync(jobId);
    } else {
      await saveJobMutation.mutateAsync(jobId);
    }
  };

  return {
    savedJobs,
    isLoading,
    isJobSaved,
    toggleSaveJob,
    isAuthenticated: !!userId,
    isSaving: saveJobMutation.isPending || unsaveJobMutation.isPending,
  };
}
