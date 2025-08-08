import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  icon_name: string;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

const emptyNew: Omit<FeatureRow, "id"> = {
  title: "",
  description: "",
  icon_name: "Sparkles",
  sort_order: 0,
};

const FeaturesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newFeature, setNewFeature] = useState<Omit<FeatureRow, "id">>(emptyNew);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("features")
      .select("id,title,description,icon_name,sort_order,created_at,updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to load features", description: error.message, variant: "destructive" });
    } else {
      setFeatures(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const resetNew = () => setNewFeature(emptyNew);

  const createFeature = async () => {
    if (!newFeature.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("features").insert({
      title: newFeature.title.trim(),
      description: newFeature.description?.trim() || null,
      icon_name: newFeature.icon_name?.trim() || "Sparkles",
      sort_order: newFeature.sort_order ?? 0,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature created" });
      resetNew();
      fetchFeatures();
    }
  };

  const saveFeature = async (row: FeatureRow) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("features")
      .update({
        title: row.title.trim(),
        description: row.description?.trim() || null,
        icon_name: row.icon_name?.trim() || "Sparkles",
        sort_order: row.sort_order ?? 0,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature saved" });
      fetchFeatures();
    }
  };

  const deleteFeature = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("features").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Feature deleted" });
      setFeatures((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const updateLocal = (id: string, patch: Partial<FeatureRow>) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Add Feature</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Title"
            value={newFeature.title}
            onChange={(e) => setNewFeature((s) => ({ ...s, title: e.target.value }))}
          />
          <Input
            placeholder="Icon name (e.g., Truck, Calendar, BarChart3)"
            value={newFeature.icon_name}
            onChange={(e) => setNewFeature((s) => ({ ...s, icon_name: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="Sort order"
            value={newFeature.sort_order ?? 0}
            onChange={(e) => setNewFeature((s) => ({ ...s, sort_order: Number(e.target.value) }))}
          />
          <Button onClick={createFeature} disabled={creating}>
            {creating ? "Creating..." : "Create"}
          </Button>
          <div className="md:col-span-4">
            <Textarea
              placeholder="Description"
              value={newFeature.description ?? ""}
              onChange={(e) => setNewFeature((s) => ({ ...s, description: e.target.value }))}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Tip: Icons are from lucide-react. Use names like Truck, Calendar, BarChart3, Wrench, Shield, Zap, Users, Clock, DollarSign, etc.
        </p>
      </Card>

      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Features ({features.length})</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18rem]">Title</TableHead>
                <TableHead className="w-[12rem]">Icon</TableHead>
                <TableHead className="w-[8rem]">Sort</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[10rem] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : features.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No features yet.
                  </TableCell>
                </TableRow>
              ) : (
                features.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <Input value={f.title} onChange={(e) => updateLocal(f.id, { title: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={f.icon_name}
                        onChange={(e) => updateLocal(f.id, { icon_name: e.target.value })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={f.sort_order ?? 0}
                        onChange={(e) => updateLocal(f.id, { sort_order: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={f.description ?? ""}
                        onChange={(e) => updateLocal(f.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="secondary" size="sm" onClick={() => saveFeature(f)} disabled={savingId === f.id}>
                        {savingId === f.id ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteFeature(f.id)} disabled={deletingId === f.id}>
                        {deletingId === f.id ? "Deleting..." : "Delete"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default FeaturesManager;
