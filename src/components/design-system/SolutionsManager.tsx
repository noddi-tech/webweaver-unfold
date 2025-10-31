import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import IconPicker from "./IconPicker";
import { Trash2, Plus, X } from "lucide-react";

interface SolutionRow {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_name: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  benefits: string[];
  sort_order: number;
  active: boolean;
}

interface SolutionSettings {
  id?: string;
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  subtitle_token: string;
  description_token: string;
}

const emptyNew: Omit<SolutionRow, "id"> = {
  title: "",
  subtitle: "",
  description: "",
  icon_name: "Sparkles",
  image_url: "",
  cta_text: "Learn More",
  cta_url: "",
  benefits: [],
  sort_order: 0,
  active: true,
};

const tokenOptions = {
  bg: ["background", "card", "gradient-primary", "gradient-background", "gradient-hero"],
  text: ["foreground", "muted-foreground", "primary", "secondary", "accent"],
  border: ["border"],
};

const SolutionsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<SolutionRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newSolution, setNewSolution] = useState<Omit<SolutionRow, "id">>(emptyNew);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState("");

  const [settings, setSettings] = useState<SolutionSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchSolutions = async () => {
    setLoading(true);
    const [{ data: sols, error: err1 }, { data: setts, error: err2 }] = await Promise.all([
      supabase
        .from("solutions")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase
        .from("solutions_settings")
        .select("*")
        .limit(1),
    ]);

    if (err1) toast({ title: "Failed to load solutions", description: err1.message, variant: "destructive" });
    if (err2) toast({ title: "Failed to load settings", description: err2.message, variant: "destructive" });

    setSolutions((sols || []).map(s => ({
      ...s,
      benefits: (Array.isArray(s.benefits) ? s.benefits : []) as string[]
    })));
    setSettings((setts && setts[0]) || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const resetNew = () => setNewSolution(emptyNew);

  const addBenefitToNew = () => {
    if (newBenefit.trim()) {
      setNewSolution((s) => ({ ...s, benefits: [...s.benefits, newBenefit.trim()] }));
      setNewBenefit("");
    }
  };

  const removeBenefitFromNew = (idx: number) => {
    setNewSolution((s) => ({ ...s, benefits: s.benefits.filter((_, i) => i !== idx) }));
  };

  const createSolution = async () => {
    if (!newSolution.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("solutions").insert({
      title: newSolution.title.trim(),
      subtitle: newSolution.subtitle?.trim() || null,
      description: newSolution.description?.trim() || null,
      icon_name: newSolution.icon_name?.trim() || "Sparkles",
      image_url: newSolution.image_url?.trim() || null,
      cta_text: newSolution.cta_text?.trim() || null,
      cta_url: newSolution.cta_url?.trim() || null,
      benefits: newSolution.benefits,
      sort_order: newSolution.sort_order ?? 0,
      active: newSolution.active,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Create failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solution created" });
      resetNew();
      fetchSolutions();
    }
  };

  const saveSolution = async (row: SolutionRow) => {
    setSavingId(row.id);
    const { error } = await supabase
      .from("solutions")
      .update({
        title: row.title.trim(),
        subtitle: row.subtitle?.trim() || null,
        description: row.description?.trim() || null,
        icon_name: row.icon_name?.trim() || "Sparkles",
        image_url: row.image_url?.trim() || null,
        cta_text: row.cta_text?.trim() || null,
        cta_url: row.cta_url?.trim() || null,
        benefits: row.benefits,
        sort_order: row.sort_order ?? 0,
        active: row.active,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solution saved" });
      fetchSolutions();
    }
  };

  const deleteSolution = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from("solutions").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solution deleted" });
      setSolutions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const updateLocal = (id: string, patch: Partial<SolutionRow>) => {
    setSolutions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const payload = { ...settings } as any;
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("solutions_settings").upsert(payload, { onConflict: "id" });
    setSavingSettings(false);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Design settings saved" });
      fetchSolutions();
    }
  };

  return (
    <div className="space-y-8">
      {/* Design Settings */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Design Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Section Title</label>
            <Input
              value={settings?.section_title ?? ""}
              onChange={(e) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), section_title: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Background Token</label>
            <Select
              value={settings?.background_token ?? "background"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), background_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.bg.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Card BG Token</label>
            <Select
              value={settings?.card_bg_token ?? "card"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), card_bg_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.bg.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Icon Token</label>
            <Select
              value={settings?.icon_token ?? "primary"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), icon_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.text.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Title Token</label>
            <Select
              value={settings?.title_token ?? "foreground"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), title_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.text.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Subtitle Token</label>
            <Select
              value={settings?.subtitle_token ?? "muted-foreground"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), subtitle_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.text.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <label className="text-sm text-muted-foreground">Section Subtitle</label>
            <Textarea
              value={settings?.section_subtitle ?? ""}
              onChange={(e) => setSettings((s) => ({ ...(s || ({} as SolutionSettings)), section_subtitle: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={saveSettings} disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Design Settings"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Add Solution */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Add Solution</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Title *"
              value={newSolution.title}
              onChange={(e) => setNewSolution((s) => ({ ...s, title: e.target.value }))}
            />
            <Input
              placeholder="Subtitle"
              value={newSolution.subtitle ?? ""}
              onChange={(e) => setNewSolution((s) => ({ ...s, subtitle: e.target.value }))}
            />
          </div>
          <Textarea
            placeholder="Description"
            value={newSolution.description ?? ""}
            onChange={(e) => setNewSolution((s) => ({ ...s, description: e.target.value }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IconPicker
              value={newSolution.icon_name}
              onChange={(v) => setNewSolution((s) => ({ ...s, icon_name: v }))}
              placeholder="Icon"
            />
            <Input
              placeholder="Image URL"
              value={newSolution.image_url ?? ""}
              onChange={(e) => setNewSolution((s) => ({ ...s, image_url: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Sort Order"
              value={newSolution.sort_order}
              onChange={(e) => setNewSolution((s) => ({ ...s, sort_order: Number(e.target.value) }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="CTA Text"
              value={newSolution.cta_text ?? ""}
              onChange={(e) => setNewSolution((s) => ({ ...s, cta_text: e.target.value }))}
            />
            <Input
              placeholder="CTA URL"
              value={newSolution.cta_url ?? ""}
              onChange={(e) => setNewSolution((s) => ({ ...s, cta_url: e.target.value }))}
            />
          </div>

          {/* Benefits */}
          <div>
            <Label className="mb-2 block">Benefits</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a benefit"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefitToNew())}
              />
              <Button type="button" size="sm" onClick={addBenefitToNew}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newSolution.benefits.map((b, i) => (
                <Badge key={i} variant="secondary" className="gap-1">
                  {b}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeBenefitFromNew(i)} />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={newSolution.active}
              onCheckedChange={(checked) => setNewSolution((s) => ({ ...s, active: checked }))}
            />
            <Label>Active</Label>
          </div>

          <Button onClick={createSolution} disabled={creating}>
            {creating ? "Creating..." : "Create Solution"}
          </Button>
        </div>
      </Card>

      {/* Solutions Table */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4">Solutions ({solutions.length})</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : solutions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">No solutions yet.</TableCell>
                </TableRow>
              ) : (
                solutions.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Input value={s.title} onChange={(e) => updateLocal(s.id, { title: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input value={s.icon_name} onChange={(e) => updateLocal(s.id, { icon_name: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={s.active}
                        onCheckedChange={(checked) => updateLocal(s.id, { active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={s.sort_order}
                        onChange={(e) => updateLocal(s.id, { sort_order: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => saveSolution(s)} disabled={savingId === s.id}>
                        {savingId === s.id ? "Saving..." : "Save"}
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSolution(s.id)} disabled={deletingId === s.id}>
                        {deletingId === s.id ? "Deleting..." : "Delete"}
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

export default SolutionsManager;
