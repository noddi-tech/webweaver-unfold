import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { 
  Eye, Mail, Linkedin, ExternalLink, Loader2, Search, Filter, 
  Download, CheckSquare, X, Clock, User, FileText, History,
  ChevronLeft, ChevronRight, Send, Star
} from "lucide-react";
import EvaluationForm from "./EvaluationForm";
import EvaluationSummary from "./EvaluationSummary";
import { ApplicationStatusBadge } from "@/components/jobs/ApplicationStatus";
import { ApplicationStatus } from "@/hooks/useJobApplications";
import { format } from "date-fns";

interface Application {
  id: string;
  job_id: string;
  user_id: string | null;
  applicant_name: string;
  applicant_email: string;
  applicant_phone: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_url: string | null;
  cover_letter: string | null;
  status: string;
  status_updated_at: string;
  internal_notes: string | null;
  created_at: string;
  source: string | null;
  source_detail: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  job_listings: {
    id: string;
    title: string;
    slug: string;
    department: string | null;
  } | null;
}

interface ActivityLog {
  id: string;
  application_id: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "interview_scheduled",
  "interview_completed",
  "offer_extended",
  "hired",
  "rejected",
  "withdrawn",
];

const ITEMS_PER_PAGE = 25;

export default function ApplicationsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [notifyCandidate, setNotifyCandidate] = useState(true);
  const [dialogTab, setDialogTab] = useState("overview");
  const [formData, setFormData] = useState({
    status: "submitted" as ApplicationStatus,
    internal_notes: "",
  });

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["admin-job-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job_listings (
            id,
            title,
            slug,
            department
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Application[];
    },
  });

  // Send booking link mutation
  const sendBookingLinkMutation = useMutation({
    mutationFn: async ({ applicationId, interviewType }: { applicationId: string; interviewType: string }) => {
      const { data, error } = await supabase.functions.invoke("send-booking-link", {
        body: { applicationId, interviewType, expiresInDays: 7 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Booking link sent", description: "The candidate will receive an email with available slots." });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to send booking link", description: err.message, variant: "destructive" });
    },
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ["application-activity", selectedApp?.id],
    queryFn: async () => {
      if (!selectedApp) return [];
      const { data, error } = await supabase
        .from("application_activity_log")
        .select("*")
        .eq("application_id", selectedApp.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ActivityLog[];
    },
    enabled: !!selectedApp,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-list-for-filter"],
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes, sendEmail }: { id: string; status: string; notes: string; sendEmail: boolean }) => {
      const app = applications.find(a => a.id === id);
      const oldStatus = app?.status;

      // Update the application
      const { error } = await supabase
        .from("job_applications")
        .update({
          status,
          internal_notes: notes || null,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;

      // Log the activity
      await supabase.from("application_activity_log").insert({
        application_id: id,
        action: "status_changed",
        old_value: oldStatus,
        new_value: status,
      });

      // Send email notification if requested
      if (sendEmail && app && oldStatus !== status) {
        try {
          await supabase.functions.invoke("send-application-status-update", {
            body: {
              applicantName: app.applicant_name,
              applicantEmail: app.applicant_email,
              jobTitle: app.job_listings?.title || "Position",
              newStatus: status,
              applicationId: id,
            },
          });
          // Log email sent
          await supabase.from("application_activity_log").insert({
            application_id: id,
            action: "email_sent",
            new_value: `Status update: ${status}`,
          });
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-applications"] });
      queryClient.invalidateQueries({ queryKey: ["application-activity"] });
      toast({ title: "Application updated" });
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
      for (const id of ids) {
        const app = applications.find(a => a.id === id);
        const oldStatus = app?.status;
        
        await supabase
          .from("job_applications")
          .update({
            status,
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        await supabase.from("application_activity_log").insert({
          application_id: id,
          action: "status_changed",
          old_value: oldStatus,
          new_value: status,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-applications"] });
      setSelectedIds(new Set());
      toast({ title: `Updated ${selectedIds.size} applications` });
    },
    onError: (err: Error) => {
      toast({ title: "Bulk update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleOpenDetails = (app: Application) => {
    setSelectedApp(app);
    setFormData({
      status: app.status as ApplicationStatus,
      internal_notes: app.internal_notes || "",
    });
    setDialogTab("overview");
    setNotifyCandidate(true);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedApp) return;
    updateMutation.mutate({
      id: selectedApp.id,
      status: formData.status,
      notes: formData.internal_notes,
      sendEmail: notifyCandidate && formData.status !== selectedApp.status,
    });
  };

  const handleBulkAction = (status: ApplicationStatus) => {
    if (selectedIds.size === 0) return;
    bulkUpdateMutation.mutate({ ids: Array.from(selectedIds), status });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(paginatedApps.map(app => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Position", "Department", "Status", "Applied Date", "LinkedIn", "Portfolio", "Cover Letter"];
    const rows = filteredApps.map(app => [
      app.applicant_name,
      app.applicant_email,
      app.applicant_phone || "",
      app.job_listings?.title || "",
      app.job_listings?.department || "",
      app.status.replace(/_/g, " "),
      format(new Date(app.created_at), "yyyy-MM-dd"),
      app.linkedin_url || "",
      app.portfolio_url || "",
      (app.cover_letter || "").substring(0, 200).replace(/"/g, '""'),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `applications-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast({ title: "Export complete", description: `${filteredApps.length} applications exported` });
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_listings?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesJob = jobFilter === "all" || app.job_id === jobFilter;
    return matchesSearch && matchesStatus && matchesJob;
  });

  const totalPages = Math.ceil(filteredApps.length / ITEMS_PER_PAGE);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const formatActivityAction = (action: string, oldValue: string | null, newValue: string | null) => {
    switch (action) {
      case "submitted":
        return "Application submitted";
      case "status_changed":
        return `Status changed from "${oldValue?.replace(/_/g, " ")}" to "${newValue?.replace(/_/g, " ")}"`;
      case "note_added":
        return "Note added";
      case "email_sent":
        return `Email sent: ${newValue}`;
      default:
        return action;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Job Applications</h2>
        <p className="text-muted-foreground">Review and manage candidate applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{applications.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Under Review</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.under_review || 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Interviews</p>
          <p className="text-2xl font-bold text-purple-600">
            {(statusCounts.interview_scheduled || 0) + (statusCounts.interview_completed || 0)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Hired</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.hired || 0}</p>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name, email, or position..."
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={jobFilter} onValueChange={(v) => { setJobFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="p-3 bg-muted/50">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("under_review")}>
                <CheckSquare className="w-4 h-4 mr-1" /> Mark Under Review
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction("interview_scheduled")}>
                Schedule Interview
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleBulkAction("rejected")}>
                <X className="w-4 h-4 mr-1" /> Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                Clear Selection
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : applications.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-medium text-lg mb-2">No applications yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Applications will appear here when candidates apply to your job listings. 
              Make sure you have active job postings to receive applications.
            </p>
          </CardContent>
        </Card>
      ) : filteredApps.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No applications match your filters.</p>
        </Card>
      ) : (
        <>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={paginatedApps.length > 0 && paginatedApps.every(app => selectedIds.has(app.id))}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(app.id)}
                        onCheckedChange={(checked) => handleSelectOne(app.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{app.applicant_name}</p>
                        <p className="text-sm text-muted-foreground">{app.applicant_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{app.job_listings?.title || "Unknown"}</p>
                        {app.job_listings?.department && (
                          <Badge variant="outline" className="text-xs">
                            {app.job_listings.department}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {app.source || "Direct"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ApplicationStatusBadge status={app.status as ApplicationStatus} size="sm" />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDetails(app)}>
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredApps.length)} of {filteredApps.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <Tabs value={dialogTab} onValueChange={setDialogTab}>
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="overview">
                  <User className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="evaluations">
                  <Star className="w-4 h-4 mr-2" />
                  Evaluations
                </TabsTrigger>
                <TabsTrigger value="timeline">
                  <History className="w-4 h-4 mr-2" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Notes
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Candidate Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Candidate Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{selectedApp.applicant_name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Email</Label>
                        <a href={`mailto:${selectedApp.applicant_email}`} className="flex items-center gap-1 text-primary hover:underline">
                          <Mail className="w-3 h-3" />
                          {selectedApp.applicant_email}
                        </a>
                      </div>
                      {selectedApp.applicant_phone && (
                        <div>
                          <Label className="text-muted-foreground">Phone</Label>
                          <p>{selectedApp.applicant_phone}</p>
                        </div>
                      )}
                      {selectedApp.linkedin_url && (
                        <div>
                          <Label className="text-muted-foreground">LinkedIn</Label>
                          <a href={selectedApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <Linkedin className="w-3 h-3" />
                            View Profile
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedApp.portfolio_url && (
                        <div>
                          <Label className="text-muted-foreground">Portfolio</Label>
                          <a href={selectedApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            View Portfolio
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      {selectedApp.resume_url && (
                        <div>
                          <Label className="text-muted-foreground">Resume</Label>
                          <a href={selectedApp.resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            View Resume
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {selectedApp.cover_letter && (
                      <div>
                        <Label className="text-muted-foreground">Cover Letter</Label>
                        <p className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                          {selectedApp.cover_letter}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Update Status */}
                <div className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as ApplicationStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.status !== selectedApp.status && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="notify-candidate"
                        checked={notifyCandidate}
                        onCheckedChange={(checked) => setNotifyCandidate(!!checked)}
                      />
                      <Label htmlFor="notify-candidate" className="flex items-center gap-2 cursor-pointer">
                        <Send className="w-4 h-4" />
                        Notify candidate of status change
                      </Label>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="evaluations" className="mt-4 space-y-6">
                <Tabs defaultValue="summary">
                  <TabsList>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="add">Add Evaluation</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="mt-4">
                    <EvaluationSummary applicationId={selectedApp.id} />
                  </TabsContent>
                  <TabsContent value="add" className="mt-4">
                    <EvaluationForm
                      applicationId={selectedApp.id}
                      applicantName={selectedApp.applicant_name}
                      jobTitle={selectedApp.job_listings?.title || "Position"}
                    />
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activityLogs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No activity recorded yet</p>
                    ) : (
                      <div className="space-y-4">
                        {activityLogs.map((log) => (
                          <div key={log.id} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                            <div className="flex-1">
                              <p className="text-sm">{formatActivityAction(log.action, log.old_value, log.new_value)}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <div>
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Notes about this application (not visible to candidate)..."
                    rows={6}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
