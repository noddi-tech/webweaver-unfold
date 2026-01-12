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
import { Trash2, Edit, Star, Eye, EyeOff, ExternalLink, Users } from "lucide-react";
import { ImageFieldEditor } from "./ImageFieldEditor";
import { format } from "date-fns";
import BlogRichTextEditor from "./BlogRichTextEditor";
import BlogPostPreview from "./BlogPostPreview";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image_url: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  author_title: string | null;
  author_employee_id: string | null;
  category: string | null;
  tags: string[];
  reading_time_minutes: number;
  published_at: string | null;
  active: boolean;
  featured: boolean;
  sort_order: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  og_title: string | null;
  og_description: string | null;
  canonical_url: string | null;
}

interface Employee {
  id: string;
  name: string;
  title: string | null;
  image_url: string | null;
}

const CATEGORIES = [
  "Product Updates",
  "Industry Insights",
  "Company News",
  "Tutorials",
  "Case Studies",
];

const emptyPost: Omit<BlogPost, "id"> = {
  slug: "",
  title: "",
  excerpt: null,
  content: null,
  featured_image_url: null,
  author_name: null,
  author_avatar_url: null,
  author_title: null,
  author_employee_id: null,
  category: null,
  tags: [],
  reading_time_minutes: 1,
  published_at: null,
  active: false,
  featured: false,
  sort_order: 0,
  meta_title: null,
  meta_description: null,
  og_image_url: null,
  og_title: null,
  og_description: null,
  canonical_url: null,
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

const calculateReadingTime = (content: string | null): number => {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
};

const BlogManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [creating, setCreating] = useState(false);
  const [newPost, setNewPost] = useState<Omit<BlogPost, "id">>(emptyPost);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("published_at", { ascending: false });

    if (error) {
      toast({ title: "Failed to load posts", description: error.message, variant: "destructive" });
    } else {
      setPosts(
        (data || []).map((p) => ({
          ...p,
          tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
          reading_time_minutes: p.reading_time_minutes || 1,
          sort_order: p.sort_order || 0,
        })) as BlogPost[]
      );
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, name, title, image_url")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (!error && data) {
      setEmployees(data);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchEmployees();
  }, []);

  const handleEmployeeSelect = (employeeId: string, post: Omit<BlogPost, "id"> | BlogPost, setter: (p: any) => void) => {
    if (employeeId === "custom") {
      setter({ ...post, author_employee_id: null });
    } else {
      const employee = employees.find((e) => e.id === employeeId);
      if (employee) {
        setter({
          ...post,
          author_employee_id: employee.id,
          author_name: employee.name,
          author_title: employee.title,
          author_avatar_url: employee.image_url,
        });
      }
    }
  };

  const handleContentChange = (content: string, post: Omit<BlogPost, "id"> | BlogPost, setter: (p: any) => void) => {
    const readingTime = calculateReadingTime(content);
    setter({ ...post, content, reading_time_minutes: readingTime });
  };

  const createPost = async () => {
    if (!newPost.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setCreating(true);
    const slug = newPost.slug.trim() || generateSlug(newPost.title.trim());
    const readingTime = calculateReadingTime(newPost.content);

    const { error } = await supabase.from("blog_posts").insert({
      slug,
      title: newPost.title.trim(),
      excerpt: newPost.excerpt?.trim() || null,
      content: newPost.content?.trim() || null,
      featured_image_url: newPost.featured_image_url?.trim() || null,
      author_name: newPost.author_name?.trim() || null,
      author_avatar_url: newPost.author_avatar_url?.trim() || null,
      author_title: newPost.author_title?.trim() || null,
      author_employee_id: newPost.author_employee_id || null,
      category: newPost.category || null,
      tags: newPost.tags,
      reading_time_minutes: readingTime,
      published_at: newPost.published_at || null,
      active: newPost.active,
      featured: newPost.featured,
      sort_order: newPost.sort_order,
      meta_title: newPost.meta_title?.trim() || null,
      meta_description: newPost.meta_description?.trim() || null,
      og_image_url: newPost.og_image_url?.trim() || null,
      og_title: newPost.og_title?.trim() || null,
      og_description: newPost.og_description?.trim() || null,
      canonical_url: newPost.canonical_url?.trim() || null,
    });

    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post created" });
      setNewPost(emptyPost);
      fetchPosts();
    }
  };

  const savePost = async (post: BlogPost) => {
    setSavingId(post.id);
    const readingTime = calculateReadingTime(post.content);

    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug: post.slug.trim() || generateSlug(post.title.trim()),
        title: post.title.trim(),
        excerpt: post.excerpt?.trim() || null,
        content: post.content?.trim() || null,
        featured_image_url: post.featured_image_url?.trim() || null,
        author_name: post.author_name?.trim() || null,
        author_avatar_url: post.author_avatar_url?.trim() || null,
        author_title: post.author_title?.trim() || null,
        author_employee_id: post.author_employee_id || null,
        category: post.category || null,
        tags: post.tags,
        reading_time_minutes: readingTime,
        published_at: post.published_at || null,
        active: post.active,
        featured: post.featured,
        sort_order: post.sort_order,
        meta_title: post.meta_title?.trim() || null,
        meta_description: post.meta_description?.trim() || null,
        og_image_url: post.og_image_url?.trim() || null,
        og_title: post.og_title?.trim() || null,
        og_description: post.og_description?.trim() || null,
        canonical_url: post.canonical_url?.trim() || null,
      })
      .eq("id", post.id);

    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post saved" });
      setShowEditDialog(false);
      setEditingPost(null);
      fetchPosts();
    }
  };

  const deletePost = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post deleted" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("blog_posts").update({ active }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, active } : p)));
      toast({ title: `Post ${active ? "published" : "unpublished"}` });
    }
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase.from("blog_posts").update({ featured }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, featured } : p)));
      toast({ title: `Post ${featured ? "featured" : "unfeatured"}` });
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost({ ...post });
    setShowEditDialog(true);
  };

  if (loading) {
    return (
      <Card className="p-6 bg-background border-border">
        <p className="text-muted-foreground">Loading blog posts...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Preview Modal */}
      {editingPost && (
        <BlogPostPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          post={editingPost}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>

          {editingPost && (
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="author">Author</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Title *</Label>
                    <Input
                      value={editingPost.title}
                      onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingPost.slug}
                      onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                      placeholder="auto-generated-from-title"
                    />
                  </div>
                </div>

                <div>
                  <Label>Excerpt</Label>
                  <Textarea
                    value={editingPost.excerpt || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                    placeholder="Brief summary for cards..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Content</Label>
                  <BlogRichTextEditor
                    value={editingPost.content || ""}
                    onChange={(content) => handleContentChange(content, editingPost, setEditingPost)}
                  />
                </div>

                <ImageFieldEditor
                  label="Featured Image"
                  value={editingPost.featured_image_url}
                  onChange={(url) => setEditingPost({ ...editingPost, featured_image_url: url })}
                  storagePath="blog"
                />
              </TabsContent>

              <TabsContent value="author" className="space-y-4">
                <div>
                  <Label>Select Team Member</Label>
                  <Select
                    value={editingPost.author_employee_id || "custom"}
                    onValueChange={(v) => handleEmployeeSelect(v, editingPost, setEditingPost)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an employee..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">
                        <span className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Custom author...
                        </span>
                      </SelectItem>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} {emp.title ? `(${emp.title})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Author Name</Label>
                    <Input
                      value={editingPost.author_name || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, author_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Author Title</Label>
                    <Input
                      value={editingPost.author_title || ""}
                      onChange={(e) => setEditingPost({ ...editingPost, author_title: e.target.value })}
                      placeholder="CEO, Product Manager..."
                    />
                  </div>
                </div>
                <ImageFieldEditor
                  label="Author Avatar"
                  value={editingPost.author_avatar_url}
                  onChange={(url) => setEditingPost({ ...editingPost, author_avatar_url: url })}
                  storagePath="blog/authors"
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label>Meta Title (60 chars recommended)</Label>
                  <Input
                    value={editingPost.meta_title || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, meta_title: e.target.value })}
                    placeholder={editingPost.title}
                  />
                  <p className={`text-xs mt-1 ${(editingPost.meta_title?.length || 0) > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                    {editingPost.meta_title?.length || 0}/60 characters
                  </p>
                </div>

                <div>
                  <Label>Meta Description (156 chars recommended)</Label>
                  <Textarea
                    value={editingPost.meta_description || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                    placeholder={editingPost.excerpt || "Brief description for search engines..."}
                    rows={3}
                  />
                  <p className={`text-xs mt-1 ${(editingPost.meta_description?.length || 0) > 156 ? "text-destructive" : "text-muted-foreground"}`}>
                    {editingPost.meta_description?.length || 0}/156 characters
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Open Graph (Social Sharing)</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>OG Image</Label>
                        {editingPost.featured_image_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPost({ ...editingPost, og_image_url: editingPost.featured_image_url })}
                            type="button"
                          >
                            Use Featured Image
                          </Button>
                        )}
                      </div>
                      <ImageFieldEditor
                        label="OG Image"
                        value={editingPost.og_image_url}
                        onChange={(url) => setEditingPost({ ...editingPost, og_image_url: url })}
                        storagePath="blog/og"
                      />
                    </div>
                    <div>
                      <Label>OG Title (optional)</Label>
                      <Input
                        value={editingPost.og_title || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, og_title: e.target.value })}
                        placeholder="Defaults to meta title"
                      />
                    </div>
                    <div>
                      <Label>OG Description (optional)</Label>
                      <Textarea
                        value={editingPost.og_description || ""}
                        onChange={(e) => setEditingPost({ ...editingPost, og_description: e.target.value })}
                        placeholder="Defaults to meta description"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Canonical URL (optional)</Label>
                  <Input
                    value={editingPost.canonical_url || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, canonical_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* SEO Preview */}
                <div className="border rounded-lg p-4 bg-muted/30">
                  <h4 className="text-sm font-medium mb-3">Google Search Preview</h4>
                  <div className="space-y-1">
                    <p className="text-primary text-lg truncate">
                      {editingPost.meta_title || editingPost.title || "Page Title"}
                    </p>
                    <p className="text-sm text-green-600 truncate">
                      navio.no/blog/{editingPost.slug || generateSlug(editingPost.title) || "post-slug"}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {editingPost.meta_description || editingPost.excerpt || "Add a meta description to control how this page appears in search results."}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={editingPost.category || ""}
                      onValueChange={(v) => setEditingPost({ ...editingPost, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Reading Time</Label>
                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                      <span className="text-muted-foreground">{editingPost.reading_time_minutes} min read</span>
                      <span className="text-xs text-muted-foreground">(auto-calculated)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sort Order</Label>
                    <Input
                      type="number"
                      value={editingPost.sort_order}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, sort_order: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Published At</Label>
                    <Input
                      type="datetime-local"
                      value={editingPost.published_at?.slice(0, 16) || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          published_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingPost.active}
                      onCheckedChange={(checked) => setEditingPost({ ...editingPost, active: checked })}
                    />
                    <span className="text-sm">Published</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingPost.featured}
                      onCheckedChange={(checked) => setEditingPost({ ...editingPost, featured: checked })}
                    />
                    <span className="text-sm">Featured</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingPost && savePost(editingPost)}
              disabled={savingId === editingPost?.id}
            >
              {savingId === editingPost?.id ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Post */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Add New Blog Post</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label>Title *</Label>
            <Input
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              placeholder="My Blog Post Title"
            />
          </div>
          <div>
            <Label>Slug (auto-generated)</Label>
            <Input
              value={newPost.slug}
              onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
              placeholder="my-blog-post-title"
            />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={newPost.category || ""}
              onValueChange={(v) => setNewPost({ ...newPost, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={createPost} disabled={creating} className="w-full">
              {creating ? "Creating..." : "Create Post"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Posts Table */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Blog Posts ({posts.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                <TableCell>
                  {post.category && <Badge variant="secondary">{post.category}</Badge>}
                </TableCell>
                <TableCell>
                  {post.published_at ? format(new Date(post.published_at), "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(post.id, !post.active)}
                  >
                    {post.active ? (
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
                    onClick={() => toggleFeatured(post.id, !post.featured)}
                  >
                    <Star
                      className={`w-4 h-4 ${post.featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`}
                    />
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      disabled={deletingId === post.id}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BlogManager;
