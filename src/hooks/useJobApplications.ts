import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";

export interface ApplicationFormData {
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter?: string;
}

export type ApplicationStatus = 
  | "submitted" 
  | "under_review" 
  | "interview_scheduled" 
  | "interview_completed" 
  | "offer_extended" 
  | "hired" 
  | "rejected" 
  | "withdrawn";

export function useJobApplications() {
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

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["job-applications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          job_id,
          applicant_name,
          applicant_email,
          status,
          status_updated_at,
          created_at,
          job_listings (
            id,
            title,
            slug,
            department,
            location,
            employment_type
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const submitApplicationMutation = useMutation({
    mutationFn: async ({ jobId, formData }: { jobId: string; formData: ApplicationFormData }) => {
      const { error } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          user_id: userId,
          ...formData,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Application submitted!", description: "We'll be in touch soon." });
    },
    onError: (err: Error) => {
      toast({ title: "Submission failed", description: err.message, variant: "destructive" });
    },
  });

  const withdrawApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("job_applications")
        .update({ status: "withdrawn" })
        .eq("id", applicationId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ title: "Application withdrawn" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to withdraw", description: err.message, variant: "destructive" });
    },
  });

  const hasApplied = (jobId: string) => {
    return applications.some((app) => app.job_id === jobId && app.status !== "withdrawn");
  };

  const getApplicationForJob = (jobId: string) => {
    return applications.find((app) => app.job_id === jobId);
  };

  return {
    applications,
    isLoading,
    hasApplied,
    getApplicationForJob,
    submitApplication: submitApplicationMutation.mutateAsync,
    withdrawApplication: withdrawApplicationMutation.mutateAsync,
    isSubmitting: submitApplicationMutation.isPending,
    isAuthenticated: !!userId,
  };
}
