import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { useToast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, GripVertical } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CATEGORIES = ["Frontend", "Backend", "Infrastructure", "Tools"] as const;
type Category = typeof CATEGORIES[number];

interface TechStackItem {
  id: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  description: string | null;
  sort_order: number | null;
  active: boolean | null;
}

interface TechItemFormData {
  name: string;
  logo_url: string;
  category: string;
  description: string;
  active: boolean;
}

function SortableTechItem({ item, onEdit, onDelete }: { 
  item: TechStackItem; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border rounded-lg group hover:shadow-sm transition-shadow"
    >
      <button {...attributes} {...listeners} className="cursor-grab opacity-50 hover:opacity-100">
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {item.logo_url ? (
          <img src={item.logo_url} alt={item.name} className="w-6 h-6 object-contain" />
        ) : (
          <span className="text-lg font-bold text-muted-foreground">{item.name[0]}</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{item.name}</span>
          {!item.active && <Badge variant="outline" className="text-xs">Inactive</Badge>}
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function TechStackManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<TechStackItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TechItemFormData>({
    name: "",
    logo_url: "",
    category: "Frontend",
    description: "",
    active: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: techItems = [], isLoading } = useQuery({
    queryKey: ["tech-stack-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tech_stack_items")
        .select("*")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data as TechStackItem[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: TechItemFormData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("tech_stack_items")
          .update({
            name: data.name,
            logo_url: data.logo_url || null,
            category: data.category,
            description: data.description || null,
            active: data.active,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = techItems
          .filter((i) => i.category === data.category)
          .reduce((max, i) => Math.max(max, i.sort_order || 0), 0);
        
        const { error } = await supabase
          .from("tech_stack_items")
          .insert({
            name: data.name,
            logo_url: data.logo_url || null,
            category: data.category,
            description: data.description || null,
            active: data.active,
            sort_order: maxOrder + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-stack-items"] });
      toast({ title: editingItem ? "Technology updated" : "Technology added" });
      handleCloseDialog();
    },
    onError: (err: Error) => {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tech_stack_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-stack-items"] });
      toast({ title: "Technology deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; sort_order: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("tech_stack_items")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tech-stack-items"] });
    },
  });

  const handleOpenDialog = (item?: TechStackItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        logo_url: item.logo_url || "",
        category: item.category || "Frontend",
        description: item.description || "",
        active: item.active ?? true,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        logo_url: "",
        category: "Frontend",
        description: "",
        active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...formData, id: editingItem?.id });
  };

  const handleDragEnd = (event: DragEndEvent, category: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const categoryItems = techItems.filter((i) => i.category === category);
    const oldIndex = categoryItems.findIndex((i) => i.id === active.id);
    const newIndex = categoryItems.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(categoryItems, oldIndex, newIndex);
    const updates = reordered.map((item, index) => ({ id: item.id, sort_order: index }));
    reorderMutation.mutate(updates);
  };

  const groupedItems = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = techItems.filter((i) => i.category === cat);
    return acc;
  }, {} as Record<Category, TechStackItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tech Stack Manager</h2>
          <p className="text-muted-foreground">Manage technologies displayed on job listings</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Technology
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((category) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
                <CardDescription>{groupedItems[category].length} technologies</CardDescription>
              </CardHeader>
              <CardContent>
                {groupedItems[category].length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No technologies in this category yet.
                  </p>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, category)}
                  >
                    <SortableContext
                      items={groupedItems[category].map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {groupedItems[category].map((item) => (
                          <SortableTechItem
                            key={item.id}
                            item={item}
                            onEdit={() => handleOpenDialog(item)}
                            onDelete={() => deleteMutation.mutate(item.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Technology" : "Add Technology"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="React"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Logo URL</Label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://cdn.simpleicons.org/react/61DAFB"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use <a href="https://simpleicons.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  SimpleIcons <ExternalLink className="w-3 h-3 inline" />
                </a> or upload your own SVG/PNG
              </p>
              {formData.logo_url && (
                <div className="mt-2 p-3 bg-muted rounded-lg inline-flex">
                  <img src={formData.logo_url} alt="Preview" className="w-8 h-8 object-contain" />
                </div>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="How we use this technology..."
                rows={2}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData({ ...formData, active: v })}
              />
              <Label>Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSave} disabled={!formData.name || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {editingItem ? "Update" : "Add"} Technology
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
