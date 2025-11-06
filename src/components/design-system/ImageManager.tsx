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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

// Helper function to map color tokens to CSS classes
const getColorClass = (colorToken: string): string => {
  const colorMap: Record<string, string> = {
    'foreground': 'text-foreground',
    'primary': 'text-primary',
    'secondary': 'text-secondary',
    'muted-foreground': 'text-muted-foreground',
    'accent': 'text-accent',
    'gradient-text': 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'
  };
  return colorMap[colorToken] || 'text-foreground';
};

interface DbImage {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
  caption_position?: string;
  title_color_token?: string;
  caption_color_token?: string;
  section: string;
  file_name: string;
  file_url: string;
  link_url: string | null;
  sort_order: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface DbSection {
  id: string;
  name: string;
  display_name: string;
  page_location: string;
  sort_order: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const ImageManager = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<DbSection[]>([]);
  const [images, setImages] = useState<DbImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadSection, setUploadSection] = useState<string>("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<DbImage | null>(null);

  // Enhanced bulk upload tracking
  interface FileUploadStatus {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
    url?: string;
  }
  const [uploadQueue, setUploadQueue] = useState<FileUploadStatus[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    const id = hasImages(uploadSection) ? sectionToAnchor(uploadSection) : null;
    if (!id) return;
    const el = doc.getElementById(id);
    if (!el) return;
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

  const hasImages = (s: string) => (groupedBySection[s]?.length ?? 0) > 0;

  useEffect(() => {
    fetchSections();
    fetchImages();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase.from("sections").select("*").eq("active", true).order("sort_order", { ascending: true }).order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to fetch sections", description: error.message, variant: "destructive" });
      return;
    }
    setSections(data || []);
    // Set first section as default if none selected
    if (!uploadSection && data && data.length > 0) {
      setUploadSection(data[0].name);
    }
  };

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Failed to fetch images", description: error.message, variant: "destructive" });
      return;
    }
    const rows = (data ?? []).map((r: any) => ({ link_url: r.link_url ?? null, ...r })) as DbImage[];
    setImages(rows);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    
    const queue: FileUploadStatus[] = Array.from(selectedFiles).map(file => ({
      file,
      status: 'pending' as const,
    }));
    
    setUploadQueue(queue);
    setFiles(selectedFiles);
  };

  const upload = async () => {
    if (uploadQueue.length === 0) return;
    setUploading(true);
    
    const updatedQueue = [...uploadQueue];
    
    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status !== 'pending') continue;
      
      // Update status to uploading
      updatedQueue[i] = { ...item, status: 'uploading' };
      setUploadQueue([...updatedQueue]);
      
      try {
        const file = item.file;
        const base = file.name.replace(/\.[^/.]+$/, "");
        const path = `${uploadSection}/${Date.now()}-${file.name}`;
        
        const { error: upErr } = await supabase.storage
          .from("site-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
          
        if (upErr) throw upErr;
        
        const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
        
        const { error: dbErr } = await supabase.from("images").insert({
          title: base,
          alt: base,
          caption: null,
          section: uploadSection,
          file_name: file.name,
          file_url: pub.publicUrl,
        } as any);
        
        if (dbErr) throw dbErr;
        
        // Mark as success
        updatedQueue[i] = { ...item, status: 'success', url: pub.publicUrl };
        setUploadQueue([...updatedQueue]);
        
      } catch (e: any) {
        // Mark as error but CONTINUE with other files
        updatedQueue[i] = { ...item, status: 'error', error: e.message };
        setUploadQueue([...updatedQueue]);
      }
    }
    
    const successCount = updatedQueue.filter(u => u.status === 'success').length;
    const errorCount = updatedQueue.filter(u => u.status === 'error').length;
    
    toast({ 
      title: "Upload complete",
      description: `${successCount} succeeded, ${errorCount} failed`
    });
    
    setUploading(false);
    setFiles(null);
    fetchImages();
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

  const openDeleteModal = (img: DbImage) => {
    setImageToDelete(img);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setImageToDelete(null);
  };

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    
    const storagePath = extractStoragePath(imageToDelete.file_url);
    if (storagePath) {
      await supabase.storage.from("site-images").remove([storagePath]);
    }
    const { error } = await supabase.from("images").delete().eq("id", imageToDelete.id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Image deleted" });
    fetchImages();
    closeDeleteModal();
  };

  const replaceImage = async (imageId: string, file: File | null) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const img = images.find(i => i.id === imageId);
      if (!img) throw new Error("Image not found");
      
      // Delete old image from storage
      const oldStoragePath = extractStoragePath(img.file_url);
      if (oldStoragePath) {
        await supabase.storage.from("site-images").remove([oldStoragePath]);
      }
      
      // Upload new image
      const ext = file.name.split(".").pop();
      const path = `${img.section}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("site-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      
      const { data: pub } = supabase.storage.from("site-images").getPublicUrl(path);
      
      // Update database with new file info
      const { error: dbErr } = await supabase
        .from("images")
        .update({
          file_name: file.name,
          file_url: pub.publicUrl,
        })
        .eq("id", imageId);
      if (dbErr) throw dbErr;
      
      toast({ title: "Image replaced successfully" });
      fetchImages();
    } catch (e: any) {
      toast({ title: "Replace failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    
    if (droppedFiles.length > 0) {
      const queue: FileUploadStatus[] = droppedFiles.map(file => ({
        file,
        status: 'pending' as const,
      }));
      setUploadQueue(queue);
      
      // Update files state for compatibility
      const dt = new DataTransfer();
      droppedFiles.forEach(f => dt.items.add(f));
      setFiles(dt.files);
    }
  };

  const FileQueueDisplay = () => {
    if (uploadQueue.length === 0) return null;
    
    return (
      <div className="space-y-2 p-4 bg-muted/30 rounded-lg border border-border">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Upload Queue ({uploadQueue.length} files)</h4>
          {!uploading && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setUploadQueue([]);
                setFiles(null);
              }}
              className="h-7 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {uploadQueue.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 p-2 bg-background rounded text-sm"
            >
              {/* Status Icon */}
              {item.status === 'pending' && (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground" />
              )}
              {item.status === 'uploading' && (
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
              {item.status === 'success' && (
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {item.status === 'error' && (
                <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              
              {/* File Name */}
              <span className="flex-1 truncate">{item.file.name}</span>
              
              {/* File Size */}
              <span className="text-xs text-muted-foreground">
                {(item.file.size / 1024).toFixed(1)} KB
              </span>
              
              {/* Error Message */}
              {item.status === 'error' && item.error && (
                <span className="text-xs text-destructive" title={item.error}>
                  Failed
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Images CMS</h2>
        <p className="text-muted-foreground">Upload and manage site images by section (e.g., hero, features, testimonials).</p>
      </header>

      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Upload Images</h3>
        <div className="space-y-2">
          <Label>Section</Label>
          <Select value={uploadSection} onValueChange={setUploadSection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.display_name} ({s.name})</SelectItem>
              ))}
              {/* Fallback common sections */}
              {sections.length === 0 && ["hero"].map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Drag & Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border'
          } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <p className="text-muted-foreground mb-2">
            Drag and drop images here, or click to browse
          </p>
          <Input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={onFileChange}
            disabled={uploading}
            className="max-w-xs mx-auto cursor-pointer"
          />
        </div>
        
        {/* File Queue Display */}
        <FileQueueDisplay />
        
        <div className="flex gap-3">
          <Button 
            onClick={upload} 
            disabled={uploading || uploadQueue.length === 0}
          >
            {uploading ? "Uploading..." : uploadQueue.length > 0 ? `Upload ${uploadQueue.length} file(s)` : "Upload"}
          </Button>
          
          {uploadQueue.length > 0 && !uploading && (
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadQueue([]);
                setFiles(null);
              }}
            >
              Clear Queue
            </Button>
          )}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2">
          <Label>Preview location</Label>
          <div className="rounded-lg border border-border overflow-hidden bg-background">
            <iframe
              ref={previewRef}
              key={iframeKey}
              src={hasImages(uploadSection) ? `/#${sectionToAnchor(uploadSection)}` : "/"}
              title="Section preview"
              className="w-full h-[420px] bg-background"
            />
          </div>
          <p className="text-xs text-muted-foreground">{hasImages(uploadSection) ? `We auto-scroll and highlight the "${uploadSection}" section on the homepage preview.` : `No images in "${uploadSection}" yet — preview anchors appear only for sections with images.`}</p>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border space-y-4">
        <h3 className="text-xl font-semibold">Available Sections</h3>
        <p className="text-sm text-muted-foreground">Sections are managed in the Sections CMS. Only active sections are shown here.</p>
        <Separator className="my-2" />
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-md border border-border px-3 py-1">
              <span className="text-sm font-medium">{s.display_name}</span>
              <span className="text-xs text-muted-foreground">({s.name})</span>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-muted-foreground">No active sections available. Manage sections in the Sections CMS.</p>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        {Object.keys(groupedBySection).length === 0 && (
          <p className="text-muted-foreground">No images uploaded yet.</p>
        )}
        {Object.entries(groupedBySection).map(([section, imgs]) => {
          const sectionInfo = sections.find(s => s.name === section);
          const sectionTitle = sectionInfo ? `${sectionInfo.display_name} (${section})` : section;
          return (
            <Card key={section} className="p-6 bg-card border-border space-y-4">
              <h3 className="text-lg font-semibold">Section: {sectionTitle}</h3>
                <div className="grid gap-6 md:grid-cols-2">
                {imgs.map((img) => (
                  <div key={img.id} className="grid gap-3 rounded-lg border border-border p-4">
                    <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                      <div className="text-xs font-medium text-muted-foreground mb-2">Preview:</div>
                      {img.title && (
                        <h4 className={`font-semibold text-lg ${getColorClass(img.title_color_token || 'foreground')}`}>
                          {img.title}
                        </h4>
                      )}
                      {img.caption && img.caption_position === 'above' && (
                        <p className={`text-sm leading-relaxed ${getColorClass(img.caption_color_token || 'muted-foreground')}`}>
                          {img.caption}
                        </p>
                      )}
                      <img src={img.file_url} alt={img.alt ?? img.title} className="w-full h-40 object-cover rounded-md" loading="lazy" />
                      {img.caption && (!img.caption_position || img.caption_position === 'below') && (
                        <p className={`text-sm mt-2 leading-relaxed ${getColorClass(img.caption_color_token || 'muted-foreground')}`}>
                          {img.caption}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {/* Replace Image */}
                      <div className="space-y-2 pt-2 border-t border-border">
                        <Label className="text-xs font-medium">Replace Image</Label>
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => replaceImage(img.id, e.target.files?.[0] || null)}
                          className="text-xs"
                        />
                      </div>
                      
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
                        <Label>Caption Position</Label>
                        <Select value={img.caption_position || 'below'} onValueChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, caption_position: v } : i))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="above">Above image (below heading)</SelectItem>
                            <SelectItem value="below">Below image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Title Color</Label>
                        <Select value={img.title_color_token || 'foreground'} onValueChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, title_color_token: v } : i))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="foreground">Default Text</SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="muted-foreground">Muted</SelectItem>
                            <SelectItem value="accent">Accent</SelectItem>
                            <SelectItem value="gradient-text">Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Caption Color</Label>
                        <Select value={img.caption_color_token || 'muted-foreground'} onValueChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, caption_color_token: v } : i))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="foreground">Default Text</SelectItem>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="secondary">Secondary</SelectItem>
                            <SelectItem value="muted-foreground">Muted</SelectItem>
                            <SelectItem value="accent">Accent</SelectItem>
                            <SelectItem value="gradient-text">Gradient</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Link URL</Label>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          value={img.link_url ?? ""}
                          onChange={(e) =>
                            setImages((prev) =>
                              prev.map((i) => (i.id === img.id ? { ...i, link_url: e.target.value } : i))
                            )
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Section</Label>
                        <Select value={img.section} onValueChange={(v) => setImages((prev) => prev.map((i) => i.id === img.id ? { ...i, section: v } : i))}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((s) => (
                              <SelectItem key={s.id} value={s.name}>{s.display_name} ({s.name})</SelectItem>
                            ))}
                             {sections.length === 0 && ["hero"].map((s) => (
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
                          <Button variant="destructive" size="sm" onClick={() => openDeleteModal(img)}>
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Delete confirmation modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
              {imageToDelete && (
                <div className="mt-3 p-3 rounded-lg bg-muted">
                  <p className="font-medium text-sm">{imageToDelete.title}</p>
                  <p className="text-xs text-muted-foreground">{imageToDelete.file_name}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteImage}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ImageManager;
