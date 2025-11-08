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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import IconPicker from "./IconPicker";
import { Trash2, Plus, X, Edit, MoveUp, MoveDown } from "lucide-react";

interface KeyBenefit {
  heading: string;
  text: string;
  image_url: string;
}

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
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  description_heading: string | null;
  description_text: string | null;
  key_benefits: KeyBenefit[];
  footer_heading: string | null;
  footer_text: string | null;
  footer_cta_text: string | null;
  footer_cta_url: string | null;
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
  hero_title: null,
  hero_subtitle: null,
  hero_description: null,
  hero_image_url: null,
  hero_cta_text: null,
  hero_cta_url: null,
  description_heading: null,
  description_text: null,
  key_benefits: [],
  footer_heading: null,
  footer_text: null,
  footer_cta_text: null,
  footer_cta_url: null,
};

const tokenOptions = {
  bg: ["background", "card", "gradient-primary", "gradient-background", "gradient-hero"],
  text: ["foreground", "muted-foreground", "primary", "secondary", "accent"],
  border: ["border"],
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

const SolutionsManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [solutions, setSolutions] = useState<SolutionRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newSolution, setNewSolution] = useState<Omit<SolutionRow, "id">>(emptyNew);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [newBenefit, setNewBenefit] = useState("");
  const [editingSolution, setEditingSolution] = useState<SolutionRow | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

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
      benefits: (Array.isArray(s.benefits) ? s.benefits : []) as string[],
      key_benefits: (Array.isArray(s.key_benefits) ? s.key_benefits.map((kb: any) => ({
        heading: kb?.heading || "",
        text: kb?.text || "",
        image_url: kb?.image_url || ""
      })) : []) as KeyBenefit[]
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
      slug: generateSlug(newSolution.title.trim()),
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
        hero_title: row.hero_title?.trim() || null,
        hero_subtitle: row.hero_subtitle?.trim() || null,
        hero_description: row.hero_description?.trim() || null,
        hero_image_url: row.hero_image_url?.trim() || null,
        hero_cta_text: row.hero_cta_text?.trim() || null,
        hero_cta_url: row.hero_cta_url?.trim() || null,
        description_heading: row.description_heading?.trim() || null,
        description_text: row.description_text?.trim() || null,
        key_benefits: row.key_benefits as any,
        footer_heading: row.footer_heading?.trim() || null,
        footer_text: row.footer_text?.trim() || null,
        footer_cta_text: row.footer_cta_text?.trim() || null,
        footer_cta_url: row.footer_cta_url?.trim() || null,
      })
      .eq("id", row.id);
    setSavingId(null);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Solution saved" });
      setShowEditDialog(false);
      setEditingSolution(null);
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

  const updateEditing = (patch: Partial<SolutionRow>) => {
    if (editingSolution) {
      setEditingSolution({ ...editingSolution, ...patch });
    }
  };

  const addKeyBenefit = () => {
    if (editingSolution) {
      const newBenefits = [...editingSolution.key_benefits, { heading: "", text: "", image_url: "" }];
      setEditingSolution({ ...editingSolution, key_benefits: newBenefits });
    }
  };

  const removeKeyBenefit = (index: number) => {
    if (editingSolution) {
      const newBenefits = editingSolution.key_benefits.filter((_, i) => i !== index);
      setEditingSolution({ ...editingSolution, key_benefits: newBenefits });
    }
  };

  const updateKeyBenefit = (index: number, field: keyof KeyBenefit, value: string) => {
    if (editingSolution) {
      const newBenefits = [...editingSolution.key_benefits];
      newBenefits[index] = { ...newBenefits[index], [field]: value };
      setEditingSolution({ ...editingSolution, key_benefits: newBenefits });
    }
  };

  const moveKeyBenefit = (index: number, direction: 'up' | 'down') => {
    if (!editingSolution) return;
    const newBenefits = [...editingSolution.key_benefits];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newBenefits.length) return;
    [newBenefits[index], newBenefits[newIndex]] = [newBenefits[newIndex], newBenefits[index]];
    setEditingSolution({ ...editingSolution, key_benefits: newBenefits });
  };

  const openEditDialog = async (solutionId: string) => {
    // Fetch fresh data from database to prevent stale state issues
    const { data, error } = await supabase
      .from("solutions")
      .select("*")
      .eq("id", solutionId)
      .single();
    
    if (error) {
      toast({ title: "Failed to load solution", description: error.message, variant: "destructive" });
      return;
    }

    if (data) {
      setEditingSolution({
        ...data,
        benefits: (Array.isArray(data.benefits) ? data.benefits : []) as string[],
        key_benefits: (Array.isArray(data.key_benefits) ? data.key_benefits.map((kb: any) => ({
          heading: kb?.heading || "",
          text: kb?.text || "",
          image_url: kb?.image_url || ""
        })) : []) as KeyBenefit[]
      });
      setShowEditDialog(true);
    }
  };

  const autoSaveSortOrder = async (id: string, sortOrder: number) => {
    updateLocal(id, { sort_order: sortOrder });
    const { error } = await supabase
      .from("solutions")
      .update({ sort_order: sortOrder })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Failed to update sort order", description: error.message, variant: "destructive" });
    }
  };

  const autoSaveActive = async (id: string, active: boolean) => {
    updateLocal(id, { active });
    const { error } = await supabase
      .from("solutions")
      .update({ active })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Failed to update active status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Solution ${active ? 'activated' : 'deactivated'}` });
    }
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
                      <Input className="text-foreground" value={s.title} onChange={(e) => updateLocal(s.id, { title: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input className="text-foreground" value={s.icon_name} onChange={(e) => updateLocal(s.id, { icon_name: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={s.active}
                        onCheckedChange={(checked) => autoSaveActive(s.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="text-foreground"
                        type="number"
                        value={s.sort_order}
                        onChange={(e) => autoSaveSortOrder(s.id, Number(e.target.value))}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" onClick={() => openEditDialog(s.id)}>
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteSolution(s.id)} disabled={deletingId === s.id}>
                        {deletingId === s.id ? "Deleting..." : <><Trash2 className="w-4 h-4" /></>}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Solution Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Solution: {editingSolution?.title}</DialogTitle>
          </DialogHeader>
          {editingSolution && (
            <Tabs defaultValue="hero" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="hero">Hero Section</TabsTrigger>
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="benefits">Key Benefits</TabsTrigger>
                <TabsTrigger value="footer">Footer CTA</TabsTrigger>
              </TabsList>

              <TabsContent value="hero" className="space-y-4 mt-4">
                <div>
                  <Label>Hero Title</Label>
                  <Input
                    value={editingSolution.hero_title ?? ""}
                    onChange={(e) => updateEditing({ hero_title: e.target.value })}
                    placeholder="Main hero heading"
                  />
                </div>
                <div>
                  <Label>Hero Subtitle</Label>
                  <Input
                    value={editingSolution.hero_subtitle ?? ""}
                    onChange={(e) => updateEditing({ hero_subtitle: e.target.value })}
                    placeholder="Supporting text"
                  />
                </div>
                <div>
                  <Label>Hero Description</Label>
                  <Textarea
                    value={editingSolution.hero_description ?? ""}
                    onChange={(e) => updateEditing({ hero_description: e.target.value })}
                    placeholder="Additional description text"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Hero Image URL</Label>
                  <Input
                    value={editingSolution.hero_image_url ?? ""}
                    onChange={(e) => updateEditing({ hero_image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={editingSolution.hero_cta_text ?? ""}
                      onChange={(e) => updateEditing({ hero_cta_text: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>
                  <div>
                    <Label>CTA Button URL</Label>
                    <Input
                      value={editingSolution.hero_cta_url ?? ""}
                      onChange={(e) => updateEditing({ hero_cta_url: e.target.value })}
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="description" className="space-y-4 mt-4">
                <div>
                  <Label>Card Subtitle (Listing Page)</Label>
                  <Input
                    value={editingSolution.subtitle ?? ""}
                    onChange={(e) => updateEditing({ subtitle: e.target.value })}
                    placeholder="Professional tire care and maintenance"
                  />
                </div>
                <div>
                  <Label>Description Heading (H2)</Label>
                  <Input
                    value={editingSolution.description_heading ?? ""}
                    onChange={(e) => updateEditing({ description_heading: e.target.value })}
                    placeholder="Section heading"
                  />
                </div>
                <div>
                  <Label>Description Text</Label>
                  <Textarea
                    value={editingSolution.description_text ?? ""}
                    onChange={(e) => updateEditing({ description_text: e.target.value })}
                    placeholder="Detailed description of the solution..."
                    rows={6}
                  />
                </div>
              </TabsContent>

              <TabsContent value="benefits" className="space-y-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <Label>Key Benefits</Label>
                  <Button size="sm" onClick={addKeyBenefit}>
                    <Plus className="w-4 h-4 mr-1" /> Add Benefit
                  </Button>
                </div>
                {editingSolution.key_benefits.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No key benefits yet. Click "Add Benefit" to create one.</p>
                ) : (
                  <div className="space-y-6">
                    {editingSolution.key_benefits.map((benefit, index) => (
                      <Card key={index} className="p-4 relative">
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveKeyBenefit(index, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveKeyBenefit(index, 'down')}
                            disabled={index === editingSolution.key_benefits.length - 1}
                          >
                            <MoveDown className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeKeyBenefit(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-3 pr-32">
                          <div>
                            <Label>Heading (H3)</Label>
                            <Input
                              value={benefit.heading}
                              onChange={(e) => updateKeyBenefit(index, 'heading', e.target.value)}
                              placeholder="Benefit heading"
                            />
                          </div>
                          <div>
                            <Label>Text</Label>
                            <Textarea
                              value={benefit.text}
                              onChange={(e) => updateKeyBenefit(index, 'text', e.target.value)}
                              placeholder="Benefit description..."
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label>Image URL</Label>
                            <Input
                              value={benefit.image_url}
                              onChange={(e) => updateKeyBenefit(index, 'image_url', e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <Badge variant="secondary" className="mt-2">Benefit #{index + 1}</Badge>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="footer" className="space-y-4 mt-4">
                <div>
                  <Label>Footer Heading (H3)</Label>
                  <Input
                    value={editingSolution.footer_heading ?? ""}
                    onChange={(e) => updateEditing({ footer_heading: e.target.value })}
                    placeholder="Ready to get started?"
                  />
                </div>
                <div>
                  <Label>Footer Text</Label>
                  <Textarea
                    value={editingSolution.footer_text ?? ""}
                    onChange={(e) => updateEditing({ footer_text: e.target.value })}
                    placeholder="Call to action text..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={editingSolution.footer_cta_text ?? ""}
                      onChange={(e) => updateEditing({ footer_cta_text: e.target.value })}
                      placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <Label>CTA Button URL</Label>
                    <Input
                      value={editingSolution.footer_cta_url ?? ""}
                      onChange={(e) => updateEditing({ footer_cta_url: e.target.value })}
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => { setShowEditDialog(false); setEditingSolution(null); }}>
              Cancel
            </Button>
            <Button onClick={() => editingSolution && saveSolution(editingSolution)} disabled={savingId === editingSolution?.id}>
              {savingId === editingSolution?.id ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolutionsManager;
