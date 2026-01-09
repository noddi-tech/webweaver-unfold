import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, Calendar, Clock, MapPin, Video, Phone, Building, 
  User, MoreVertical, Check, X, RefreshCw
} from "lucide-react";
import { format, isToday, isTomorrow, addDays, startOfDay, isSameDay } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ScheduleInterviewDialog from "./ScheduleInterviewDialog";

interface Interview {
  id: string;
  application_id: string;
  interview_type: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  location: string | null;
  meeting_url: string | null;
  interviewer_names: string[] | null;
  status: string;
  notes: string | null;
  job_applications: {
    applicant_name: string;
    applicant_email: string;
    job_listings: {
      title: string;
    } | null;
  } | null;
}

const INTERVIEW_TYPES: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  phone_screen: { label: "Phone Screen", icon: <Phone className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
  technical: { label: "Technical", icon: <Video className="w-4 h-4" />, color: "bg-purple-100 text-purple-800" },
  behavioral: { label: "Behavioral", icon: <User className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
  final: { label: "Final Round", icon: <Building className="w-4 h-4" />, color: "bg-orange-100 text-orange-800" },
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
  rescheduled: "bg-yellow-100 text-yellow-800",
  no_show: "bg-red-100 text-red-800",
};

export default function InterviewScheduler() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"upcoming" | "past" | "all">("upcoming");

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ["interviews", viewMode],
    queryFn: async () => {
      let query = supabase
        .from("interviews")
        .select(`
          *,
          job_applications (
            applicant_name,
            applicant_email,
            job_listings (
              title
            )
          )
        `)
        .order("scheduled_at", { ascending: viewMode === "upcoming" });

      const now = new Date().toISOString();
      if (viewMode === "upcoming") {
        query = query.gte("scheduled_at", now).neq("status", "cancelled");
      } else if (viewMode === "past") {
        query = query.lt("scheduled_at", now);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Interview[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("interviews")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["interviews"] });
      toast({ title: "Interview updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  // Group interviews by date
  const groupedInterviews = interviews.reduce((acc, interview) => {
    const date = startOfDay(new Date(interview.scheduled_at)).toISOString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(interview);
    return acc;
  }, {} as Record<string, Interview[]>);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const getLocationIcon = (interview: Interview) => {
    if (interview.meeting_url) return <Video className="w-4 h-4" />;
    if (interview.location?.toLowerCase().includes("phone")) return <Phone className="w-4 h-4" />;
    return <Building className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Interview Scheduler</h2>
          <p className="text-muted-foreground">Schedule and manage candidate interviews</p>
        </div>
        <Button onClick={() => { setSelectedApplicationId(null); setIsDialogOpen(true); }}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="text-2xl font-bold">
            {interviews.filter(i => isToday(new Date(i.scheduled_at)) && i.status === "scheduled").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">This Week</p>
          <p className="text-2xl font-bold">
            {interviews.filter(i => {
              const date = new Date(i.scheduled_at);
              return date >= new Date() && date <= addDays(new Date(), 7) && i.status === "scheduled";
            }).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {interviews.filter(i => i.status === "completed").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Cancelled</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {interviews.filter(i => i.status === "cancelled").length}
          </p>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Interview List */}
      {Object.keys(groupedInterviews).length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No interviews {viewMode === "upcoming" ? "scheduled" : "found"}.</p>
          <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Schedule First Interview
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedInterviews)
            .sort(([a], [b]) => viewMode === "past" ? new Date(b).getTime() - new Date(a).getTime() : new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayInterviews]) => (
            <div key={date}>
              <h3 className="font-semibold mb-3 text-muted-foreground">{getDateLabel(date)}</h3>
              <div className="space-y-3">
                {dayInterviews.map((interview) => (
                  <Card key={interview.id} className={interview.status === "cancelled" ? "opacity-60" : ""}>
                    <CardContent className="py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4">
                          {/* Time */}
                          <div className="text-center min-w-[60px]">
                            <p className="text-lg font-bold">{format(new Date(interview.scheduled_at), "HH:mm")}</p>
                            <p className="text-xs text-muted-foreground">{interview.duration_minutes} min</p>
                          </div>

                          {/* Details */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{interview.title}</h4>
                              <Badge className={INTERVIEW_TYPES[interview.interview_type]?.color || "bg-gray-100"}>
                                {INTERVIEW_TYPES[interview.interview_type]?.icon}
                                <span className="ml-1">{INTERVIEW_TYPES[interview.interview_type]?.label || interview.interview_type}</span>
                              </Badge>
                              <Badge variant="outline" className={STATUS_COLORS[interview.status]}>
                                {interview.status.replace(/_/g, " ")}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {interview.job_applications?.applicant_name}
                              </span>
                              {interview.job_applications?.job_listings?.title && (
                                <span>• {interview.job_applications.job_listings.title}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              {(interview.meeting_url || interview.location) && (
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  {getLocationIcon(interview)}
                                  {interview.meeting_url ? (
                                    <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                      Join Meeting
                                    </a>
                                  ) : (
                                    interview.location
                                  )}
                                </span>
                              )}
                              {interview.interviewer_names && interview.interviewer_names.length > 0 && (
                                <span className="text-muted-foreground">
                                  with {interview.interviewer_names.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {interview.status === "scheduled" && (
                              <>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: interview.id, status: "completed" })}>
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: interview.id, status: "no_show" })}>
                                  <X className="w-4 h-4 mr-2" />
                                  Mark No-Show
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: interview.id, status: "cancelled" })}>
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            )}
                            {interview.status === "cancelled" && (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: interview.id, status: "scheduled" })}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Dialog */}
      <ScheduleInterviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        applicationId={selectedApplicationId}
      />
    </div>
  );
}
