import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { cn } from "@/lib/utils";

interface SaveJobButtonProps {
  jobId: string;
  variant?: "icon" | "text";
  className?: string;
}

export function SaveJobButton({ jobId, variant = "icon", className }: SaveJobButtonProps) {
  const { t } = useAppTranslation();
  const { isJobSaved, toggleSaveJob, isSaving, isAuthenticated } = useSavedJobs();
  
  const saved = isJobSaved(jobId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleSaveJob(jobId);
  };

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleClick}
        disabled={isSaving}
        className={cn(
          "transition-all",
          saved && "bg-brand-pink/10 border-brand-pink text-brand-pink hover:bg-brand-pink/20",
          className
        )}
        title={saved ? t("careers.job.unsaveJob", "Remove from saved") : t("careers.job.saveJob", "Save Job")}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={cn("w-4 h-4", saved && "fill-current")} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isSaving}
      className={cn(
        "group transition-all",
        saved && "bg-brand-pink/10 border-brand-pink text-brand-pink hover:bg-brand-pink/20",
        className
      )}
    >
      {isSaving ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Heart className={cn("w-4 h-4 mr-2", saved && "fill-current")} />
      )}
      {saved ? t("careers.job.saved", "Saved") : t("careers.job.saveJob", "Save Job")}
    </Button>
  );
}
