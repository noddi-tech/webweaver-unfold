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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Plus, X, Edit, MoveUp, MoveDown, AlertTriangle } from "lucide-react";
import { ImageFieldEditor } from "./ImageFieldEditor";
import type { Json } from "@/integrations/supabase/types";

interface StoryResult {
  icon: string;
  metric: string;
  description: string;
}

interface StoryRow {
  id: string;
  slug: string;
  company_name: string;
  company_logo_url: string | null;
  title: string;
  hero_image_url: string | null;
  about_company: string | null;
  use_case: string | null;
  impact_statement: string | null;
  product_screenshot_url: string | null;
  quote_text: string | null;
  quote_author: string | null;
  quote_author_title: string | null;
  results: StoryResult[];
  final_cta_heading: string | null;
  final_cta_description: string | null;
  final_cta_button_text: string | null;
  final_cta_button_url: string | null;
  active: boolean;
  sort_order: number | null;
}

const emptyNew: Omit<StoryRow, "id"> = {
  slug: "",
  company_name: "",
  company_logo_url: null,
  title: "",
  hero_image_url: null,
  about_company: null,
  use_case: null,
  impact_statement: null,
  product_screenshot_url: null,
  quote_text: null,
  quote_author: null,
  quote_author_title: null,
  results: [],
  final_cta_heading: "Ready to transform your business?",
  final_cta_description: null,
  final_cta_button_text: "Book a Demo",
  final_cta_button_url: "/contact",
  active: true,
  sort_order: 0,
};

// Generate URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

function parseResults(results: Json | null): StoryResult[] {
  if (!results || !Array.isArray(results)) return [];
  return results.map((r: any) => ({
    icon: r?.icon || "TrendingUp",
    metric: r?.metric || "",
    description: r?.description || ""
  }));
}

// Fields that should warn user if saving empty when they had a value
const PROTECTED_FIELDS: (keyof StoryRow)[] = [
  'company_name',
  'title',
  'about_company',
  'use_case',
  'impact_statement',
  'quote_text',
  'quote_author',
  'final_cta_heading',
  'final_cta_button_text'
];

const StoriesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newStory, setNewStory] = useState<Omit<StoryRow, "id">>(emptyNew);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<StoryRow | null>(null);
  const [originalStory, setOriginalStory] = useState<StoryRow | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [emptyFields, setEmptyFields] = useState<string[]>([]);

  const fetchStories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("customer_stories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Failed to load stories", description: error.message, variant: "destructive" });
    }

    setStories((data || []).map(s => ({
      ...s,
      results: parseResults(s.results)
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const resetNew = () => setNewStory(emptyNew);

  const createStory = async () => {
    if (!newStory.company_name.trim()) {
      toast({ title: "Company name is required", variant: "destructive" });
      return;
    }
    if (!newStory.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setCreating(true);
    const slug = newStory.slug.trim() || generateSlug(newStory.title.trim());
    
    const { error } = await supabase.from("customer_stories").insert({
      slug,
      company_name: newStory.company_name.trim(),
      company_logo_url: newStory.company_logo_url?.trim() || null,
      title: newStory.title.trim(),
      hero_image_url: newStory.hero_image_url?.trim() || null,
      about_company: newStory.about_company?.trim() || null,
      use_case: newStory.use_case?.trim() || null,
      impact_statement: newStory.impact_statement?.trim() || null,
      product_screenshot_url: newStory.product_screenshot_url?.trim() || null,
      quote_text: newStory.quote_text?.trim() || null,
      quote_author: newStory.quote_author?.trim() || null,
      quote_author_title: newStory.quote_author_title?.trim() || null,
      results: newStory.results as any,
      final_cta_heading: newStory.final_cta_heading?.trim() || null,
      final_cta_description: newStory.final_cta_description?.trim() || null,
      final_cta_button_text: newStory.final_cta_button_text?.trim() || null,
      final_cta_button_url: newStory.final_cta_button_url?.trim() || null,
      active: newStory.active,
      sort_order: newStory.sort_order ?? 0,
    });

    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Story created" });
      resetNew();
      fetchStories();
    }
  };

  const checkEmptyFields = (story: StoryRow): string[] => {
    if (!originalStory) return [];
    
    const emptyList: string[] = [];
    
    for (const field of PROTECTED_FIELDS) {
      const originalValue = originalStory[field];
      const newValue = story[field];
      
      // If original had a value and new is empty/null
      if (originalValue && typeof originalValue === 'string' && originalValue.trim() !== '') {
        if (!newValue || (typeof newValue === 'string' && newValue.trim() === '')) {
          emptyList.push(field.replace(/_/g, ' '));
        }
      }
    }
    
    return emptyList;
  };

  const saveStory = async (story: StoryRow, bypassWarning = false) => {
    // Check for empty fields that previously had values
    if (!bypassWarning) {
      const fieldsBeingCleared = checkEmptyFields(story);
      if (fieldsBeingCleared.length > 0) {
        setEmptyFields(fieldsBeingCleared);
        setShowEmptyWarning(true);
        return;
      }
    }

    setSavingId(story.id);
    const { error } = await supabase
      .from("customer_stories")
      .update({
        slug: story.slug.trim() || generateSlug(story.title.trim()),
        company_name: story.company_name.trim(),
        company_logo_url: story.company_logo_url?.trim() || null,
        title: story.title.trim(),
        hero_image_url: story.hero_image_url?.trim() || null,
        about_company: story.about_company?.trim() || null,
        use_case: story.use_case?.trim() || null,
        impact_statement: story.impact_statement?.trim() || null,
        product_screenshot_url: story.product_screenshot_url?.trim() || null,
        quote_text: story.quote_text?.trim() || null,
        quote_author: story.quote_author?.trim() || null,
        quote_author_title: story.quote_author_title?.trim() || null,
        results: story.results as any,
        final_cta_heading: story.final_cta_heading?.trim() || null,
        final_cta_description: story.final_cta_description?.trim() || null,
        final_cta_button_text: story.final_cta_button_text?.trim() || null,
        final_cta_button_url: story.final_cta_button_url?.trim() || null,
        active: story.active,
        sort_order: story.sort_order ?? 0,
      })
      .eq("id", story.id);

    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Story saved" });
      setShowEditDialog(false);
      setEditingStory(null);
      setOriginalStory(null);
      fetchStories();
    }
  };

  const deleteStory = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("customer_stories").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Story deleted" });
      setStories((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const updateLocal = (id: string, patch: Partial<StoryRow>) => {
    setStories((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const updateEditing = (patch: Partial<StoryRow>) => {
    if (editingStory) {
      setEditingStory({ ...editingStory, ...patch });
    }
  };

  const addResult = () => {
    if (editingStory) {
      const newResults = [...editingStory.results, { icon: "TrendingUp", metric: "", description: "" }];
      setEditingStory({ ...editingStory, results: newResults });
    }
  };

  const removeResult = (index: number) => {
    if (editingStory) {
      const newResults = editingStory.results.filter((_, i) => i !== index);
      setEditingStory({ ...editingStory, results: newResults });
    }
  };

  const updateResult = (index: number, field: keyof StoryResult, value: string) => {
    if (editingStory) {
      const newResults = [...editingStory.results];
      newResults[index] = { ...newResults[index], [field]: value };
      setEditingStory({ ...editingStory, results: newResults });
    }
  };

  const moveResult = (index: number, direction: 'up' | 'down') => {
    if (!editingStory) return;
    const newResults = [...editingStory.results];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newResults.length) return;
    [newResults[index], newResults[newIndex]] = [newResults[newIndex], newResults[index]];
    setEditingStory({ ...editingStory, results: newResults });
  };

  const openEditDialog = async (storyId: string) => {
    // Fetch fresh data from database to ensure ALL fields are loaded
    const { data, error } = await supabase
      .from("customer_stories")
      .select("*")
      .eq("id", storyId)
      .single();
    
    if (error) {
      toast({ title: "Failed to load story", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      const storyData: StoryRow = {
        id: data.id,
        slug: data.slug,
        company_name: data.company_name,
        company_logo_url: data.company_logo_url,
        title: data.title,
        hero_image_url: data.hero_image_url,
        about_company: data.about_company,
        use_case: data.use_case,
        impact_statement: data.impact_statement,
        product_screenshot_url: data.product_screenshot_url,
        quote_text: data.quote_text,
        quote_author: data.quote_author,
        quote_author_title: data.quote_author_title,
        results: parseResults(data.results),
        final_cta_heading: data.final_cta_heading,
        final_cta_description: data.final_cta_description,
        final_cta_button_text: data.final_cta_button_text,
        final_cta_button_url: data.final_cta_button_url,
        active: data.active,
        sort_order: data.sort_order,
      };
      
      setEditingStory(storyData);
      // Store original for comparison when saving
      setOriginalStory({ ...storyData, results: [...storyData.results] });
      setShowEditDialog(true);
    }
  };

  const autoSaveSortOrder = async (id: string, sortOrder: number) => {
    updateLocal(id, { sort_order: sortOrder });
    const { error } = await supabase
      .from("customer_stories")
      .update({ sort_order: sortOrder })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Failed to update sort order", description: error.message, variant: "destructive" });
    }
  };

  const autoSaveActive = async (id: string, active: boolean) => {
    updateLocal(id, { active });
    const { error } = await supabase
      .from("customer_stories")
      .update({ active })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Failed to update active status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Story ${active ? 'activated' : 'deactivated'}` });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6 bg-background border-border">
          <p className="text-muted-foreground">Loading stories...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Empty Field Warning Dialog */}
      <AlertDialog open={showEmptyWarning} onOpenChange={setShowEmptyWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Warning: Empty Fields Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              The following fields had values but are now empty:
              <ul className="list-disc list-inside mt-2 text-foreground">
                {emptyFields.map((field) => (
                  <li key={field} className="capitalize">{field}</li>
                ))}
              </ul>
              <p className="mt-3">Are you sure you want to save with these fields cleared?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowEmptyWarning(false);
                if (editingStory) {
                  saveStory(editingStory, true);
                }
              }}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Save Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Story */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Add New Story</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Company Name *</label>
            <Input
              value={newStory.company_name}
              onChange={(e) => setNewStory({ ...newStory, company_name: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Title *</label>
            <Input
              value={newStory.title}
              onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
              placeholder="How Acme increased efficiency by 50%"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Slug (auto-generated if empty)</label>
            <Input
              value={newStory.slug}
              onChange={(e) => setNewStory({ ...newStory, slug: e.target.value })}
              placeholder="acme-success-story"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Sort Order</label>
            <Input
              type="number"
              value={newStory.sort_order ?? 0}
              onChange={(e) => setNewStory({ ...newStory, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <Switch
              checked={newStory.active}
              onCheckedChange={(checked) => setNewStory({ ...newStory, active: checked })}
            />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="flex items-end">
            <Button onClick={createStory} disabled={creating}>
              {creating ? "Creating..." : "Create Story"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Stories Table */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Customer Stories ({stories.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stories.map((story) => (
              <TableRow key={story.id}>
                <TableCell className="font-medium">{story.company_name}</TableCell>
                <TableCell className="max-w-[200px] truncate">{story.title}</TableCell>
                <TableCell className="text-muted-foreground">{story.slug}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={story.sort_order ?? 0}
                    onChange={(e) => autoSaveSortOrder(story.id, parseInt(e.target.value) || 0)}
                    className="w-16"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={story.active}
                      onCheckedChange={(checked) => autoSaveActive(story.id, checked)}
                    />
                    <Badge variant={story.active ? "default" : "secondary"}>
                      {story.active ? "Active" : "Draft"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(story.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteStory(story.id)}
                      disabled={deletingId === story.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {stories.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No stories yet. Create one above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setEditingStory(null);
          setOriginalStory(null);
        }
        setShowEditDialog(open);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Story: {editingStory?.company_name}</DialogTitle>
            <DialogDescription>
              All fields are loaded from the database. Make your changes and click Save.
            </DialogDescription>
          </DialogHeader>

          {editingStory && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="quote">Quote</TabsTrigger>
                <TabsTrigger value="results">Results & CTA</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Company Name *</label>
                    <Input
                      value={editingStory.company_name}
                      onChange={(e) => updateEditing({ company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Title *</label>
                    <Input
                      value={editingStory.title}
                      onChange={(e) => updateEditing({ title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Slug</label>
                    <Input
                      value={editingStory.slug}
                      onChange={(e) => updateEditing({ slug: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Sort Order</label>
                    <Input
                      type="number"
                      value={editingStory.sort_order ?? 0}
                      onChange={(e) => updateEditing({ sort_order: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  {/* Company Logo */}
                  <div className="col-span-2">
                    <ImageFieldEditor
                      label="Company Logo"
                      value={editingStory.company_logo_url}
                      onChange={(url) => updateEditing({ company_logo_url: url })}
                      storagePath="stories/logos"
                      previewHeight="h-24"
                    />
                  </div>

                  {/* Hero Image */}
                  <div className="col-span-2">
                    <ImageFieldEditor
                      label="Hero Image"
                      value={editingStory.hero_image_url}
                      onChange={(url) => updateEditing({ hero_image_url: url })}
                      storagePath="stories/heroes"
                      previewHeight="h-40"
                    />
                  </div>

                  {/* Product Screenshot */}
                  <div className="col-span-2">
                    <ImageFieldEditor
                      label="Product Screenshot"
                      value={editingStory.product_screenshot_url}
                      onChange={(url) => updateEditing({ product_screenshot_url: url })}
                      storagePath="stories/screenshots"
                      previewHeight="h-48"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">About Company</label>
                  <Textarea
                    value={editingStory.about_company || ""}
                    onChange={(e) => updateEditing({ about_company: e.target.value })}
                    rows={4}
                    placeholder="Tell us about the company..."
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Use Case</label>
                  <Textarea
                    value={editingStory.use_case || ""}
                    onChange={(e) => updateEditing({ use_case: e.target.value })}
                    rows={4}
                    placeholder="What problem were they solving?"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Impact Statement</label>
                  <Textarea
                    value={editingStory.impact_statement || ""}
                    onChange={(e) => updateEditing({ impact_statement: e.target.value })}
                    rows={4}
                    placeholder="What was the outcome?"
                  />
                </div>
              </TabsContent>

              <TabsContent value="quote" className="space-y-4 pt-4">
                <div>
                  <label className="text-sm text-muted-foreground">Quote Text</label>
                  <Textarea
                    value={editingStory.quote_text || ""}
                    onChange={(e) => updateEditing({ quote_text: e.target.value })}
                    rows={4}
                    placeholder="What did they say about working with you?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Quote Author</label>
                    <Input
                      value={editingStory.quote_author || ""}
                      onChange={(e) => updateEditing({ quote_author: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Author Title</label>
                    <Input
                      value={editingStory.quote_author_title || ""}
                      onChange={(e) => updateEditing({ quote_author_title: e.target.value })}
                      placeholder="CEO at Company"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="space-y-4 pt-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Results Cards</label>
                    <Button variant="outline" size="sm" onClick={addResult}>
                      <Plus className="h-4 w-4 mr-1" /> Add Result
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {editingStory.results.map((result, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Icon</label>
                            <Input
                              value={result.icon}
                              onChange={(e) => updateResult(index, 'icon', e.target.value)}
                              placeholder="TrendingUp"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Metric</label>
                            <Input
                              value={result.metric}
                              onChange={(e) => updateResult(index, 'metric', e.target.value)}
                              placeholder="50%"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Description</label>
                            <Input
                              value={result.description}
                              onChange={(e) => updateResult(index, 'description', e.target.value)}
                              placeholder="Increase in efficiency"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveResult(index, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveResult(index, 'down')}
                            disabled={index === editingStory.results.length - 1}
                          >
                            <MoveDown className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => removeResult(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {editingStory.results.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No results added yet. Click "Add Result" to add one.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium mb-3">Final CTA Section</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">CTA Heading</label>
                      <Input
                        value={editingStory.final_cta_heading || ""}
                        onChange={(e) => updateEditing({ final_cta_heading: e.target.value })}
                        placeholder="Ready to transform your business?"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-muted-foreground">CTA Description</label>
                      <Textarea
                        value={editingStory.final_cta_description || ""}
                        onChange={(e) => updateEditing({ final_cta_description: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Button Text</label>
                      <Input
                        value={editingStory.final_cta_button_text || ""}
                        onChange={(e) => updateEditing({ final_cta_button_text: e.target.value })}
                        placeholder="Book a Demo"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Button URL</label>
                      <Input
                        value={editingStory.final_cta_button_url || ""}
                        onChange={(e) => updateEditing({ final_cta_button_url: e.target.value })}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingStory && saveStory(editingStory)}
              disabled={savingId === editingStory?.id}
            >
              {savingId === editingStory?.id ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StoriesManager;
