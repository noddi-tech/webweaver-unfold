import { useCallback, useEffect, useMemo, useState } from "react";
import { deepEqualJson, parseAndValidateVisualConfig, type VisualConfigValidation } from "@/lib/portalDraftSchemas";
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

const referenceLabels: Record<string, string> = {
  portal_customers: "Published customers",
  portal_team_members: "Published team members",
  portal_financial_projections: "Financial projections",
  portal_round_terms: "Active round terms",
  "media_assets:partner_logos": "Partner logos",
};

function toJson(value: Record<string, unknown>): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

async function fetchSlideBrief(slug: string): Promise<PortalSlideBriefRow | null> {
  if (!slug) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/portal_slide_briefs?slug=eq.${encodeURIComponent(slug)}&select=*`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${sessionData.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
  });
  if (!response.ok) throw new Error("Could not load slide brief.");
  const rows = (await response.json()) as PortalSlideBriefRow[];
  return rows[0] ?? null;
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

type EditedDraftState = {
  title: string;
  subtitle: string;
  body_md: string;
  visual_type: VisualType;
  configRaw: string;
};

function draftToEdited(draft: SlideDraftResponse): EditedDraftState {
  return {
    title: draft.title,
    subtitle: draft.subtitle ?? "",
    body_md: draft.body_md ?? "",
    visual_type: draft.visual_type,
    configRaw: JSON.stringify(draft.visual_config ?? {}, null, 2),
  };
}

function EditedBadge() {
  return <Badge variant="outline" className="ml-2 border-primary/40 text-primary">Endret</Badge>;
}

function FieldRowShell({ label, edited, leftCurrent, rightEditor, errorBlock }: { label: string; edited: boolean; leftCurrent: React.ReactNode; rightEditor: React.ReactNode; errorBlock?: React.ReactNode }) {
  return (
    <div className="grid gap-3 rounded-md border bg-background p-3 md:grid-cols-2">
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
        {leftCurrent}
      </div>
      <div className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}{edited ? <EditedBadge /> : null}
        </div>
        {rightEditor}
        {errorBlock}
      </div>
    </div>
  );
}

function AiDraftPanel({ form, onAccept }: { form: SlideFormValues; onAccept: (draft: SlideDraftResponse) => void }) {
  const { toast } = useToast();
  const [direction, setDirection] = useState("");
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [originalDraft, setOriginalDraft] = useState<SlideDraftResponse | null>(null);
  const [edited, setEdited] = useState<EditedDraftState | null>(null);
  const [savingAcceptance, setSavingAcceptance] = useState(false);
  const { data: status, isLoading: statusLoading } = useQuery({ queryKey: ["draft-slide-status"], queryFn: async () => { const { data, error } = await supabase.functions.invoke<{ configured: boolean }>("draft-slide-status"); if (error) throw error; return data; } });
  const { data: brief } = useQuery({ queryKey: ["portal-slide-brief", form.slug], queryFn: () => fetchSlideBrief(form.slug), enabled: Boolean(form.slug) });
  const { data: counts = {} } = useQuery({ queryKey: ["portal-draft-reference-counts"], queryFn: async () => {
    const [customers, team, financials, round] = await Promise.all([
      supabase.from("portal_customers").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("portal_team_members").select("id", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("portal_financial_projections").select("id", { count: "exact", head: true }),
      supabase.from("portal_round_terms").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    let partnerLogos: number | null = null;
    const { data: sessionData } = await supabase.auth.getSession();
    const mediaResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/media_assets?section=eq.partner-logos&select=id`, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${sessionData.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`, Prefer: "count=exact" } });
    const range = mediaResponse.headers.get("content-range");
    if (mediaResponse.ok && range) partnerLogos = Number(range.split("/")[1]);
    return { portal_customers: customers.count ?? 0, portal_team_members: team.count ?? 0, portal_financial_projections: financials.count ?? 0, portal_round_terms: round.count ?? 0, "media_assets:partner_logos": partnerLogos };
  } });

  useEffect(() => { if (brief?.reference_resources) setSelectedReferences(brief.reference_resources); }, [brief?.slug, brief?.reference_resources]);

  const generate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke<SlideDraftResponse>("draft-slide", { body: { slug: form.slug, editor_prompt: direction, selected_references: selectedReferences, include_style_references: true } });
      if (error) throw error;
      if (!data) throw new Error("No draft returned.");
      return data;
    },
    onSuccess: (data) => {
      setOriginalDraft(data);
      setEdited(draftToEdited(data));
    },
    onError: (error) => toast({ title: "Draft failed", description: error.message, variant: "destructive" }),
  });

  const references = brief?.reference_resources ?? [];

  const configValidation: VisualConfigValidation | null = useMemo(() => {
    if (!edited) return null;
    return parseAndValidateVisualConfig(edited.visual_type, edited.configRaw);
  }, [edited]);

  const titleError = useMemo(() => {
    if (!edited) return null;
    const trimmed = edited.title.trim();
    if (trimmed.length < 1) return "Tittel er påkrevd";
    if (edited.title.length > 80) return "Tittel kan være maks 80 tegn";
    return null;
  }, [edited]);

  const subtitleError = useMemo(() => {
    if (!edited) return null;
    if (edited.subtitle.length > 120) return "Undertittel kan være maks 120 tegn";
    return null;
  }, [edited]);

  const bodyError = useMemo(() => {
    if (!edited) return null;
    if (edited.body_md.length > 4000) return "Innhold kan være maks 4000 tegn";
    return null;
  }, [edited]);

  const editedFields = useMemo(() => {
    const set = new Set<string>();
    if (!edited || !originalDraft) return set;
    if (edited.title !== originalDraft.title) set.add("title");
    if (edited.subtitle !== (originalDraft.subtitle ?? "")) set.add("subtitle");
    if (edited.body_md !== (originalDraft.body_md ?? "")) set.add("body_md");
    if (configValidation?.kind === "ok" && !deepEqualJson(configValidation.value, originalDraft.visual_config ?? {})) {
      set.add("visual_config");
    }
    return set;
  }, [edited, originalDraft, configValidation]);

  const isValid = Boolean(edited) && !titleError && !subtitleError && !bodyError && configValidation?.kind === "ok";

  const handleAccept = useCallback(async () => {
    if (!edited || !originalDraft || !isValid || configValidation?.kind !== "ok") return;
    setSavingAcceptance(true);
    try {
      const finalDraft: SlideDraftResponse = {
        title: edited.title.trim(),
        subtitle: edited.subtitle.trim() ? edited.subtitle.trim() : undefined,
        body_md: edited.body_md.trim() ? edited.body_md.trim() : undefined,
        visual_type: edited.visual_type,
        visual_config: configValidation.value,
      };

      const isManualEdit = editedFields.size > 0;
      if (isManualEdit && originalDraft.id) {
        const { data: userData } = await supabase.auth.getUser();
        const editedFieldsArray = Array.from(editedFields);
        const { error: insertError } = await supabase.from("portal_slide_drafts").insert({
          slide_slug: form.slug,
          editor_email: userData.user?.email ?? null,
          editor_user_id: userData.user?.id ?? null,
          parent_draft_id: originalDraft.id,
          draft_kind: "manual_edit",
          prompt: null,
          prompt_context: {
            source: "manual_edit",
            original_response: originalDraft,
            edited_fields: editedFieldsArray,
          },
          response: finalDraft,
          model: null,
        });
        if (insertError) throw insertError;
      }

      onAccept(finalDraft);
      setOriginalDraft(null);
      setEdited(null);
    } catch (error) {
      toast({ title: "Could not save edits", description: (error as Error).message, variant: "destructive" });
    } finally {
      setSavingAcceptance(false);
    }
  }, [edited, originalDraft, isValid, configValidation, editedFields, form.slug, onAccept, toast]);

  const handleDiscard = useCallback(() => {
    setOriginalDraft(null);
    setEdited(null);
  }, []);

  if (statusLoading) return <Card><CardContent className="pt-6 text-sm text-muted-foreground">Checking AI drafting status…</CardContent></Card>;
  if (!status?.configured) return <Card><CardHeader><CardTitle>AI Draft</CardTitle><CardDescription>AI drafting requires Anthropic API key — contact admin.</CardDescription></CardHeader></Card>;

  const renderConfigError = () => {
    if (!configValidation) return null;
    if (configValidation.kind === "syntax") {
      return <p className="rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">Ugyldig JSON-syntaks: {configValidation.error}</p>;
    }
    if (configValidation.kind === "schema") {
      return <p className="rounded-sm border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">Skjemavalidering feilet: {configValidation.error}</p>;
    }
    return null;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader><div className="flex items-center gap-2"><Wand2 className="h-5 w-5 text-primary" /><CardTitle>AI Draft</CardTitle></div><CardDescription>Describe what this slide should say. The AI will draft a complete slide based on the narrative role.</CardDescription>{brief?.narrative_role ? <p className="text-sm italic text-muted-foreground">This slide {brief.narrative_role.charAt(0).toLowerCase() + brief.narrative_role.slice(1)}.</p> : null}</CardHeader>
      <CardContent className="space-y-5">
        <Field label="Your direction"><Textarea value={direction} onChange={(event) => setDirection(event.target.value)} placeholder="Add specific points or angle you want emphasized. Leave blank for AI to draft from the narrative role alone." /></Field>
        {references.length ? <div className="space-y-3"><p className="text-sm font-medium">References</p>{references.map((reference) => { const count = counts[reference as keyof typeof counts]; const label = count === null ? `${referenceLabels[reference] ?? reference} (not connected)` : `${referenceLabels[reference] ?? reference} (${count ?? 0} items)`; return <label key={reference} className="flex items-center gap-3 rounded-md border p-3 text-sm"><Checkbox checked={selectedReferences.includes(reference)} onCheckedChange={(checked) => setSelectedReferences((current) => checked ? [...new Set([...current, reference])] : current.filter((item) => item !== reference))} /><span>{label}</span></label>; })}</div> : null}
        <Button type="button" onClick={() => generate.mutate()} disabled={generate.isPending || !brief}>{generate.isPending ? "Generating…" : "Generate draft"}</Button>
        {edited && originalDraft ? (
          <div className="space-y-4 rounded-md border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Generated by AI · review and edit before publishing</Badge>
              <Badge variant="outline">{edited.visual_type}</Badge>
              {editedFields.size > 0 ? <Badge variant="outline" className="border-primary/40 text-primary">{editedFields.size} felt endret</Badge> : null}
            </div>

            <div className="grid grid-cols-1 gap-1 text-sm md:grid-cols-2">
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nåværende</div>
              <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI-forslag — redigerbar</div>
            </div>

            <div className="space-y-3 text-sm">
              <FieldRowShell
                label="Title"
                edited={editedFields.has("title")}
                leftCurrent={<pre className="whitespace-pre-wrap text-muted-foreground">{form.title || "—"}</pre>}
                rightEditor={<Input value={edited.title} maxLength={120} onChange={(e) => setEdited((current) => current ? { ...current, title: e.target.value } : current)} />}
                errorBlock={titleError ? <p className="text-xs text-destructive">{titleError}</p> : <p className="text-xs text-muted-foreground">{edited.title.length}/80</p>}
              />
              <FieldRowShell
                label="Subtitle"
                edited={editedFields.has("subtitle")}
                leftCurrent={<pre className="whitespace-pre-wrap text-muted-foreground">{form.subtitle || "—"}</pre>}
                rightEditor={<Input value={edited.subtitle} maxLength={160} onChange={(e) => setEdited((current) => current ? { ...current, subtitle: e.target.value } : current)} />}
                errorBlock={subtitleError ? <p className="text-xs text-destructive">{subtitleError}</p> : <p className="text-xs text-muted-foreground">{edited.subtitle.length}/120</p>}
              />
              <FieldRowShell
                label="Visual type"
                edited={false}
                leftCurrent={<Badge variant="outline">{form.visual_type}</Badge>}
                rightEditor={<div className="flex items-center gap-2"><Badge variant="outline">{edited.visual_type}</Badge><span className="text-xs text-muted-foreground">Låst — forkast og generer på nytt for å bytte</span></div>}
              />
              <FieldRowShell
                label="Body"
                edited={editedFields.has("body_md")}
                leftCurrent={<pre className="whitespace-pre-wrap text-muted-foreground">{form.body_md || "—"}</pre>}
                rightEditor={<Textarea value={edited.body_md} rows={4} onChange={(e) => setEdited((current) => current ? { ...current, body_md: e.target.value } : current)} />}
                errorBlock={bodyError ? <p className="text-xs text-destructive">{bodyError}</p> : <p className="text-xs text-muted-foreground">{edited.body_md.length}/4000</p>}
              />
              <FieldRowShell
                label="Visual config"
                edited={editedFields.has("visual_config")}
                leftCurrent={<pre className="max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs text-muted-foreground">{JSON.stringify(form.visual_config, null, 2) || "—"}</pre>}
                rightEditor={<Textarea value={edited.configRaw} rows={10} className="font-mono text-xs" onChange={(e) => setEdited((current) => current ? { ...current, configRaw: e.target.value } : current)} />}
                errorBlock={renderConfigError()}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" onClick={handleAccept} disabled={!isValid || savingAcceptance}>{savingAcceptance ? "Saving…" : "Accept draft"}</Button>
              <Button type="button" variant="outline" onClick={handleDiscard} disabled={savingAcceptance}>Discard</Button>
              {!isValid ? <span className="text-xs text-muted-foreground">Rett opp valideringsfeil for å akseptere</span> : null}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function PortalSlideEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dirty, setDirty] = useState(false);
  const [acceptedAiDraft, setAcceptedAiDraft] = useState(false);
  const { data: slides = [] } = useQuery({ queryKey: ["portal-slides"], queryFn: async () => { const { data, error } = await supabase.from("portal_slides").select("*").order("display_order", { ascending: true }); if (error) throw error; return data; } });
  const existing = slides.find((slide) => slide.id === id);
  const nextNumber = slides.length ? Math.max(...slides.map((slide) => slide.slide_number)) + 1 : 1;
  const [form, setForm] = useState<SlideFormValues>({ slug: "", slide_number: nextNumber, title: "", subtitle: "", body_md: "", visual_type: "custom", visual_config: {}, is_published: false, display_order: nextNumber });
  useEffect(() => { if (existing) setForm(toForm(existing)); else if (isNew) setForm((current) => ({ ...current, slide_number: nextNumber, display_order: nextNumber })); }, [existing, isNew, nextNumber]);
  const debounced = useDebounced(form);
  const previewSlide = createPreviewSlide(debounced);
  const update = (patch: Partial<SlideFormValues>) => { setDirty(true); setForm((current) => ({ ...current, ...patch })); };
  const acceptDraft = (draft: SlideDraftResponse) => { setAcceptedAiDraft(true); update({ title: draft.title, subtitle: draft.subtitle ?? "", body_md: draft.body_md ?? "", visual_type: draft.visual_type, visual_config: toJson(draft.visual_config) }); };
  const save = useMutation({ mutationFn: async () => {
    const parsed = slideSchema.safeParse(form);
    if (!parsed.success) throw new Error("Slug, visual type, or display order is invalid.");
    const duplicate = slides.find((slide) => slide.slug === form.slug && slide.id !== form.id);
    if (duplicate) throw new Error("Slug must be unique.");
    const payload = { slug: form.slug, slide_number: form.slide_number, title: form.title.trim() || null, subtitle: form.subtitle.trim() || null, body_md: form.body_md.trim() || null, visual_type: form.visual_type, visual_config: form.visual_config, is_published: form.is_published, display_order: form.display_order };
    if (isNew) { const { error } = await supabase.from("portal_slides").insert(payload); if (error) throw error; }
    else { const { error } = await supabase.from("portal_slides").update(payload).eq("id", id); if (error) throw error; }
  }, onSuccess: () => { setAcceptedAiDraft(false); toast({ title: "Slide saved" }); queryClient.invalidateQueries({ queryKey: ["portal-slides"] }); navigate("/cms/portal/slides"); }, onError: (error) => toast({ title: "Save failed", description: error.message, variant: "destructive" }) });
  const cancel = () => { if (!dirty || window.confirm("Discard unsaved changes?")) navigate("/cms/portal/slides"); };

  return (
    <PortalCmsLayout title={isNew ? "New slide" : "Edit slide"} description="Preview renders directly from unsaved draft form values.">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(360px,2fr)]">
        <div className="space-y-6">
          <AiDraftPanel form={form} onAccept={acceptDraft} />
          <Card><CardContent className="space-y-5 pt-6">
            {acceptedAiDraft ? <Badge variant="secondary">Generated by AI · review before publishing</Badge> : null}
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
        </div>
        <Card className="lg:sticky lg:top-28 lg:self-start"><CardHeader><CardTitle>Preview</CardTitle><CardDescription>Debounced 300ms from draft state.</CardDescription></CardHeader><CardContent><div className="aspect-video overflow-auto rounded-md border bg-background"><div className="min-h-full"><SlideRenderer slide={{ ...previewSlide, visual_config: jsonToVisualConfig(form.visual_config) as VisualConfig | null }} mode="viewer" /></div></div></CardContent></Card>
      </div>
    </PortalCmsLayout>
  );
}
