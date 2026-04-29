import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Edit, Plus, Trash2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { SlideRenderer } from "@/components/portal-deck/SlideRenderer";
import { normalizeSlide } from "@/components/portal-deck/types";
import type { BadgeItem, GapCategory, VerticalItem, VisualConfig, VisualType } from "@/components/portal-deck/types";
import { PortalCmsLayout } from "./PortalCmsLayout";
import { Field, MarkdownField, NumberField, TextField } from "./FormBits";
import { CURATED_ICONS, VISUAL_TYPES, type PortalCustomerRow, type PortalSlideBriefRow, type PortalSlideRow, type SlideDraftResponse, type SlideFormValues } from "./types";
import { formatDate, jsonToVisualConfig, slugPattern, visualConfigToJson } from "./utils";
import type { Json } from "@/integrations/supabase/types";

const slideSchema = z.object({
  slug: z.string().min(1).regex(slugPattern),
  display_order: z.number().int(),
  visual_type: z.enum(["cover", "logos", "badges", "funnel", "adoption", "glide", "team", "round", "gap", "verticals", "customer-spotlight", "custom"]),
});

function defaultConfig(type: VisualType): Json {
  switch (type) {
    case "logos":
    case "funnel":
    case "adoption":
    case "team":
      return { caption: "" };
    case "badges":
      return { badges: [] };
    case "glide":
      return { break_even_nok: null };
    case "gap":
      return { categories: [] };
    case "verticals":
      return { verticals: [] };
    case "customer-spotlight":
      return { customer_slug: "" };
    default:
      return {};
  }
}

function toForm(row: PortalSlideRow): SlideFormValues {
  return {
    id: row.id,
    slug: row.slug,
    slide_number: row.slide_number,
    title: row.title ?? "",
    subtitle: row.subtitle ?? "",
    body_md: row.body_md ?? "",
    visual_type: (VISUAL_TYPES.includes(row.visual_type as VisualType) ? row.visual_type : "custom") as VisualType,
    visual_config: row.visual_config ?? {},
    is_published: row.is_published,
    display_order: row.display_order,
  };
}

function createPreviewSlide(form: SlideFormValues): ReturnType<typeof normalizeSlide> {
  return normalizeSlide({
    id: form.id ?? "preview",
    slug: form.slug || "preview",
    slide_number: form.slide_number,
    title: form.title || null,
    subtitle: form.subtitle || null,
    body_md: form.body_md || null,
    visual_type: form.visual_type,
    visual_config: form.visual_config,
    is_published: form.is_published,
    display_order: form.display_order,
  });
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function PortalSlidesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sort, setSort] = useState<keyof PortalSlideRow>("display_order");
  const { data: slides = [], isLoading } = useQuery({
    queryKey: ["portal-slides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_slides").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
  const sorted = useMemo(() => [...slides].sort((a, b) => String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""), undefined, { numeric: true })), [slides, sort]);
  const toggle = useMutation({
    mutationFn: async (row: PortalSlideRow) => {
      const { error } = await supabase.from("portal_slides").update({ is_published: !row.is_published }).eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["portal-slides"] }); toast({ title: "Slide updated" }); },
  });

  return (
    <PortalCmsLayout title="Portal slides" description="Manage pitch deck slides and their visual configuration." action={<Button asChild><Link to="/cms/portal/slides/new"><Plus className="h-4 w-4" /> New slide</Link></Button>}>
      <Card><CardContent className="pt-6">
        <Table>
          <TableHeader><TableRow>
            <TableHead><button onClick={() => setSort("slide_number")}>#</button></TableHead><TableHead><button onClick={() => setSort("slug")}>Slug</button></TableHead><TableHead>Title</TableHead><TableHead>Visual type</TableHead><TableHead>Published</TableHead><TableHead><button onClick={() => setSort("display_order")}>Display order</button></TableHead><TableHead>Last updated</TableHead><TableHead>Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRow><TableCell colSpan={8}>Loading…</TableCell></TableRow> : sorted.map((slide) => (
              <TableRow key={slide.id}>
                <TableCell>{slide.slide_number}</TableCell><TableCell className="font-mono text-sm">{slide.slug}</TableCell><TableCell>{slide.title || <span className="text-muted-foreground">— Empty —</span>}</TableCell><TableCell><Badge variant="outline">{slide.visual_type}</Badge></TableCell><TableCell><Switch checked={slide.is_published} onCheckedChange={() => toggle.mutate(slide)} /></TableCell><TableCell>{slide.display_order}</TableCell><TableCell>{formatDate(null)}</TableCell><TableCell><Button asChild size="sm" variant="outline"><Link to={`/cms/portal/slides/${slide.id}`}><Edit className="h-4 w-4" /> Edit</Link></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </PortalCmsLayout>
  );
}

function ConfigEditor({ type, value, onChange }: { type: VisualType; value: Json; onChange: (value: Json) => void }) {
  const { data: customers = [] } = useQuery({
    queryKey: ["portal-customers-for-slide-editor"],
    queryFn: async () => {
      const { data, error } = await supabase.from("portal_customers").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data as PortalCustomerRow[];
    },
  });
  const record = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, unknown>;
  const set = (next: Record<string, unknown>) => onChange(visualConfigToJson(next));

  if (["cover", "custom", "round"].includes(type)) return <p className="text-sm text-muted-foreground">No visual config for this visual type.</p>;
  if (["logos", "funnel", "adoption", "team"].includes(type)) return <TextField label="Caption" value={String(record.caption ?? "")} onChange={(caption) => set({ ...record, caption })} />;
  if (type === "glide") return <NumberField label="Break-even target NOK" value={Number(record.break_even_nok ?? 0)} onChange={(break_even_nok) => set({ ...record, break_even_nok })} />;
  if (type === "customer-spotlight") return <Field label="Customer slug"><Select value={String(record.customer_slug || "none")} onValueChange={(customer_slug) => set({ ...record, customer_slug: customer_slug === "none" ? "" : customer_slug })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Select customer</SelectItem>{customers.map((customer) => <SelectItem key={customer.id} value={customer.slug}>{customer.name} · {customer.slug}</SelectItem>)}</SelectContent></Select></Field>;
  if (type === "badges") {
    const badges = Array.isArray(record.badges) ? record.badges as BadgeItem[] : [];
    const update = (next: BadgeItem[]) => set({ badges: next });
    return <div className="space-y-4">{badges.map((badge, index) => <Card key={index}><CardContent className="grid gap-3 pt-6 md:grid-cols-3"><Field label="Icon"><Select value={badge.icon || "Sparkles"} onValueChange={(icon) => update(badges.map((b, i) => i === index ? { ...b, icon } : b))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURATED_ICONS.map((icon) => <SelectItem key={icon} value={icon}>{icon}</SelectItem>)}</SelectContent></Select></Field><Field label="Problem"><Textarea value={badge.problem} onChange={(e) => update(badges.map((b, i) => i === index ? { ...b, problem: e.target.value } : b))} /></Field><Field label="Solution"><Textarea value={badge.solution} onChange={(e) => update(badges.map((b, i) => i === index ? { ...b, solution: e.target.value } : b))} /></Field><Button type="button" variant="outline" onClick={() => update(badges.filter((_, i) => i !== index))}><Trash2 className="h-4 w-4" /> Remove</Button></CardContent></Card>)}<Button type="button" variant="outline" onClick={() => update([...badges, { icon: "Database", problem: "", solution: "" }])}>Add badge</Button></div>;
  }
  if (type === "gap") {
    const categories = Array.isArray(record.categories) ? record.categories as GapCategory[] : [];
    const update = (next: GapCategory[]) => set({ categories: next });
    return <div className="space-y-4">{categories.map((cat, index) => <Card key={index}><CardContent className="space-y-4 pt-6"><TextField label="Label" value={cat.label} onChange={(label) => update(categories.map((c, i) => i === index ? { ...c, label } : c))} /><Field label={`Navio position: ${cat.navio_position}`}><Slider value={[cat.navio_position]} max={100} step={1} onValueChange={([navio_position]) => update(categories.map((c, i) => i === index ? { ...c, navio_position } : c))} /></Field>{cat.competitors.map((competitor, compIndex) => <div key={compIndex} className="grid gap-3 md:grid-cols-2"><Input value={competitor.name} onChange={(e) => update(categories.map((c, i) => i === index ? { ...c, competitors: c.competitors.map((co, ci) => ci === compIndex ? { ...co, name: e.target.value } : co) } : c))} /><Slider value={[competitor.position]} max={100} step={1} onValueChange={([position]) => update(categories.map((c, i) => i === index ? { ...c, competitors: c.competitors.map((co, ci) => ci === compIndex ? { ...co, position } : co) } : c))} /></div>)}<Button type="button" variant="outline" onClick={() => update(categories.map((c, i) => i === index ? { ...c, competitors: [...c.competitors, { name: "Competitor", position: 50 }] } : c))}>Add competitor</Button></CardContent></Card>)}<Button type="button" variant="outline" onClick={() => update([...categories, { label: "", navio_position: 80, competitors: [] }])}>Add category</Button></div>;
  }
  if (type === "verticals") {
    const verticals = Array.isArray(record.verticals) ? record.verticals as VerticalItem[] : [];
    const update = (next: VerticalItem[]) => set({ verticals: next });
    return <div className="space-y-4">{verticals.map((vertical, index) => <Card key={index}><CardContent className="grid gap-3 pt-6 md:grid-cols-3"><TextField label="Name" value={vertical.name} onChange={(name) => update(verticals.map((v, i) => i === index ? { ...v, name } : v))} /><Field label="Description"><Textarea value={vertical.description} onChange={(e) => update(verticals.map((v, i) => i === index ? { ...v, description: e.target.value } : v))} /></Field><TextField label="Status" value={vertical.status} onChange={(status) => update(verticals.map((v, i) => i === index ? { ...v, status } : v))} /></CardContent></Card>)}<Button type="button" variant="outline" onClick={() => update([...verticals, { name: "", description: "", status: "" }])}>Add vertical</Button></div>;
  }
  return null;
}

export function PortalSlideEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const { data: slides = [] } = useQuery({ queryKey: ["portal-slides"], queryFn: async () => { const { data, error } = await supabase.from("portal_slides").select("*").order("display_order", { ascending: true }); if (error) throw error; return data; } });
  const existing = slides.find((slide) => slide.id === id);
  const nextNumber = slides.length ? Math.max(...slides.map((slide) => slide.slide_number)) + 1 : 1;
  const [form, setForm] = useState<SlideFormValues>({ slug: "", slide_number: nextNumber, title: "", subtitle: "", body_md: "", visual_type: "custom", visual_config: {}, is_published: false, display_order: nextNumber });
  useEffect(() => { if (existing) setForm(toForm(existing)); else if (isNew) setForm((current) => ({ ...current, slide_number: nextNumber, display_order: nextNumber })); }, [existing, isNew, nextNumber]);
  const debounced = useDebounced(form);
  const previewSlide = createPreviewSlide(debounced);
  const update = (patch: Partial<SlideFormValues>) => { setDirty(true); setForm((current) => ({ ...current, ...patch })); };
  const save = useMutation({ mutationFn: async () => {
    const parsed = slideSchema.safeParse(form);
    if (!parsed.success) throw new Error("Slug, visual type, or display order is invalid.");
    const duplicate = slides.find((slide) => slide.slug === form.slug && slide.id !== form.id);
    if (duplicate) throw new Error("Slug must be unique.");
    const payload = { slug: form.slug, slide_number: form.slide_number, title: form.title.trim() || null, subtitle: form.subtitle.trim() || null, body_md: form.body_md.trim() || null, visual_type: form.visual_type, visual_config: form.visual_config, is_published: form.is_published, display_order: form.display_order };
    if (isNew) { const { error } = await supabase.from("portal_slides").insert(payload); if (error) throw error; }
    else { const { error } = await supabase.from("portal_slides").update(payload).eq("id", id); if (error) throw error; }
  }, onSuccess: () => { toast({ title: "Slide saved" }); queryClient.invalidateQueries({ queryKey: ["portal-slides"] }); navigate("/cms/portal/slides"); }, onError: (error) => toast({ title: "Save failed", description: error.message, variant: "destructive" }) });
  const cancel = () => { if (!dirty || window.confirm("Discard unsaved changes?")) navigate("/cms/portal/slides"); };

  return (
    <PortalCmsLayout title={isNew ? "New slide" : "Edit slide"} description="Preview renders directly from unsaved draft form values.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <Card><CardContent className="space-y-5 pt-6">
          <TextField label="Slug" value={form.slug} onChange={(slug) => update({ slug })} />
          <NumberField label="Slide number" value={form.slide_number} onChange={() => undefined} readOnly />
          <TextField label="Title" value={form.title} onChange={(title) => update({ title })} />
          <TextField label="Subtitle" value={form.subtitle} onChange={(subtitle) => update({ subtitle })} />
          <Field label="Visual type"><Select value={form.visual_type} onValueChange={(visual_type: VisualType) => update({ visual_type, visual_config: defaultConfig(visual_type) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{VISUAL_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></Field>
          <ConfigEditor type={form.visual_type} value={form.visual_config} onChange={(visual_config) => update({ visual_config })} />
          <MarkdownField label="Body" value={form.body_md} onChange={(body_md) => update({ body_md })} />
          <NumberField label="Display order" value={form.display_order} onChange={(display_order) => update({ display_order })} />
          <Field label="Published"><Switch checked={form.is_published} onCheckedChange={(is_published) => update({ is_published })} /></Field>
          <div className="flex gap-3"><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button><Button variant="outline" onClick={cancel}>Cancel</Button></div>
        </CardContent></Card>
        <Card className="lg:sticky lg:top-28 lg:self-start"><CardHeader><CardTitle>Preview</CardTitle><CardDescription>Debounced 300ms from draft state.</CardDescription></CardHeader><CardContent><div className="aspect-video overflow-auto rounded-md border bg-background"><div className="min-h-full"><SlideRenderer slide={{ ...previewSlide, visual_config: jsonToVisualConfig(form.visual_config) as VisualConfig | null }} mode="viewer" /></div></div></CardContent></Card>
      </div>
    </PortalCmsLayout>
  );
}
