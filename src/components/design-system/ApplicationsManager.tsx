import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Eye, Mail, Linkedin, ExternalLink, Loader2, Search, Filter } from "lucide-react";
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
  cover_letter: string | null;
  status: string;
  status_updated_at: string;
  internal_notes: string | null;
  created_at: string;
  job_listings: {
    id: string;
    title: string;
    slug: string;
    department: string | null;
  } | null;
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

export default function ApplicationsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from("job_applications")
        .update({
          status,
          internal_notes: notes || null,
          status_updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-job-applications"] });
      toast({ title: "Application updated" });
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const handleOpenDetails = (app: Application) => {
    setSelectedApp(app);
    setFormData({
      status: app.status as ApplicationStatus,
      internal_notes: app.internal_notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!selectedApp) return;
    updateMutation.mutate({
      id: selectedApp.id,
      status: formData.status,
      notes: formData.internal_notes,
    });
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job_listings?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or position..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
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
      </div>

      {/* Applications Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-muted-foreground">No applications found.</p>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.map((app) => (
                <TableRow key={app.id}>
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
      )}

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
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

                <div>
                  <Label>Internal Notes</Label>
                  <Textarea
                    value={formData.internal_notes}
                    onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
                    placeholder="Notes about this application (not visible to candidate)..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
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
