import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye, EyeOff, Globe, Settings, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  meta_description?: string;
  meta_keywords?: string;
  default_background_token: string;
  default_text_token: string;
  default_padding_token: string;
  default_margin_token: string;
  default_max_width_token: string;
  layout_type: string;
  container_width: string;
  active: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const designTokenOptions = {
  background: ['background', 'card', 'primary', 'secondary', 'gradient-primary', 'gradient-background', 'gradient-hero', 'gradient-subtle'],
  text: ['foreground', 'muted-foreground', 'primary', 'secondary', 'accent', 'gradient-text'],
  spacing: ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'section'],
  container: ['none', 'sm', 'md', 'lg', 'xl', 'container', 'full']
};

const layoutTypes = ['standard', 'wide', 'full-width', 'sidebar'];

export const PagesManager = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    title: '',
    meta_description: '',
    meta_keywords: '',
    default_background_token: 'background',
    default_text_token: 'foreground',
    default_padding_token: 'section',
    default_margin_token: 'none',
    default_max_width_token: 'container',
    layout_type: 'standard',
    container_width: 'container',
    active: true,
    published: true
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      title: '',
      meta_description: '',
      meta_keywords: '',
      default_background_token: 'background',
      default_text_token: 'foreground',
      default_padding_token: 'section',
      default_margin_token: 'none',
      default_max_width_token: 'container',
      layout_type: 'standard',
      container_width: 'container',
      active: true,
      published: true
    });
    setSelectedPage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedPage) {
        const { error } = await supabase
          .from('pages')
          .update(formData)
          .eq('id', selectedPage.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Page updated successfully",
        });
        setIsEditModalOpen(false);
      } else {
        const { error } = await supabase
          .from('pages')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Page created successfully",
        });
        setIsCreateModalOpen(false);
      }

      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (page: Page) => {
    setSelectedPage(page);
    setFormData({
      name: page.name,
      slug: page.slug,
      title: page.title,
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      default_background_token: page.default_background_token,
      default_text_token: page.default_text_token,
      default_padding_token: page.default_padding_token,
      default_margin_token: page.default_margin_token,
      default_max_width_token: page.default_max_width_token,
      layout_type: page.layout_type,
      container_width: page.container_width,
      active: page.active,
      published: page.published
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Page deleted successfully",
      });
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: "Error",
        description: "Failed to delete page",
        variant: "destructive",
      });
    }
  };

  const generateSlugFromName = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const PageFormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">
            <Globe className="h-4 w-4 mr-2" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="design">
            <Settings className="h-4 w-4 mr-2" />
            Design Tokens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Page Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData(prev => ({
                    ...prev,
                    name,
                    slug: generateSlugFromName(name)
                  }));
                }}
                placeholder="Homepage"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="homepage"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">SEO Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Software that transforms car maintenance"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_description">Meta Description</Label>
            <Textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              placeholder="Brief description for search engines..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta_keywords">Meta Keywords</Label>
            <Input
              id="meta_keywords"
              value={formData.meta_keywords}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="layout_type">Layout Type</Label>
              <Select
                value={formData.layout_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, layout_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layoutTypes.map((layout) => (
                    <SelectItem key={layout} value={layout}>
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="container_width">Container Width</Label>
              <Select
                value={formData.container_width}
                onValueChange={(value) => setFormData(prev => ({ ...prev, container_width: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.container.map((width) => (
                    <SelectItem key={width} value={width}>
                      {width}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_background_token">Default Background</Label>
              <Select
                value={formData.default_background_token}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_background_token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.background.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_text_token">Default Text Color</Label>
              <Select
                value={formData.default_text_token}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_text_token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.text.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default_padding_token">Default Padding</Label>
              <Select
                value={formData.default_padding_token}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_padding_token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.spacing.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_margin_token">Default Margin</Label>
              <Select
                value={formData.default_margin_token}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_margin_token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.spacing.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_max_width_token">Default Max Width</Label>
              <Select
                value={formData.default_max_width_token}
                onValueChange={(value) => setFormData(prev => ({ ...prev, default_max_width_token: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designTokenOptions.container.map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex space-x-4 pt-4">
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          {selectedPage ? 'Update Page' : 'Create Page'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (selectedPage) {
              setIsEditModalOpen(false);
            } else {
              setIsCreateModalOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Pages Management</h2>
          <p className="text-muted-foreground">
            Manage your website pages and their default design settings
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Set up page information, SEO settings, and default design tokens
              </DialogDescription>
            </DialogHeader>
            <PageFormContent />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {pages.map((page) => (
          <Card key={page.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg">{page.name}</CardTitle>
                  <Badge variant={page.published ? "default" : "secondary"}>
                    {page.published ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                    {page.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge variant={page.active ? "default" : "destructive"}>
                    {page.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(page)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Page</DialogTitle>
                        <DialogDescription>
                          Update page information, SEO settings, and default design tokens
                        </DialogDescription>
                      </DialogHeader>
                      <PageFormContent />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>
                <div className="flex items-center space-x-4 text-sm">
                  <span>/{page.slug}</span>
                  <span>•</span>
                  <span>{page.layout_type} layout</span>
                  <span>•</span>
                  <span>{page.default_background_token} background</span>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{page.title}</p>
                {page.meta_description && (
                  <p className="text-sm text-muted-foreground">{page.meta_description}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};