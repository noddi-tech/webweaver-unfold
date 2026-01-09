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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { parseJobMarkdown } from "@/lib/markdownUtils";
import { useTechStack } from "@/hooks/useTechStack";
import { Pencil, Eye, Plus, Trash2, GripVertical } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface WorkAssignment {
  icon: string;
  title: string;
  description: string;
}

interface JobEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  initialField?: "description" | "requirements" | "benefits" | "title" | "basics" | "company_intro" | "work_assignments" | "tech_stack";
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
    company_intro?: string | null;
    work_assignments?: WorkAssignment[];
    tech_stack?: string[];
  };
}

const DEPARTMENTS = ["Engineering", "Sales", "Marketing", "Product", "Design", "Operations", "Customer Success"];
const LOCATIONS = ["Oslo", "Remote", "Hybrid", "London", "Stockholm"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];

const COMMON_ICONS = [
  "Code", "Database", "Server", "Cloud", "Monitor", "Smartphone", "Laptop",
  "Wrench", "Cog", "Users", "MessageSquare", "Mail", "FileText", "BarChart",
  "GitBranch", "Terminal", "Layers", "Package", "Zap", "Shield", "Lock",
  "Globe", "Rocket", "Target", "Lightbulb", "Puzzle", "Brain", "Heart"
];

export function JobEditModal({ open, onOpenChange, jobId, initialField = "description", jobData }: JobEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    ...jobData,
    company_intro: jobData.company_intro || "",
    work_assignments: jobData.work_assignments || [],
    tech_stack: jobData.tech_stack || [],
  });
  const [previewField, setPreviewField] = useState<"description" | "requirements" | "benefits" | "company_intro" | null>(null);
  
  const { data: allTechStack = [] } = useTechStack();

  useEffect(() => {
    setFormData({
      ...jobData,
      company_intro: jobData.company_intro || "",
      work_assignments: jobData.work_assignments || [],
      tech_stack: jobData.tech_stack || [],
    });
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
        company_intro: formData.company_intro?.trim() || null,
        work_assignments: JSON.parse(JSON.stringify(formData.work_assignments)),
        tech_stack: JSON.parse(JSON.stringify(formData.tech_stack)),
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
    if (initialField === "company_intro") return "intro";
    if (initialField === "work_assignments") return "assignments";
    if (initialField === "tech_stack") return "techstack";
    return "content";
  };

  // Work Assignments handlers
  const addAssignment = () => {
    setFormData({
      ...formData,
      work_assignments: [
        ...formData.work_assignments,
        { icon: "Code", title: "", description: "" }
      ]
    });
  };

  const updateAssignment = (index: number, field: keyof WorkAssignment, value: string) => {
    const updated = [...formData.work_assignments];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, work_assignments: updated });
  };

  const removeAssignment = (index: number) => {
    setFormData({
      ...formData,
      work_assignments: formData.work_assignments.filter((_, i) => i !== index)
    });
  };

  // Tech Stack handlers
  const toggleTechItem = (itemId: string) => {
    const current = formData.tech_stack || [];
    if (current.includes(itemId)) {
      setFormData({ ...formData, tech_stack: current.filter(id => id !== itemId) });
    } else {
      setFormData({ ...formData, tech_stack: [...current, itemId] });
    }
  };

  // Group tech stack by category
  const techByCategory = allTechStack.reduce((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof allTechStack>);

  const renderIcon = (iconName: string) => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    const Icon = icons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : <LucideIcons.Code className="w-5 h-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job Listing</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={getDefaultTab()} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="intro">Intro</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="techstack">Tech Stack</TabsTrigger>
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

          {/* Company Intro Tab */}
          <TabsContent value="intro" className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Company Introduction</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewField(previewField === "company_intro" ? null : "company_intro")}
                >
                  {previewField === "company_intro" ? <Pencil className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {previewField === "company_intro" ? "Edit" : "Preview"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Optional role-specific introduction. Leave empty to use the default company intro.
              </p>
              {previewField === "company_intro" ? (
                <div 
                  className="border rounded-md p-4 min-h-[200px] prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: parseJobMarkdown(formData.company_intro) }}
                />
              ) : (
                <Textarea
                  value={formData.company_intro || ""}
                  onChange={(e) => setFormData({ ...formData, company_intro: e.target.value })}
                  placeholder="Write a custom introduction for this role... (optional)"
                  rows={10}
                />
              )}
            </div>
          </TabsContent>

          {/* Work Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Work Assignments</Label>
                <p className="text-sm text-muted-foreground">Define what the candidate will be working on</p>
              </div>
              <Button variant="outline" size="sm" onClick={addAssignment}>
                <Plus className="w-4 h-4 mr-1" />
                Add Assignment
              </Button>
            </div>

            <div className="space-y-4">
              {formData.work_assignments.map((assignment, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab" />
                    
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-[120px_1fr] gap-3">
                        <div>
                          <Label className="text-xs">Icon</Label>
                          <Select
                            value={assignment.icon}
                            onValueChange={(v) => updateAssignment(index, "icon", v)}
                          >
                            <SelectTrigger>
                              <SelectValue>
                                <span className="flex items-center gap-2">
                                  {renderIcon(assignment.icon)}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {COMMON_ICONS.map((icon) => (
                                <SelectItem key={icon} value={icon}>
                                  <span className="flex items-center gap-2">
                                    {renderIcon(icon)}
                                    <span className="text-xs">{icon}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-xs">Title</Label>
                          <Input
                            value={assignment.title}
                            onChange={(e) => updateAssignment(index, "title", e.target.value)}
                            placeholder="e.g., Build APIs"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea
                          value={assignment.description}
                          onChange={(e) => updateAssignment(index, "description", e.target.value)}
                          placeholder="Describe what this assignment involves..."
                          rows={2}
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAssignment(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {formData.work_assignments.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <p>No work assignments defined yet.</p>
                  <p className="text-sm">Click "Add Assignment" to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tech Stack Tab */}
          <TabsContent value="techstack" className="space-y-4">
            <div>
              <Label>Tech Stack for this Role</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Select the technologies candidates will work with
              </p>
            </div>

            {Object.entries(techByCategory).map(([category, items]) => (
              <div key={category} className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">{category}</Label>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                        formData.tech_stack.includes(item.id)
                          ? "bg-primary/10 border-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={formData.tech_stack.includes(item.id)}
                        onCheckedChange={() => toggleTechItem(item.id)}
                      />
                      {item.logo_url && (
                        <img src={item.logo_url} alt={item.name} className="w-4 h-4 object-contain" />
                      )}
                      <span className="text-sm">{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            {allTechStack.length === 0 && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <p>No tech stack items configured.</p>
                <p className="text-sm">Add items in Design System → Tech Stack</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{formData.tech_stack.length}</span> technologies
              </p>
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