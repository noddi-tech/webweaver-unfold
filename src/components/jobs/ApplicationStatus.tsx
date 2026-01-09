import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Gift, 
  PartyPopper, 
  XCircle, 
  Undo2,
  LucideIcon 
} from "lucide-react";
import { useAppTranslation } from "@/hooks/useAppTranslation";
import { ApplicationStatus as StatusType } from "@/hooks/useJobApplications";
import { cn } from "@/lib/utils";

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const statusConfigs: Record<StatusType, StatusConfig> = {
  submitted: {
    label: "Submitted",
    icon: Send,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  under_review: {
    label: "Under Review",
    icon: Search,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  interview_scheduled: {
    label: "Interview Scheduled",
    icon: Calendar,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  interview_completed: {
    label: "Interview Completed",
    icon: CheckCircle2,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  offer_extended: {
    label: "Offer Extended",
    icon: Gift,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  hired: {
    label: "Hired",
    icon: PartyPopper,
    color: "text-green-700",
    bgColor: "bg-green-200",
  },
  rejected: {
    label: "Not Selected",
    icon: XCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  withdrawn: {
    label: "Withdrawn",
    icon: Undo2,
    color: "text-gray-400",
    bgColor: "bg-gray-50",
  },
};

interface ApplicationStatusProps {
  status: StatusType;
  showLabel?: boolean;
  size?: "sm" | "default";
}

export function ApplicationStatusBadge({ status, showLabel = true, size = "default" }: ApplicationStatusProps) {
  const { t } = useAppTranslation();
  const config = statusConfigs[status] || statusConfigs.submitted;
  const Icon = config.icon;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium gap-1.5",
        config.bgColor,
        config.color,
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      )}
    >
      <Icon className={cn(size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
      {showLabel && t(`careers.status.${status}`, config.label)}
    </Badge>
  );
}

interface ApplicationTimelineProps {
  status: StatusType;
  createdAt: string;
  statusUpdatedAt?: string;
}

export function ApplicationTimeline({ status, createdAt, statusUpdatedAt }: ApplicationTimelineProps) {
  const { t, i18n } = useAppTranslation();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusOrder: StatusType[] = [
    "submitted",
    "under_review",
    "interview_scheduled",
    "interview_completed",
    "offer_extended",
    "hired",
  ];

  const currentIndex = statusOrder.indexOf(status);
  const isNegativeEnd = status === "rejected" || status === "withdrawn";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>{t("careers.apply.appliedOn", "Applied on")} {formatDate(createdAt)}</span>
        {statusUpdatedAt && statusUpdatedAt !== createdAt && (
          <span>• {t("careers.apply.updated", "Updated")} {formatDate(statusUpdatedAt)}</span>
        )}
      </div>
      
      {!isNegativeEnd && (
        <div className="flex items-center gap-1">
          {statusOrder.slice(0, 4).map((s, i) => {
            const config = statusConfigs[s];
            const Icon = config.icon;
            const isActive = i <= currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isActive ? config.bgColor : "bg-muted",
                    isCurrent && "ring-2 ring-offset-2 ring-primary"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? config.color : "text-muted-foreground")} />
                </div>
                {i < 3 && (
                  <div
                    className={cn(
                      "w-8 h-0.5 mx-1",
                      i < currentIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
