import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import IconPicker from "./IconPicker";
import FeaturePreview from "./FeaturePreview";

interface FeatureRow {
  id: string;
  title: string;
  description: string | null;
  icon_name: string;
  sort_order: number | null;
  created_at?: string;
  updated_at?: string;
}

interface FeatureSettings {
  id?: string;
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  description_token: string;
}

const emptyNew: Omit<FeatureRow, "id"> = {
  title: "",
  description: "",
  icon_name: "Sparkles",
  sort_order: 0,
};

const tokenOptions = {
  bg: ["background", "card", "gradient-primary", "gradient-background", "gradient-hero"],
  textSolid: ["foreground", "muted-foreground", "primary", "secondary", "accent"],
  textWithGradients: [
    "foreground",
    "muted-foreground",
    "primary",
    "secondary",
    "accent",
    "gradient-primary",
    "gradient-background",
    "gradient-hero",
  ],
  border: ["border"],
};

const FeaturesManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [newFeature, setNewFeature] = useState<Omit<FeatureRow, "id">>(emptyNew);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [settings, setSettings] = useState<FeatureSettings | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchFeatures = async () => {
    setLoading(true);
    const [{ data: feats, error: err1 }, { data: setts, error: err2 }] = await Promise.all([
      supabase
        .from("features")
        .select("id,title,description,icon_name,sort_order,created_at,updated_at")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase
        .from("features_settings")
        .select("id,section_title,section_subtitle,background_token,card_bg_token,border_token,icon_token,title_token,description_token")
        .order("created_at", { ascending: true })
        .limit(1),
    ]);

    if (err1) toast({ title: "Failed to load features", description: err1.message, variant: "destructive" });
    if (err2) toast({ title: "Failed to load settings", description: err2.message, variant: "destructive" });

    setFeatures(feats || []);
    setSettings((setts && setts[0]) || null);
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

  const saveSettings = async () => {
    if (!settings) return;
    setSavingSettings(true);
    const payload = { ...settings } as any;
    if (!payload.id) delete payload.id;
    const { error } = await supabase.from("features_settings").upsert(payload, { onConflict: "id" });
    setSavingSettings(false);
    if (error) {
      toast({ title: "Failed to save settings", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Design settings saved" });
      fetchFeatures();
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Design Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="feature-section-title">Section Title</Label>
            <Input
              id="feature-section-title"
              value={settings?.section_title ?? ""}
              onChange={(e) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), section_title: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="feature-bg">Background</Label>
            <Select
              value={settings?.background_token ?? "background"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), background_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.bg.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feature-card-bg">Card Background</Label>
            <Select
              value={settings?.card_bg_token ?? "card"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), card_bg_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.bg.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feature-icon-color">Icon Color</Label>
            <Select
              value={settings?.icon_token ?? "primary"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), icon_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.textSolid.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feature-title-color">Title Color</Label>
            <Select
              value={settings?.title_token ?? "foreground"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), title_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.textWithGradients.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feature-desc-color">Description Color</Label>
            <Select
              value={settings?.description_token ?? "muted-foreground"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), description_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.textWithGradients.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="feature-border-color">Border Color</Label>
            <Select
              value={settings?.border_token ?? "border"}
              onValueChange={(v) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), border_token: v }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tokenOptions.border.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Label htmlFor="feature-section-subtitle">Section Subtitle</Label>
            <Textarea
              id="feature-section-subtitle"
              value={settings?.section_subtitle ?? ""}
              onChange={(e) => setSettings((s) => ({ ...(s || ({} as FeatureSettings)), section_subtitle: e.target.value }))}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button onClick={saveSettings} disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Design Settings"}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Uses your design tokens (bg-*, text-*, border-*) to style the Features section consistently.
        </p>
      </Card>
 
      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Add Feature</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            id="new-feature-title"
            placeholder="Title"
            autoFocus
            aria-required="true"
            value={newFeature.title}
            onChange={(e) => setNewFeature((s) => ({ ...s, title: e.target.value }))}
          />
          <IconPicker
            value={newFeature.icon_name}
            onChange={(v) => setNewFeature((s) => ({ ...s, icon_name: v }))}
            placeholder="Select an icon"
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
        <div className="mt-4">
          <h4 className="text-sm text-muted-foreground mb-2">Live Preview</h4>
          {/* Preview card for the feature being created */}
          <FeaturePreview
            title={newFeature.title}
            description={newFeature.description}
            iconName={newFeature.icon_name}
            settings={settings}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Tip: Icons are from lucide-react. Use names like Truck, Calendar, BarChart3, Wrench, Shield, Zap, Users, Clock, DollarSign, etc.
        </p>
      </Card>

      <Card className="p-6 bg-background border-border">
        <h3 className="text-xl font-semibold text-foreground mb-4">Features ({features.length})</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[18rem]">Title</TableHead>
                <TableHead className="w-[12rem]">Icon</TableHead>
                <TableHead className="w-[8rem]">Sort</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[20rem]">Preview</TableHead>
                <TableHead className="w-[10rem] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : features.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
                    <TableCell>
                      <FeaturePreview
                        title={f.title}
                        description={f.description}
                        iconName={f.icon_name}
                        settings={settings}
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
