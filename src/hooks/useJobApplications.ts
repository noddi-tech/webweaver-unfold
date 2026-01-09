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
  resume_url?: string;
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
    mutationFn: async ({ jobId, jobTitle, formData }: { jobId: string; jobTitle: string; formData: ApplicationFormData }) => {
      // Insert the application
      const { data: newApp, error } = await supabase
        .from("job_applications")
        .insert({
          job_id: jobId,
          user_id: userId,
          ...formData,
        })
        .select()
        .single();
      if (error) throw error;

      // Log the activity
      await supabase.from("application_activity_log").insert({
        application_id: newApp.id,
        action: "submitted",
        new_value: "Application submitted",
      });

      // Send confirmation email (non-blocking)
      try {
        await supabase.functions.invoke("send-application-confirmation", {
          body: {
            applicantName: formData.applicant_name,
            applicantEmail: formData.applicant_email,
            jobTitle: jobTitle,
            applicationId: newApp.id,
          },
        });
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        // Don't throw - application was still successful
      }

      return newApp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applications"] });
      toast({ 
        title: "Application submitted!", 
        description: "Check your email for confirmation." 
      });
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
        .update({ status: "withdrawn", status_updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .eq("user_id", userId);
      if (error) throw error;

      // Log the activity
      await supabase.from("application_activity_log").insert({
        application_id: applicationId,
        action: "status_changed",
        old_value: "active",
        new_value: "withdrawn",
      });
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
