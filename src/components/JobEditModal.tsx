import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { parseJobMarkdown } from "@/lib/markdownUtils";
import { Pencil, Eye } from "lucide-react";

interface JobEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  initialField?: "description" | "requirements" | "benefits" | "title" | "basics";
  jobData: {
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
  };
}

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Product", "Design", "Operations", "Customer Success"];
const LOCATIONS = ["Oslo", "Remote", "Hybrid", "London", "Stockholm"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

export function JobEditModal({ open, onOpenChange, jobId, initialField = "description", jobData }: JobEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(jobData);
  const [previewField, setPreviewField] = useState<"description" | "requirements" | "benefits" | null>(null);

  useEffect(() => {
    setFormData(jobData);
  }, [jobData, open]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("job_listings")
      .update({
        title: formData.title.trim(),
        department: formData.department,
        location: formData.location,
        employment_type: formData.employment_type,
        description: formData.description?.trim() || null,
        requirements: formData.requirements?.trim() || null,
        benefits: formData.benefits?.trim() || null,
        salary_range: formData.salary_range?.trim() || null,
        application_url: formData.application_url?.trim() || null,
        application_email: formData.application_email?.trim() || null,
      })
      .eq("id", jobId);

    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Job listing updated" });
      queryClient.invalidateQueries({ queryKey: ["job-listing"] });
      onOpenChange(false);
    }
  };

  const getDefaultTab = () => {
    if (initialField === "basics" || initialField === "title") return "basics";
    return "content";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Listing</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  value={formData.department || ""}
                  onValueChange={(v) => setFormData({ ...formData, department: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Select
                  value={formData.location || ""}
                  onValueChange={(v) => setFormData({ ...formData, location: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Employment Type</Label>
                <Select
                  value={formData.employment_type || ""}
                  onValueChange={(v) => setFormData({ ...formData, employment_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYMENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Salary Range</Label>
              <Input
                value={formData.salary_range || ""}
                onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                placeholder="e.g., NOK 600,000 - 800,000"
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Description</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewField(previewField === "description" ? null : "description")}
                >
                  {previewField === "description" ? <Pencil className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {previewField === "description" ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewField === "description" ? (
                <div 
                  className="border rounded-md p-4 min-h-[150px] prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: parseJobMarkdown(formData.description) }}
                />
              ) : (
                <>
                  <Textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use <code className="bg-muted px-1 rounded">-</code> for bullet points, <code className="bg-muted px-1 rounded">##</code> for headings, <code className="bg-muted px-1 rounded">**text**</code> for bold
                  </p>
                </>
              )}
            </div>

            {/* Requirements */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Requirements</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewField(previewField === "requirements" ? null : "requirements")}
                >
                  {previewField === "requirements" ? <Pencil className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {previewField === "requirements" ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewField === "requirements" ? (
                <div 
                  className="border rounded-md p-4 min-h-[150px] prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: parseJobMarkdown(formData.requirements) }}
                />
              ) : (
                <>
                  <Textarea
                    value={formData.requirements || ""}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="- 3+ years experience&#10;- Strong communication skills"
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use <code className="bg-muted px-1 rounded">-</code> for bullet points
                  </p>
                </>
              )}
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Benefits</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewField(previewField === "benefits" ? null : "benefits")}
                >
                  {previewField === "benefits" ? <Pencil className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {previewField === "benefits" ? "Edit" : "Preview"}
                </Button>
              </div>
              {previewField === "benefits" ? (
                <div 
                  className="border rounded-md p-4 min-h-[100px] prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: parseJobMarkdown(formData.benefits) }}
                />
              ) : (
                <>
                  <Textarea
                    value={formData.benefits || ""}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="- Competitive salary&#10;- Flexible hours"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use <code className="bg-muted px-1 rounded">-</code> for bullet points
                  </p>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="application" className="space-y-4">
            <div>
              <Label>Application URL</Label>
              <Input
                value={formData.application_url || ""}
                onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Application Email</Label>
              <Input
                value={formData.application_email || ""}
                onChange={(e) => setFormData({ ...formData, application_email: e.target.value })}
                placeholder="careers@company.com"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
