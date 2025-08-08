import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import IconPicker from "@/components/design-system/IconPicker";

interface UspRow {
  id?: string;
  title: string;
  icon_name: string;
  href?: string | null;
  bg_token: string;
  text_token: string;
  location: string;
  active: boolean;
  sort_order?: number | null;
}

const bgClass: Record<string, string> = {
  background: "bg-background",
  card: "bg-card",
  primary: "bg-primary",
  secondary: "bg-secondary",
  accent: "bg-accent",
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};
const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};

const bgOptions = ["background", "card", "primary", "secondary", "accent", "gradient-primary", "gradient-background", "gradient-hero"];
const textOptions = ["foreground", "muted-foreground", "primary", "secondary", "accent"];
const locationOptions = ["hero", "features", "global"];

const USPForm: React.FC<{
  initial?: Partial<UspRow>;
  onSubmit: (values: UspRow) => Promise<void>;
}> = ({ initial, onSubmit }) => {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [iconName, setIconName] = useState(initial?.icon_name ?? "Sparkles");
  const [href, setHref] = useState(initial?.href ?? "");
  const [bgToken, setBgToken] = useState(initial?.bg_token ?? "secondary");
  const [textToken, setTextToken] = useState(initial?.text_token ?? "foreground");
  const [location, setLocation] = useState(initial?.location ?? "hero");
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState<number>(initial?.sort_order ?? 0);

  const IconPreview = useMemo(() => {
    const { icons } = require("lucide-react");
    const Cmp = icons[iconName];
    return Cmp ? <Cmp className="w-4 h-4" /> : null;
  }, [iconName]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Fast setup" />
        </div>
        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex items-center gap-2">
            <IconPicker value={iconName} onChange={setIconName} />
            <div className="text-muted-foreground">{IconPreview}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Link (optional)</Label>
        <Input value={href ?? ""} onChange={(e) => setHref(e.target.value)} placeholder="/learn-more" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Background token</Label>
          <Select value={bgToken} onValueChange={setBgToken}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {bgOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Text token</Label>
          <Select value={textToken} onValueChange={setTextToken}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {textOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {locationOptions.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch checked={active} onCheckedChange={setActive} id="usp-active" />
          <Label htmlFor="usp-active">Active</Label>
        </div>
        <div className="w-32 space-y-2">
          <Label>Sort order</Label>
          <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value || "0", 10))} />
        </div>
      </div>

      <div className="pt-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${bgClass[bgToken]} ${textClass[textToken]} border-border`}>
          <span className="inline-flex">{IconPreview}</span>
          <span className="text-sm font-medium">{title || "Preview USP"}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={() =>
            onSubmit({
              id: initial?.id,
              title,
              icon_name: iconName,
              href: href || null,
              bg_token: bgToken,
              text_token: textToken,
              location,
              active,
              sort_order: sortOrder,
            })
          }
        >
          Save USP
        </Button>
      </div>
    </div>
  );
};

const USPCms: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [usps, setUsps] = useState<UspRow[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<UspRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("usps")
      .select("*")
      .order("location", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
    } else {
      setUsps(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const upsert = async (values: UspRow) => {
    let error;
    if (values.id) {
      ({ error } = await supabase.from("usps").update(values).eq("id", values.id));
    } else {
      ({ error } = await supabase.from("usps").insert(values));
    }
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "USP saved." });
      setOpen(false);
      setEditing(null);
      load();
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    const { error } = await supabase.from("usps").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "USP removed." });
      load();
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">USP CMS</h2>
          <p className="text-muted-foreground">Manage short value props to promote across the site. Uses existing color tokens only.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); }}>New USP</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit USP" : "Create USP"}</DialogTitle>
            </DialogHeader>
            <USPForm initial={editing || undefined} onSubmit={upsert} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All USPs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-muted-foreground">Loading…</div>
          ) : usps.length === 0 ? (
            <div className="text-muted-foreground">No USPs yet. Create your first one.</div>
          ) : (
            <div className="grid gap-3">
              {usps.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${bgClass[u.bg_token]} ${textClass[u.text_token]}`}>
                    <span className="text-xs font-medium">{u.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => { setEditing(u); setOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => remove(u.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">Tip: Use location to target where USPs appear (hero, features, global).</CardFooter>
      </Card>
    </section>
  );
};

export default USPCms;
