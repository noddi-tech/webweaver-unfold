import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface DbImage {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
  section: string;
  file_name: string;
  file_url: string;
  sort_order: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DbSection {
  id: string;
  name: string;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
}

const ImageManager = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<DbSection[]>([]);
  const [images, setImages] = useState<DbImage[]>([]);
  const [newSection, setNewSection] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadSection, setUploadSection] = useState<string>("hero");

  const previewRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const sectionToAnchor = (s: string) => {
    const map: Record<string, string> = {
      hero: "home",
      features: "features",
      testimonials: "testimonials",
      footer: "footer",
    };
    return map[s] || s;
  };

  const scrollAndHighlight = () => {
    const iframe = previewRef.current;
    const doc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!doc) return;
    const id = sectionToAnchor(uploadSection);
    const el = doc.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const prevOutline = (el as HTMLElement).style.outline;
    const prevOffset = (el as HTMLElement).style.outlineOffset as any;
    (el as HTMLElement).style.outline = "3px solid hsl(var(--primary))";
    (el as HTMLElement).style.outlineOffset = "2px" as any;
    setTimeout(() => {
      (el as HTMLElement).style.outline = prevOutline;
      (el as HTMLElement).style.outlineOffset = prevOffset;
    }, 1500);
  };

  useEffect(() => {
    const iframe = previewRef.current;
    if (!iframe) return;
    const onLoad = () => setTimeout(scrollAndHighlight, 300);
    iframe.addEventListener("load", onLoad);
    return () => iframe.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    // Re-run highlight when section changes
    setTimeout(scrollAndHighlight, 400);
  }, [uploadSection]);
  const groupedBySection = useMemo(() => {
    const map: Record<string, DbImage[]> = {};
    for (const img of images) {
      if (!map[img.section]) map[img.section] = [];
      map[img.section].push(img);
    }
    // sort by sort_order then created_at
    Object.values(map).forEach((arr) => arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    return map;
  }, [images]);

  useEffect(() => {
    fetchSections();
    fetchImages();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase.from("image_sections").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to fetch sections", description: error.message, variant: "destructive" });
      return;
    }
    setSections(data || []);
  };

  const fetchImages = async () => {
    const { data, error } = await supabase.from("images").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to fetch images", description: error.message, variant: "destructive" });
      return;
    }
    setImages(data || []);
  };

  const addSection = async () => {
    const name = newSection.trim();
    if (!name) return;
    const { error } = await supabase.from("image_sections").insert({ name });
    if (error) {
      toast({ title: "Add section failed", description: error.message, variant: "destructive" });
      return;
    }
    setNewSection("");
    toast({ title: "Section added" });
    fetchSections();
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section? (Images will not be deleted but keep their section text)")) return;
    const { error } = await supabase.from("image_sections").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete section failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Section deleted" });
    fetchSections();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const upload = async () => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const base = file.name.replace(/\.[^/.]+$/, "");
        const path = `${uploadSection}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { cacheControl: "3600", upsert: false });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
        const title = base;
        const { error: dbErr } = await supabase
          .from("images")
          .insert({
            title,
            alt: title,
            caption: null,
            section: uploadSection,
            file_name: file.name,
            file_url: pub.publicUrl,
          } as any);
        if (dbErr) throw dbErr;
      }
      toast({ title: "Upload complete" });
      setFiles(null);
      fetchImages();
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const saveImage = async (img: DbImage) => {
    const { id, ...updates } = img as any;
    const { error } = await supabase.from("images").update(updates).eq("id", img.id);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saved" });
    fetchImages();
  };

  const extractStoragePath = (url: string) => {
    // Supabase public URL pattern: /storage/v1/object/public/site-images/<path>
    const idx = url.indexOf("/site-images/");
    if (idx === -1) return null;
    return url.substring(idx + "/site-images/".length);
  };

  const deleteImage = async (img: DbImage) => {
    if (!confirm("Delete this image?")) return;
    const storagePath = extractStoragePath(img.file_url);
    if (storagePath) {
      await supabase.storage.from("site-images").remove([storagePath]);
    }
    const { error } = await supabase.from("images").delete().eq("id", img.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Image deleted" });
    fetchImages();
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Images CMS</h2>
        <p className="text-muted-foreground">Upload and manage site images by section (e.g., hero, features, testimonials).</p>
      </header>

      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Upload Images</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={uploadSection} onValueChange={setUploadSection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
                {/* Fallback common sections */}
                {sections.length === 0 && ["hero","features","testimonials","footer"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Files</Label>
            <Input type="file" multiple accept="image/*" onChange={onFileChange} />
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={upload} disabled={uploading || !files}>
            {uploading ? "Uploading..." : "Upload"}
          </Button>
          {files && <span className="text-sm text-muted-foreground self-center">{files.length} file(s) selected</span>}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <Label>Preview location</Label>
          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <iframe
              ref={previewRef}
              key={iframeKey}
              src={`/#${sectionToAnchor(uploadSection)}`}
              title="Section preview"
              className="w-full h-[420px] bg-background"
            />
          </div>
          <p className="text-xs text-muted-foreground">We auto-scroll and highlight the "{uploadSection}" section on the homepage preview.</p>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Sections</h3>
        <div className="flex gap-3">
          <Input placeholder="New section name" value={newSection} onChange={(e) => setNewSection(e.target.value)} />
          <Button onClick={addSection}>Add</Button>
        </div>
        <Separator className="my-2" />
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1">
              <span className="text-sm">{s.name}</span>
              <Button variant="outline" size="sm" onClick={() => deleteSection(s.id)}>Delete</Button>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">No sections yet. Add some above.</p>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        {Object.keys(groupedBySection).length === 0 && (
          <p className="text-muted-foreground">No images uploaded yet.</p>
        )}
        {Object.entries(groupedBySection).map(([section, imgs]) => (
          <Card key={section} className="p-6 bg-card border-border space-y-4">
            <h3 className="text-lg font-semibold">Section: {section}</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {imgs.map((img) => (
                <div key={img.id} className="grid gap-3 rounded-lg border border-border p-4">
                  <img src={img.file_url} alt={img.alt ?? img.title} className="w-full h-40 object-cover rounded-md" loading="lazy" />
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input value={img.title} onChange={(e) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, title: e.target.value } : i))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Alt text</Label>
                    <Input value={img.alt ?? ""} onChange={(e) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, alt: e.target.value } : i))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Caption</Label>
                    <Textarea value={img.caption ?? ""} onChange={(e) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, caption: e.target.value } : i))} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Section</Label>
                    <Select value={img.section} onValueChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, section: v } : i))}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                        ))}
                        {sections.length === 0 && ["hero","features","testimonials","footer"].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Sort order</Label>
                    <Input type="number" value={img.sort_order ?? 0} onChange={(e) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, sort_order: Number(e.target.value) } : i))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch checked={img.active} onCheckedChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, active: v } : i))} />
                      <span className="text-sm text-muted-foreground">Active</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveImage(img)}>Save</Button>
                      <Button variant="outline" size="sm" onClick={() => deleteImage(img)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ImageManager;
