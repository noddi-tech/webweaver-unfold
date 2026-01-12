import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Link2, Copy, Check, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface ReferralSource {
  id: string;
  name: string;
  category: string;
  tracking_code: string | null;
  icon_name: string | null;
  active: boolean;
  sort_order: number | null;
}

const CATEGORIES = [
  { value: "job_board", label: "Job Board" },
  { value: "referral", label: "Referral" },
  { value: "social", label: "Social Media" },
  { value: "organic", label: "Organic" },
  { value: "paid", label: "Paid Advertising" },
  { value: "other", label: "Other" },
];

const ICON_OPTIONS = [
  "Linkedin", "Briefcase", "Building", "Globe", "Users", "Twitter",
  "Facebook", "Search", "FileText", "MoreHorizontal", "Link", "Share2",
  "Mail", "Megaphone", "Target", "Zap"
];

export function SourceTrackingManager() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<ReferralSource | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    category: "job_board",
    tracking_code: "",
    icon_name: "Link",
    active: true
  });

  // Fetch sources
  const { data: sources = [], isLoading } = useQuery({
    queryKey: ["referral-sources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referral_sources")
        .select("*")
        .order("sort_order", { ascending: true });
      
      if (error) throw error;
      return data as ReferralSource[];
    }
  });

  // Create/update source
  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; category: string; tracking_code: string | null; icon_name: string; active: boolean }) => {
      if (editingSource) {
        const { error } = await supabase
          .from("referral_sources")
          .update(data)
          .eq("id", editingSource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("referral_sources")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-sources"] });
      toast.success(editingSource ? "Source updated" : "Source created");
      resetForm();
    },
    onError: (error) => {
      toast.error("Error: " + error.message);
    }
  });

  // Delete source
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("referral_sources")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-sources"] });
      toast.success("Source deleted");
    }
  });

  // Toggle active
  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("referral_sources")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral-sources"] });
    }
  });

  const resetForm = () => {
    setForm({
      name: "",
      category: "job_board",
      tracking_code: "",
      icon_name: "Link",
      active: true
    });
    setEditingSource(null);
    setIsAddDialogOpen(false);
  };

  const handleEdit = (source: ReferralSource) => {
    setEditingSource(source);
    setForm({
      name: source.name,
      category: source.category,
      tracking_code: source.tracking_code || "",
      icon_name: source.icon_name || "Link",
      active: source.active
    });
    setIsAddDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.category) {
      toast.error("Name and category are required");
      return;
    }
    
    saveMutation.mutate({
      name: form.name,
      category: form.category,
      tracking_code: form.tracking_code || null,
      icon_name: form.icon_name,
      active: form.active
    });
  };

  const getTrackableUrl = (trackingCode: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/careers?source=${trackingCode}`;
  };

  const copyToClipboard = (code: string) => {
    const url = getTrackableUrl(code);
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast.success("Link copied to clipboard");
  };

  const getIcon = (iconName: string | null) => {
    if (!iconName) return LucideIcons.Link;
    const Icon = (LucideIcons as any)[iconName];
    return Icon || LucideIcons.Link;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "job_board": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "referral": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "social": return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "organic": return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "paid": return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Referral Sources</h2>
          <p className="text-muted-foreground">Track where your candidates come from</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Source
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingSource ? "Edit Source" : "Add Referral Source"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="source-name">Name *</Label>
                <Input
                  id="source-name"
                  autoFocus
                  aria-required="true"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., LinkedIn"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-category">Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm(f => ({ ...f, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="source-tracking-code">Tracking Code</Label>
                <Input
                  id="source-tracking-code"
                  value={form.tracking_code}
                  onChange={(e) => setForm(f => ({ ...f, tracking_code: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="e.g., linkedin"
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs: ?source={form.tracking_code || "code"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Icon</Label>
                <Select
                  value={form.icon_name}
                  onValueChange={(v) => setForm(f => ({ ...f, icon_name: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map(icon => {
                      const IconComponent = getIcon(icon);
                      return (
                        <SelectItem key={icon} value={icon}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {icon}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={form.active}
                  onCheckedChange={(v) => setForm(f => ({ ...f, active: v }))}
                />
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit}>
                  {editingSource ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Tracking Code</TableHead>
                <TableHead>Trackable Link</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map(source => {
                const IconComponent = getIcon(source.icon_name);
                
                return (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{source.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(source.category)}>
                        {CATEGORIES.find(c => c.value === source.category)?.label || source.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {source.tracking_code || "-"}
                      </code>
                    </TableCell>
                    <TableCell>
                      {source.tracking_code ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={() => copyToClipboard(source.tracking_code!)}
                        >
                          {copiedCode === source.tracking_code ? (
                            <Check className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy Link
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={source.active}
                        onCheckedChange={(active) => toggleActive.mutate({ id: source.id, active })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(source)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteMutation.mutate(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Stats */}
      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.slice(0, 3).map(cat => {
          const count = sources.filter(s => s.category === cat.value && s.active).length;
          return (
            <Card key={cat.value}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-sm text-muted-foreground">{cat.label} Sources</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
