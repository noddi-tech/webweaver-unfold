import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash2, GripVertical, Save } from "lucide-react";

interface EvaluationCriteria {
  id: string;
  name: string;
  description: string | null;
  max_score: number;
  weight: number;
  category: string;
  active: boolean;
  sort_order: number;
}

const CATEGORIES = [
  { value: "technical", label: "Technical Skills" },
  { value: "soft_skills", label: "Soft Skills" },
  { value: "cultural", label: "Cultural Fit" },
  { value: "experience", label: "Experience" },
  { value: "general", label: "General" },
];

export default function EvaluationCriteriaManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editedCriteria, setEditedCriteria] = useState<Record<string, Partial<EvaluationCriteria>>>({});

  const { data: criteria = [], isLoading } = useQuery({
    queryKey: ["evaluation-criteria-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evaluation_criteria")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as EvaluationCriteria[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updates = Object.entries(editedCriteria).map(([id, changes]) => ({
        id,
        ...changes,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("evaluation_criteria")
          .update(update)
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-criteria-all"] });
      setEditedCriteria({});
      toast({ title: "Criteria saved successfully" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("evaluation_criteria")
        .insert({
          name: "New Criterion",
          description: "",
          max_score: 5,
          weight: 1.0,
          category: "general",
          sort_order: criteria.length,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-criteria-all"] });
      toast({ title: "Criterion added" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("evaluation_criteria")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluation-criteria-all"] });
      toast({ title: "Criterion deleted" });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
    },
  });

  const handleChange = (id: string, field: keyof EvaluationCriteria, value: any) => {
    setEditedCriteria(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const getValue = (item: EvaluationCriteria, field: keyof EvaluationCriteria) => {
    return editedCriteria[item.id]?.[field] ?? item[field];
  };

  const hasChanges = Object.keys(editedCriteria).length > 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Evaluation Criteria</h2>
          <p className="text-muted-foreground">Configure scoring dimensions for candidate evaluations</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Add Criterion
          </Button>
          {hasChanges && (
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {criteria.map((item) => (
          <Card key={item.id} className={!getValue(item, "active") ? "opacity-60" : ""}>
            <CardContent className="pt-4">
              <div className="flex gap-4 items-start">
                <div className="flex items-center justify-center w-8 h-8 text-muted-foreground cursor-grab">
                  <GripVertical className="w-4 h-4" />
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <Label>Name</Label>
                    <Input
                      value={getValue(item, "name") as string}
                      onChange={(e) => handleChange(item.id, "name", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={getValue(item, "category") as string}
                      onValueChange={(v) => handleChange(item.id, "category", v)}
                    >
                      <SelectTrigger className="mt-1">
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

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>Max Score</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={getValue(item, "max_score") as number}
                        onChange={(e) => handleChange(item.id, "max_score", parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Weight</Label>
                      <Input
                        type="number"
                        step={0.1}
                        min={0.1}
                        max={3}
                        value={getValue(item, "weight") as number}
                        onChange={(e) => handleChange(item.id, "weight", parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    <Label>Description</Label>
                    <Textarea
                      value={(getValue(item, "description") as string) || ""}
                      onChange={(e) => handleChange(item.id, "description", e.target.value)}
                      placeholder="Brief description of what to evaluate..."
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={getValue(item, "active") as boolean}
                        onCheckedChange={(v) => handleChange(item.id, "active", v)}
                      />
                      <Label>Active</Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this criterion? This cannot be undone.")) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {criteria.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">No evaluation criteria defined yet.</p>
          <Button variant="outline" className="mt-4" onClick={() => addMutation.mutate()}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Criterion
          </Button>
        </Card>
      )}
    </div>
  );
}
