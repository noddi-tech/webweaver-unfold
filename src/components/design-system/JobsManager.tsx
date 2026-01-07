import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, Star, Eye, EyeOff, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface JobListing {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  employment_type: string | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  salary_range: string | null;
  application_url: string | null;
  application_email: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  posted_at: string | null;
  expires_at: string | null;
}

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Product", "Design", "Operations", "Customer Success"];
const LOCATIONS = ["Oslo", "Remote", "Hybrid", "London", "Stockholm"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const emptyJob: Omit<JobListing, "id"> = {
  title: "",
  slug: "",
  department: null,
  location: null,
  employment_type: null,
  description: null,
  requirements: null,
  benefits: null,
  salary_range: null,
  application_url: null,
  application_email: null,
  active: true,
  featured: false,
  sort_order: 0,
  posted_at: new Date().toISOString(),
  expires_at: null,
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const JobsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [creating, setCreating] = useState(false);
  const [newJob, setNewJob] = useState<Omit<JobListing, "id">>(emptyJob);
  const [editingJob, setEditingJob] = useState<JobListing | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("job_listings")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("posted_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load jobs", description: error.message, variant: "destructive" });
    } else {
      setJobs(
        (data || []).map((j) => ({
          ...j,
          sort_order: j.sort_order || 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const createJob = async () => {
    if (!newJob.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setCreating(true);
    const slug = newJob.slug.trim() || generateSlug(newJob.title.trim());

    const { error } = await supabase.from("job_listings").insert({
      ...newJob,
      slug,
      title: newJob.title.trim(),
    });

    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job listing created" });
      setNewJob(emptyJob);
      fetchJobs();
    }
  };

  const saveJob = async (job: JobListing) => {
    setSavingId(job.id);
    const { error } = await supabase
      .from("job_listings")
      .update({
        slug: job.slug.trim() || generateSlug(job.title.trim()),
        title: job.title.trim(),
        department: job.department,
        location: job.location,
        employment_type: job.employment_type,
        description: job.description?.trim() || null,
        requirements: job.requirements?.trim() || null,
        benefits: job.benefits?.trim() || null,
        salary_range: job.salary_range?.trim() || null,
        application_url: job.application_url?.trim() || null,
        application_email: job.application_email?.trim() || null,
        active: job.active,
        featured: job.featured,
        sort_order: job.sort_order,
        posted_at: job.posted_at,
        expires_at: job.expires_at,
      })
      .eq("id", job.id);

    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job listing saved" });
      setShowEditDialog(false);
      setEditingJob(null);
      fetchJobs();
    }
  };

  const deleteJob = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("job_listings").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job listing deleted" });
      setJobs((prev) => prev.filter((j) => j.id !== id));
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("job_listings").update({ active }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, active } : j)));
      toast({ title: `Job ${active ? "activated" : "deactivated"}` });
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase.from("job_listings").update({ featured }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, featured } : j)));
      toast({ title: `Job ${featured ? "featured" : "unfeatured"}` });
    }
  };

  const openEditDialog = (job: JobListing) => {
    setEditingJob({ ...job });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-background border-border">
        <p className="text-muted-foreground">Loading job listings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Edit Job Listing
            </DialogTitle>
          </DialogHeader>

          {editingJob && (
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={editingJob.title}
                      onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingJob.slug}
                      onChange={(e) => setEditingJob({ ...editingJob, slug: e.target.value })}
                      placeholder="auto-generated"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Department</Label>
                    <Select
                      value={editingJob.department || ""}
                      onValueChange={(v) => setEditingJob({ ...editingJob, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Select
                      value={editingJob.location || ""}
                      onValueChange={(v) => setEditingJob({ ...editingJob, location: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATIONS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Employment Type</Label>
                    <Select
                      value={editingJob.employment_type || ""}
                      onValueChange={(v) => setEditingJob({ ...editingJob, employment_type: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Salary Range (optional)</Label>
                  <Input
                    value={editingJob.salary_range || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, salary_range: e.target.value })}
                    placeholder="e.g., NOK 600,000 - 800,000"
                  />
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div>
                  <Label>Description (Markdown)</Label>
                  <Textarea
                    value={editingJob.description || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    placeholder="Job description..."
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Requirements (Markdown)</Label>
                  <Textarea
                    value={editingJob.requirements || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value })}
                    placeholder="- 3+ years experience\n- Strong communication skills"
                    rows={6}
                  />
                </div>
                <div>
                  <Label>Benefits (Markdown)</Label>
                  <Textarea
                    value={editingJob.benefits || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, benefits: e.target.value })}
                    placeholder="- Competitive salary\n- Flexible hours"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Application URL</Label>
                    <Input
                      value={editingJob.application_url || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, application_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>Application Email</Label>
                    <Input
                      value={editingJob.application_email || ""}
                      onChange={(e) => setEditingJob({ ...editingJob, application_email: e.target.value })}
                      placeholder="careers@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={editingJob.sort_order}
                      onChange={(e) =>
                        setEditingJob({ ...editingJob, sort_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Expires At</Label>
                    <Input
                      type="datetime-local"
                      value={editingJob.expires_at?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setEditingJob({
                          ...editingJob,
                          expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingJob.active}
                      onCheckedChange={(checked) => setEditingJob({ ...editingJob, active: checked })}
                    />
                    <span className="text-sm">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingJob.featured}
                      onCheckedChange={(checked) => setEditingJob({ ...editingJob, featured: checked })}
                    />
                    <span className="text-sm">Featured</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingJob && saveJob(editingJob)}
              disabled={savingId === editingJob?.id}
            >
              {savingId === editingJob?.id ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Job */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Add New Job Listing</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={newJob.title}
              onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
              placeholder="Senior Developer"
            />
          </div>
          <div>
            <Label>Department</Label>
            <Select
              value={newJob.department || ""}
              onValueChange={(v) => setNewJob({ ...newJob, department: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Select
              value={newJob.location || ""}
              onValueChange={(v) => setNewJob({ ...newJob, location: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={newJob.employment_type || ""}
              onValueChange={(v) => setNewJob({ ...newJob, employment_type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={createJob} disabled={creating} className="w-full">
              {creating ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Jobs Table */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Job Listings ({jobs.length})</h3>
        {jobs.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No job listings yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    {job.department && <Badge variant="secondary">{job.department}</Badge>}
                  </TableCell>
                  <TableCell>{job.location || "—"}</TableCell>
                  <TableCell>{job.employment_type || "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(job.id, !job.active)}
                    >
                      {job.active ? (
                        <Eye className="w-4 h-4 text-green-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(job.id, !job.featured)}
                    >
                      <Star
                        className={`w-4 h-4 ${job.featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(job)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteJob(job.id)}
                        disabled={deletingId === job.id}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
};

export default JobsManager;
