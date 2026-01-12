import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  useBlogCategories, 
  useCreateBlogCategory, 
  useUpdateBlogCategory, 
  useDeleteBlogCategory,
  BlogCategory 
} from '@/hooks/useBlogCategories';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const BlogCategoriesManager = () => {
  const { toast } = useToast();
  const { data: categories = [], isLoading } = useBlogCategories(true);
  const createCategory = useCreateBlogCategory();
  const updateCategory = useUpdateBlogCategory();
  const deleteCategory = useDeleteBlogCategory();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<BlogCategory> | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    description: '',
    color: '#6366f1',
    icon: '',
    active: true,
  });

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
      await createCategory.mutateAsync({
        ...newCategory,
        slug: newCategory.slug || generateSlug(newCategory.name),
      });
      toast({ title: 'Category created' });
      setNewCategory({ name: '', slug: '', description: '', color: '#6366f1', icon: '', active: true });
    } catch (error: any) {
      toast({ title: 'Failed to create category', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory?.id || !editingCategory.name?.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }

    try {
      await updateCategory.mutateAsync({
        id: editingCategory.id,
        name: editingCategory.name,
        slug: editingCategory.slug || generateSlug(editingCategory.name),
        description: editingCategory.description,
        color: editingCategory.color,
        icon: editingCategory.icon,
        active: editingCategory.active,
        sort_order: editingCategory.sort_order,
      });
      toast({ title: 'Category updated' });
      setShowDialog(false);
      setEditingCategory(null);
    } catch (error: any) {
      toast({ title: 'Failed to update category', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: 'Category deleted' });
    } catch (error: any) {
      toast({ title: 'Failed to delete category', description: error.message, variant: 'destructive' });
    }
  };

  const openEditDialog = (category: BlogCategory) => {
    setEditingCategory({ ...category });
    setShowDialog(true);
  };

  if (isLoading) {
    return <Card className="p-6"><p className="text-muted-foreground">Loading categories...</p></Card>;
  }

  return (
    <div className="space-y-6">
      {/* Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ 
                    ...editingCategory, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <Label>Slug</Label>
                <Input
                  value={editingCategory.slug || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div>
                  <Label>Color</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-20 h-10"
                        style={{ backgroundColor: editingCategory.color }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <HexColorPicker 
                        color={editingCategory.color || '#6366f1'} 
                        onChange={(color) => setEditingCategory({ ...editingCategory, color })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label>Sort Order</Label>
                  <Input
                    type="number"
                    value={editingCategory.sort_order || 0}
                    onChange={(e) => setEditingCategory({ 
                      ...editingCategory, 
                      sort_order: parseInt(e.target.value) || 0 
                    })}
                    className="w-20"
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={editingCategory.active ?? true}
                    onCheckedChange={(checked) => setEditingCategory({ ...editingCategory, active: checked })}
                  />
                  <span className="text-sm">Active</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={updateCategory.isPending}>
              {updateCategory.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Form */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Add New Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <Label>Name *</Label>
            <Input
              value={newCategory.name}
              onChange={(e) => setNewCategory({ 
                ...newCategory, 
                name: e.target.value,
                slug: generateSlug(e.target.value)
              })}
              placeholder="Product Updates"
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={newCategory.slug}
              onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
              placeholder="product-updates"
            />
          </div>
          <div>
            <Label>Color</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full h-10"
                  style={{ backgroundColor: newCategory.color }}
                >
                  <span className="sr-only">Pick color</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <HexColorPicker 
                  color={newCategory.color} 
                  onChange={(color) => setNewCategory({ ...newCategory, color })}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2 h-10">
            <Switch
              checked={newCategory.active}
              onCheckedChange={(checked) => setNewCategory({ ...newCategory, active: checked })}
            />
            <span className="text-sm">Active</span>
          </div>
          <Button onClick={handleCreate} disabled={createCategory.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            {createCategory.isPending ? 'Creating...' : 'Add Category'}
          </Button>
        </div>
      </Card>

      {/* Categories Table */}
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">
          Categories ({categories.length})
        </h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </TableCell>
                <TableCell>
                  <div 
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: category.color }}
                  />
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{category.slug}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{category.post_count}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.active ? 'default' : 'outline'}>
                    {category.active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(category.id)}
                      disabled={deleteCategory.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No categories yet. Create your first category above.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default BlogCategoriesManager;
