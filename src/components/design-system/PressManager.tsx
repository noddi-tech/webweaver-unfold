import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAllPressMentions, PressMention } from "@/hooks/usePressMentions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, ExternalLink, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ImageFieldEditor } from "./ImageFieldEditor";

const CATEGORIES = [
  { value: "media_coverage", label: "Media Coverage" },
  { value: "press_release", label: "Press Release" },
  { value: "feature", label: "Feature" },
  { value: "interview", label: "Interview" },
];

interface PressFormData {
  title: string;
  source_name: string;
  source_logo_url: string;
  article_url: string;
  published_at: string;
  excerpt: string;
  category: string;
  active: boolean;
  featured: boolean;
}

const defaultFormData: PressFormData = {
  title: "",
  source_name: "",
  source_logo_url: "",
  article_url: "",
  published_at: "",
  excerpt: "",
  category: "media_coverage",
  active: true,
  featured: false,
};

export const PressManager = () => {
  const { data: mentions = [], isLoading } = useAllPressMentions();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMention, setEditingMention] = useState<PressMention | null>(null);
  const [formData, setFormData] = useState<PressFormData>(defaultFormData);

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingMention(null);
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.source_name || !formData.article_url) {
      toast.error("Title, source name, and article URL are required");
      return;
    }

    const { error } = await supabase.from("press_mentions").insert({
      title: formData.title,
      source_name: formData.source_name,
      source_logo_url: formData.source_logo_url || null,
      article_url: formData.article_url,
      published_at: formData.published_at || null,
      excerpt: formData.excerpt || null,
      category: formData.category,
      active: formData.active,
      featured: formData.featured,
      sort_order: mentions.length,
    });

    if (error) {
      toast.error("Failed to create press mention");
      return;
    }

    toast.success("Press mention created");
    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
    setIsCreateOpen(false);
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editingMention) return;

    const { error } = await supabase
      .from("press_mentions")
      .update({
        title: formData.title,
        source_name: formData.source_name,
        source_logo_url: formData.source_logo_url || null,
        article_url: formData.article_url,
        published_at: formData.published_at || null,
        excerpt: formData.excerpt || null,
        category: formData.category,
        active: formData.active,
        featured: formData.featured,
      })
      .eq("id", editingMention.id);

    if (error) {
      toast.error("Failed to update press mention");
      return;
    }

    toast.success("Press mention updated");
    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
    setEditingMention(null);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this press mention?")) return;

    const { error } = await supabase.from("press_mentions").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete press mention");
      return;
    }

    toast.success("Press mention deleted");
    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
  };

  const handleToggleActive = async (mention: PressMention) => {
    const { error } = await supabase
      .from("press_mentions")
      .update({ active: !mention.active })
      .eq("id", mention.id);

    if (error) {
      toast.error("Failed to update status");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
  };

  const handleToggleFeatured = async (mention: PressMention) => {
    const { error } = await supabase
      .from("press_mentions")
      .update({ featured: !mention.featured })
      .eq("id", mention.id);

    if (error) {
      toast.error("Failed to update featured status");
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
  };

  const handleMoveOrder = async (mention: PressMention, direction: "up" | "down") => {
    const currentIndex = mentions.findIndex((m) => m.id === mention.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= mentions.length) return;

    const otherMention = mentions[newIndex];

    await Promise.all([
      supabase.from("press_mentions").update({ sort_order: newIndex }).eq("id", mention.id),
      supabase.from("press_mentions").update({ sort_order: currentIndex }).eq("id", otherMention.id),
    ]);

    queryClient.invalidateQueries({ queryKey: ["press-mentions"] });
    queryClient.invalidateQueries({ queryKey: ["press-mentions-all"] });
  };

  const openEdit = (mention: PressMention) => {
    setEditingMention(mention);
    setFormData({
      title: mention.title,
      source_name: mention.source_name,
      source_logo_url: mention.source_logo_url || "",
      article_url: mention.article_url,
      published_at: mention.published_at ? mention.published_at.split("T")[0] : "",
      excerpt: mention.excerpt || "",
      category: mention.category,
      active: mention.active,
      featured: mention.featured,
    });
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Article Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Car dealers' missed opportunity..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source_name">Source Name *</Label>
          <Input
            id="source_name"
            value={formData.source_name}
            onChange={(e) => setFormData({ ...formData, source_name: e.target.value })}
            placeholder="Axios, TechCrunch, etc."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Source Logo/Image</Label>
        <ImageFieldEditor
          value={formData.source_logo_url}
          onChange={(url) => setFormData({ ...formData, source_logo_url: url })}
          label="Upload logo"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article_url">Article URL *</Label>
        <Input
          id="article_url"
          type="url"
          value={formData.article_url}
          onChange={(e) => setFormData({ ...formData, article_url: e.target.value })}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="published_at">Publication Date</Label>
        <Input
          id="published_at"
          type="date"
          value={formData.published_at}
          onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt (optional)</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          placeholder="Brief description or snippet..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Press Mentions</h2>
          <p className="text-muted-foreground">Manage press coverage and media mentions for the Newsroom</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Press Mention
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Press Mention</DialogTitle>
            </DialogHeader>
            <FormFields />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {mentions.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No press mentions yet. Add your first one!</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Active</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.map((mention, index) => (
              <TableRow key={mention.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveOrder(mention, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleMoveOrder(mention, "down")}
                      disabled={index === mentions.length - 1}
                    >
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate font-medium">{mention.title}</TableCell>
                <TableCell>{mention.source_name}</TableCell>
                <TableCell className="capitalize">{mention.category.replace("_", " ")}</TableCell>
                <TableCell>
                  {mention.published_at
                    ? format(new Date(mention.published_at), "MMM d, yyyy")
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={mention.active}
                    onCheckedChange={() => handleToggleActive(mention)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={mention.featured}
                    onCheckedChange={() => handleToggleFeatured(mention)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(mention.article_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(mention)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(mention.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editingMention} onOpenChange={(open) => !open && setEditingMention(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Press Mention</DialogTitle>
          </DialogHeader>
          <FormFields />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEditingMention(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
