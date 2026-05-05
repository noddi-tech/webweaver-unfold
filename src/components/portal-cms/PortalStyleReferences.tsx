import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Upload, AlertTriangle, Loader2, ImageOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { PortalCmsLayout } from "./PortalCmsLayout";
import {
  ASSET_TYPES, USE_FOR_OPTIONS, SOURCE_COMPANY_SUGGESTIONS,
  TITLE_MAX, DESCRIPTION_MAX, NOTES_MAX,
} from "./styleReferenceConstants";
import type { Database } from "@/integrations/supabase/types";

type StyleRef = Database["public"]["Tables"]["portal_style_references"]["Row"];

const BUCKET = "portal-style-references";
const ALL = "__all__";

function uploadImage(file: File): Promise<string> {
  return (async () => {
    const ext = file.name.split(".").pop() || "png";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600", upsert: false, contentType: file.type,
    });
    if (error) throw error;
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  })();
}

export function PortalStyleReferences() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<StyleRef | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StyleRef | null>(null);
  const [filterSource, setFilterSource] = useState<string>(ALL);
  const [filterUseFor, setFilterUseFor] = useState<string>(ALL);
  const [filterAsset, setFilterAsset] = useState<string>(ALL);
  const [onlyAvoid, setOnlyAvoid] = useState(false);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["portal-style-references"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portal_style_references")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as StyleRef[];
    },
  });

  const sources = useMemo(
    () => Array.from(new Set(rows.map((r) => r.source_company).filter(Boolean) as string[])).sort(),
    [rows],
  );

  const filtered = useMemo(() => rows.filter((r) => {
    if (filterSource !== ALL && r.source_company !== filterSource) return false;
    if (filterUseFor !== ALL && !(r.use_for ?? []).includes(filterUseFor)) return false;
    if (filterAsset !== ALL && r.asset_type !== filterAsset) return false;
    if (onlyAvoid && !r.avoid) return false;
    return true;
  }), [rows, filterSource, filterUseFor, filterAsset, onlyAvoid]);

  const del = useMutation({
    mutationFn: async (row: StyleRef) => {
      // Best-effort delete of storage object
      if (row.image_url) {
        try {
          const url = new URL(row.image_url);
          const idx = url.pathname.indexOf(`/${BUCKET}/`);
          if (idx >= 0) {
            const path = url.pathname.slice(idx + BUCKET.length + 2);
            await supabase.storage.from(BUCKET).remove([path]);
          }
        } catch { /* ignore */ }
      }
      const { error } = await supabase.from("portal_style_references").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Stilreferanse slettet" });
      qc.invalidateQueries({ queryKey: ["portal-style-references"] });
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast({ title: "Kunne ikke slette", description: e.message, variant: "destructive" }),
  });

  return (
    <PortalCmsLayout
      title="Style References"
      description="Visuelle referanser AI-en bruker når den utkaster slides. Notatene styrer hva AI lærer fra hvert bilde."
      action={
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> Ny referanse
        </Button>
      }
    >
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div>
              <Label className="text-xs">Kilde</Label>
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle kilder</SelectItem>
                  {sources.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Brukes for</Label>
              <Select value={filterUseFor} onValueChange={setFilterUseFor}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle</SelectItem>
                  {USE_FOR_OPTIONS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <Select value={filterAsset} onValueChange={setFilterAsset}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle typer</SelectItem>
                  {ASSET_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Checkbox id="only-avoid" checked={onlyAvoid} onCheckedChange={(v) => setOnlyAvoid(!!v)} />
              <Label htmlFor="only-avoid" className="cursor-pointer">Vis kun anti-mønstre</Label>
            </div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Viser {filtered.length} av {rows.length} referanser
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Ingen referanser matcher filteret.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((row) => (
            <ReferenceCard
              key={row.id}
              row={row}
              onEdit={() => setEditing(row)}
              onDelete={() => setDeleteTarget(row)}
            />
          ))}
        </div>
      )}

      {(editing || creating) && (
        <StyleReferenceDialog
          row={editing}
          open={!!(editing || creating)}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => qc.invalidateQueries({ queryKey: ["portal-style-references"] })}
          nextOrder={rows.length + 1}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slette stilreferanse?</AlertDialogTitle>
            <AlertDialogDescription>
              Dette kan ikke angres. AI-en vil ikke lenger bruke "{deleteTarget?.title}" som referanse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTarget?.image_url ? (
            <img src={deleteTarget.image_url} alt={deleteTarget.title} className="max-h-48 w-full object-contain rounded border" />
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && del.mutate(deleteTarget)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PortalCmsLayout>
  );
}

function ReferenceCard({ row, onEdit, onDelete }: { row: StyleRef; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="overflow-hidden border bg-card text-card-foreground">
      <div className="relative aspect-video bg-muted">
        {row.image_url ? (
          <img src={row.image_url} alt={row.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground gap-1">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Trenger bilde</span>
          </div>
        )}
        {row.avoid && (
          <Badge variant="destructive" className="absolute top-2 left-2 gap-1">
            <AlertTriangle className="h-3 w-3" /> AVOID
          </Badge>
        )}
        {!row.is_published && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-background/80">Skjult</Badge>
        )}
      </div>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight truncate">{row.title}</h3>
            <p className="text-xs text-card-foreground/80">
              {row.source_company || "—"} · {row.asset_type}
            </p>
          </div>
        </div>
        {row.use_for?.length ? (
          <div className="flex flex-wrap gap-1">
            {row.use_for.map((u) => <Badge key={u} variant="secondary" className="text-[10px]">{u}</Badge>)}
          </div>
        ) : null}
        <p className="text-sm text-card-foreground/85 line-clamp-3 whitespace-pre-line">{row.notes}</p>
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="secondary" onClick={onEdit} className="bg-background text-foreground hover:bg-muted">
            <Edit className="h-3 w-3 mr-1" />Rediger
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-3 w-3 mr-1" />Slett
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type FormState = {
  title: string;
  description: string;
  image_url: string;
  asset_type: string;
  source_company: string;
  use_for: string[];
  avoid: boolean;
  notes: string;
  display_order: number;
  is_published: boolean;
};

function emptyForm(nextOrder: number): FormState {
  return {
    title: "", description: "", image_url: "", asset_type: "slide",
    source_company: "", use_for: [], avoid: false, notes: "",
    display_order: nextOrder, is_published: true,
  };
}

function StyleReferenceDialog({
  row, open, onClose, onSaved, nextOrder,
}: {
  row: StyleRef | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  nextOrder: number;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(() => emptyForm(nextOrder));
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (row) {
      setForm({
        title: row.title,
        description: row.description ?? "",
        image_url: row.image_url ?? "",
        asset_type: row.asset_type,
        source_company: row.source_company ?? "",
        use_for: row.use_for ?? [],
        avoid: row.avoid,
        notes: row.notes,
        display_order: row.display_order,
        is_published: row.is_published,
      });
    } else {
      setForm(emptyForm(nextOrder));
    }
  }, [row, nextOrder, open]);

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Bare bildefiler er tillatt", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      update({ image_url: url });
      toast({ title: "Bilde lastet opp" });
    } catch (e) {
      toast({ title: "Opplasting feilet", description: (e as Error).message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const toggleUseFor = (val: string) => {
    update({ use_for: form.use_for.includes(val) ? form.use_for.filter((v) => v !== val) : [...form.use_for, val] });
  };

  const save = async () => {
    if (!form.title.trim()) return toast({ title: "Tittel er påkrevd", variant: "destructive" });
    if (form.title.length > TITLE_MAX) return toast({ title: `Tittel maks ${TITLE_MAX} tegn`, variant: "destructive" });
    if (form.description.length > DESCRIPTION_MAX) return toast({ title: `Beskrivelse maks ${DESCRIPTION_MAX} tegn`, variant: "destructive" });
    if (!form.notes.trim()) return toast({ title: "Notater er påkrevd", variant: "destructive" });
    if (form.notes.length > NOTES_MAX) return toast({ title: `Notater maks ${NOTES_MAX} tegn`, variant: "destructive" });

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: form.image_url,
        asset_type: form.asset_type,
        source_company: form.source_company.trim() || null,
        use_for: form.use_for,
        avoid: form.avoid,
        notes: form.notes.trim(),
        display_order: form.display_order,
        is_published: form.is_published,
        needs_image: !form.image_url,
      };
      if (row) {
        const { error } = await supabase.from("portal_style_references").update(payload).eq("id", row.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase.from("portal_style_references")
          .insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }
      toast({ title: row ? "Referanse oppdatert" : "Referanse opprettet" });
      onSaved();
      onClose();
    } catch (e) {
      toast({ title: "Lagring feilet", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{row ? "Rediger stilreferanse" : "Ny stilreferanse"}</DialogTitle>
          <DialogDescription>
            Notatene er det viktigste — de styrer hva AI lærer fra dette bildet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image upload */}
          <div className="space-y-2">
            <Label>Bilde</Label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"}`}
            >
              {form.image_url ? (
                <div className="space-y-2">
                  <img src={form.image_url} alt="Preview" className="mx-auto max-h-64 rounded object-contain" />
                  <div className="flex justify-center gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      {uploading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Laster opp…</> : <><Upload className="h-3 w-3 mr-1" />Bytt bilde</>}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => update({ image_url: "" })}>Fjern</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Dra og slipp eller klikk for å laste opp</p>
                  <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Laster opp…</> : "Velg fil"}
                  </Button>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
          </div>

          <div>
            <div className="flex justify-between"><Label htmlFor="title">Tittel *</Label><span className="text-xs text-muted-foreground">{form.title.length}/{TITLE_MAX}</span></div>
            <Input id="title" value={form.title} maxLength={TITLE_MAX} onChange={(e) => update({ title: e.target.value })} />
          </div>

          <div>
            <div className="flex justify-between"><Label htmlFor="desc">Beskrivelse</Label><span className="text-xs text-muted-foreground">{form.description.length}/{DESCRIPTION_MAX}</span></div>
            <Textarea id="desc" value={form.description} maxLength={DESCRIPTION_MAX} rows={2} onChange={(e) => update({ description: e.target.value })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Asset type</Label>
              <Select value={form.asset_type} onValueChange={(v) => update({ asset_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="source">Kilde / selskap</Label>
              <Input
                id="source"
                value={form.source_company}
                list="source-suggestions"
                onChange={(e) => update({ source_company: e.target.value })}
                placeholder="f.eks. Linear"
              />
              <datalist id="source-suggestions">
                {SOURCE_COMPANY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Brukes for (multi-select)</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {USE_FOR_OPTIONS.map((u) => (
                <label key={u} className="flex items-center gap-2 cursor-pointer text-sm">
                  <Checkbox checked={form.use_for.includes(u)} onCheckedChange={() => toggleUseFor(u)} />
                  {u}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <Checkbox id="avoid" checked={form.avoid} onCheckedChange={(v) => update({ avoid: !!v })} />
            <Label htmlFor="avoid" className="cursor-pointer">
              <span className="font-medium text-destructive">Anti-mønster</span>
              <span className="block text-xs text-muted-foreground">AI vil bli bedt om å unngå dette mønsteret</span>
            </Label>
          </div>

          <div>
            <div className="flex justify-between">
              <Label htmlFor="notes">Notater til AI *</Label>
              <span className="text-xs text-muted-foreground">{form.notes.length}/{NOTES_MAX}</span>
            </div>
            <Textarea
              id="notes"
              value={form.notes}
              maxLength={NOTES_MAX}
              rows={8}
              onChange={(e) => update({ notes: e.target.value })}
              placeholder="Hva skal AI lære fra dette bildet? Vær konkret om typografi, layout, hierarki, fargebruk..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="order">Visningsrekkefølge</Label>
              <Input id="order" type="number" value={form.display_order} onChange={(e) => update({ display_order: Number(e.target.value) })} />
            </div>
            <div className="flex items-end gap-2">
              <Switch id="published" checked={form.is_published} onCheckedChange={(v) => update({ is_published: v })} />
              <Label htmlFor="published" className="cursor-pointer">Publisert (synlig for AI)</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Avbryt</Button>
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Lagrer…</> : "Lagre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
