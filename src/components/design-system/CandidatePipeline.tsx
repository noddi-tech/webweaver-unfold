import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { User, Calendar, Star, Mail, Eye, GripVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Application {
  id: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
  job_id: string;
  job_listings: {
    id: string;
    title: string;
  };
  candidate_evaluations?: {
    overall_recommendation: string;
  }[];
  interviews?: {
    scheduled_at: string;
    status: string;
  }[];
}

const PIPELINE_COLUMNS = [
  { id: "submitted", label: "New", color: "bg-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30", count: 0 },
  { id: "under_review", label: "Reviewing", color: "bg-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/30", count: 0 },
  { id: "interview_scheduled", label: "Interviews", color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30", count: 0 },
  { id: "interview_completed", label: "Interviewed", color: "bg-indigo-500", bgColor: "bg-indigo-50 dark:bg-indigo-950/30", count: 0 },
  { id: "offer_extended", label: "Offers", color: "bg-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/30", count: 0 },
  { id: "hired", label: "Hired", color: "bg-green-500", bgColor: "bg-green-50 dark:bg-green-950/30", count: 0 },
];

function CandidateCard({ application, isDragging }: { application: Application; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const avgScore = useMemo(() => {
    const evals = application.candidate_evaluations || [];
    if (evals.length === 0) return null;
    
    const scores: Record<string, number> = {
      strong_hire: 5,
      hire: 4,
      maybe: 3,
      no_hire: 2,
      strong_no_hire: 1,
    };
    
    const total = evals.reduce((sum, e) => sum + (scores[e.overall_recommendation || "maybe"] || 3), 0);
    return (total / evals.length).toFixed(1);
  }, [application.candidate_evaluations]);

  const nextInterview = useMemo(() => {
    const upcoming = (application.interviews || [])
      .filter(i => i.status === "scheduled" && new Date(i.scheduled_at) > new Date())
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())[0];
    return upcoming;
  }, [application.interviews]);

  const daysInStage = formatDistanceToNow(new Date(application.created_at), { addSuffix: false });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <h4 className="font-medium text-sm truncate">{application.applicant_name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {application.job_listings?.title}
          </p>
        </div>
        {avgScore && (
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 rounded text-xs font-medium">
            <Star className="h-3 w-3 text-amber-500" />
            {avgScore}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>{daysInStage}</span>
        {nextInterview && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(nextInterview.scheduled_at).toLocaleDateString()}
          </Badge>
        )}
      </div>
    </div>
  );
}

function PipelineColumn({ 
  column, 
  applications, 
  isOver 
}: { 
  column: typeof PIPELINE_COLUMNS[0]; 
  applications: Application[];
  isOver?: boolean;
}) {
  return (
    <div className={`flex flex-col h-full min-w-[280px] ${column.bgColor} rounded-lg p-3 ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
          <h3 className="font-semibold text-sm">{column.label}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {applications.length}
        </Badge>
      </div>
      
      <div className="flex-1 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext items={applications.map(a => a.id)} strategy={verticalListSortingStrategy}>
          {applications.map(application => (
            <CandidateCard key={application.id} application={application} />
          ))}
        </SortableContext>
        
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg">
            Drop candidates here
          </div>
        )}
      </div>
    </div>
  );
}

export function CandidatePipeline() {
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [jobFilter, setJobFilter] = useState<string>("all");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch applications with related data
  const { data: applications, isLoading } = useQuery({
    queryKey: ["pipeline-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          id,
          applicant_name,
          applicant_email,
          status,
          created_at,
          job_id,
          job_listings(id, title),
          candidate_evaluations(overall_recommendation),
          interviews(scheduled_at, status)
        `)
        .not("status", "in", "(rejected,withdrawn)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
  });

  // Fetch jobs for filter
  const { data: jobs } = useQuery({
    queryKey: ["pipeline-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_listings")
        .select("id, title")
        .eq("active", true)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  // Update application status mutation
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("job_applications")
        .update({ status, status_updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-applications"] });
      toast.success("Candidate moved successfully");
    },
    onError: (error) => {
      console.error("Failed to update status:", error);
      toast.error("Failed to move candidate");
    },
  });

  // Filter and group applications
  const groupedApplications = useMemo(() => {
    const filtered = (applications || []).filter(
      app => jobFilter === "all" || app.job_id === jobFilter
    );

    const grouped: Record<string, Application[]> = {};
    PIPELINE_COLUMNS.forEach(col => {
      grouped[col.id] = [];
    });

    filtered.forEach(app => {
      const status = app.status || "submitted";
      if (grouped[status]) {
        grouped[status].push(app);
      }
    });

    return grouped;
  }, [applications, jobFilter]);

  const activeApplication = useMemo(() => {
    if (!activeId || !applications) return null;
    return applications.find(a => a.id === activeId);
  }, [activeId, applications]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const applicationId = active.id as string;
    const targetColumn = PIPELINE_COLUMNS.find(col => {
      // Check if dropped on a column or on another card in that column
      const appsInColumn = groupedApplications[col.id];
      return col.id === over.id || appsInColumn.some(a => a.id === over.id);
    });

    if (!targetColumn) return;

    const application = applications?.find(a => a.id === applicationId);
    if (!application || application.status === targetColumn.id) return;

    updateStatus.mutate({ id: applicationId, status: targetColumn.id });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map(col => (
            <Skeleton key={col.id} className="h-96 min-w-[280px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Candidate Pipeline</h2>
          <p className="text-muted-foreground">Drag and drop to move candidates between stages</p>
        </div>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {jobs?.map(job => (
              <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pipeline Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_COLUMNS.map(column => (
            <PipelineColumn
              key={column.id}
              column={column}
              applications={groupedApplications[column.id] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeApplication && (
            <div className="bg-card border border-primary rounded-lg p-3 shadow-lg rotate-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-medium text-sm">{activeApplication.applicant_name}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeApplication.job_listings?.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {PIPELINE_COLUMNS.map(column => (
                <div key={column.id} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                  <span className="text-muted-foreground">{column.label}:</span>
                  <span className="font-medium">{groupedApplications[column.id]?.length || 0}</span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground">
              Total: <span className="font-medium text-foreground">{applications?.length || 0}</span> candidates
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
