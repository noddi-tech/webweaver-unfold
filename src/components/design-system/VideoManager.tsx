import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Video, Save, RefreshCcw, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import EmojiPicker from "@/components/ui/emoji-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// DB types (kept simple to avoid coupling with generated types)
type DbVideo = {
  id: string;
  title: string;
  description: string | null;
  section: string;
  sort_order: number | null;
  file_name: string;
  file_url: string;
  thumbnail_shape?: string | null;
  thumbnail_url?: string | null;
};

type DbSection = {
  id: string;
  name: string;
  sort_order: number | null;
};

const VideoManager = () => {
  const [localUploads, setLocalUploads] = useState<Array<{ name: string; url: string; file: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const [dbVideos, setDbVideos] = useState<DbVideo[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sections, setSections] = useState<DbSection[]>([]);
  const [newSection, setNewSection] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchDbVideos();
    fetchSections();
  }, []);


  const groupedBySection = useMemo(() => {
    const groups: Record<string, DbVideo[]> = {};
    dbVideos.forEach(v => {
      const key = v.section || "General";
      groups[key] = groups[key] || [];
      groups[key].push(v);
    });
    Object.keys(groups).forEach(k => groups[k].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)));
    return groups;
  }, [dbVideos]);

  const sectionOptions = useMemo(() => {
    const names = sections.map((s) => s.name);
    if (!names.includes("General")) names.unshift("General");
    return names;
  }, [sections]);

  const fetchDbVideos = async () => {
    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("section", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching videos table:", error);
      toast({ title: "Failed to load videos", description: "Could not load video metadata", variant: "destructive" });
      return;
    }
    setDbVideos(data || []);
  };

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("video_sections")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      console.error("Error fetching sections:", error);
      toast({ title: "Failed to load sections", description: "Could not load sections list", variant: "destructive" });
      return;
    }
    setSections(data || []);
  };

  const addSection = async () => {
    const name = newSection.trim();
    if (!name) return;
    const { error } = await supabase.from("video_sections").insert({ name });
    if (error) {
      toast({ title: "Add section failed", description: error.message, variant: "destructive" });
      return;
    }
    setNewSection("");
    await fetchSections();
    toast({ title: "Section added", description: `${name} created.` });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith("video/"));

    if (videoFiles.length === 0) {
      toast({ title: "Invalid file type", description: "Please select video files only.", variant: "destructive" });
      return;
    }

    const newVideos = videoFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));

    setLocalUploads(prev => [...prev, ...newVideos]);
  };

  const uploadVideos = async () => {
    if (localUploads.length === 0) return;

    setUploading(true);
    try {
      const uploadedNames: string[] = [];

      for (const video of localUploads) {
        const fileExt = video.file.name.split(".").pop();
        const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from("demo-videos")
          .upload(uniqueName, video.file);
        if (uploadErr) throw uploadErr;

        const { data: publicUrlData } = supabase.storage
          .from("demo-videos")
          .getPublicUrl(uniqueName);

        const defaultTitle = video.name.replace(/\.[^/.]+$/, "");
        const insertRes = await supabase.from("videos").insert({
          title: defaultTitle,
          description: null,
          section: "General",
          file_name: uniqueName,
          file_url: publicUrlData.publicUrl,
          sort_order: 0,
          thumbnail_shape: "rectangle",
        } as any);
        if (insertRes.error) throw insertRes.error;

        uploadedNames.push(uniqueName);
      }

      setLocalUploads([]);
      await fetchDbVideos();
      toast({ title: "Videos uploaded", description: `${uploadedNames.length} video(s) added to gallery.` });
    } catch (error) {
      console.error(error);
      toast({ title: "Upload failed", description: "Failed to upload videos. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteVideo = async (fileName: string, id: string) => {
    try {
      const { error: storageErr } = await supabase.storage
        .from("demo-videos")
        .remove([fileName]);
      if (storageErr) throw storageErr;

      const { error: dbErr } = await supabase.from("videos").delete().eq("id", id);
      if (dbErr) throw dbErr;

      await fetchDbVideos();
      toast({ title: "Video deleted", description: "Removed from storage and database." });
    } catch (error) {
      console.error(error);
      toast({ title: "Delete failed", description: "Could not delete the video.", variant: "destructive" });
    }
  };

  const handleThumbnailUpload = async (videoId: string, file: File) => {
    try {
      setSavingId(videoId);
      const ext = file.name.split('.').pop();
      const uniqueName = `thumb-${videoId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('video-thumbnails')
        .upload(uniqueName, file);
      if (upErr) throw upErr;
      const { data: publicUrlData } = supabase.storage
        .from('video-thumbnails')
        .getPublicUrl(uniqueName);
      const url = publicUrlData.publicUrl;
      const { error: dbErr } = await supabase
        .from('videos')
        .update({ thumbnail_url: url })
        .eq('id', videoId);
      if (dbErr) throw dbErr;
      setDbVideos(prev => prev.map(v => v.id === videoId ? { ...v, thumbnail_url: url } : v));
      toast({ title: 'Thumbnail updated' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Thumbnail upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const removeThumbnail = async (videoId: string) => {
    try {
      setSavingId(videoId);
      const { error } = await supabase
        .from('videos')
        .update({ thumbnail_url: null })
        .eq('id', videoId);
      if (error) throw error;
      setDbVideos(prev => prev.map(v => v.id === videoId ? { ...v, thumbnail_url: null } : v));
      toast({ title: 'Thumbnail removed' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to remove thumbnail', description: err.message, variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const saveVideo = async (video: DbVideo) => {
    setSavingId(video.id);
    try {
      const { error } = await supabase
        .from("videos")
        .update({
          title: video.title,
          description: video.description,
          section: video.section,
          sort_order: video.sort_order ?? 0,
        })
        .eq("id", video.id);
      if (error) throw error;
      toast({ title: "Saved", description: "Video details updated." });
      await fetchDbVideos();
    } catch (error) {
      console.error(error);
      toast({ title: "Save failed", description: "Unable to update video.", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  const syncStorage = async () => {
    // Ensure all files in storage exist in DB
    const { data: storageFiles, error } = await supabase.storage
      .from("demo-videos")
      .list("", { limit: 100, sortBy: { column: "name", order: "asc" } });
    if (error) {
      toast({ title: "Sync failed", description: "Cannot list storage files.", variant: "destructive" });
      return;
    }

    const namesInDb = new Set(dbVideos.map(v => v.file_name));
    const toInsert = (storageFiles || [])
      .filter(f => !namesInDb.has(f.name))
      .map(f => {
        const { data: publicUrlData } = supabase.storage.from("demo-videos").getPublicUrl(f.name);
        return {
          title: f.name.replace(/\.[^/.]+$/, ""),
          description: null,
          section: "General",
          file_name: f.name,
          file_url: publicUrlData.publicUrl,
          sort_order: 0,
        } as Omit<DbVideo, "id">;
      });

    if (toInsert.length === 0) {
      toast({ title: "Up to date", description: "All storage files are already tracked." });
      return;
    }

    const { error: insertErr } = await supabase.from("videos").insert(toInsert as any);
    if (insertErr) {
      toast({ title: "Sync failed", description: insertErr.message, variant: "destructive" });
      return;
    }

    await fetchDbVideos();
    toast({ title: "Synced", description: `${toInsert.length} file(s) imported.` });
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Video className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Demo Video Manager</h2>
        <p className="text-muted-foreground">Upload and manage demo videos that appear on the public demo page</p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 bg-card border-border">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Upload New Videos</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <label htmlFor="video-upload" className="cursor-pointer">
              <Button asChild>
                <span>
                  <Upload className="mr-2" size={20} />
                  Select Videos
                </span>
              </Button>
            </label>
            <input id="video-upload" type="file" accept="video/*" multiple onChange={handleFileSelect} className="hidden" />
            {localUploads.length > 0 && (
              <Button onClick={uploadVideos} disabled={uploading} variant="outline">
                {uploading ? "Uploading..." : "Upload to Gallery"}
              </Button>
            )}
            <Button variant="ghost" onClick={syncStorage} title="Sync files from storage">
              <RefreshCcw className="mr-2 h-4 w-4" /> Sync from Storage
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">Supported formats: MP4, WebM, MOV</p>
        </div>

        {/* Preview New Videos */}
        {localUploads.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-4 text-foreground">Ready to Upload:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {localUploads.map((video, index) => (
                <div key={index} className="relative border border-border rounded-lg overflow-hidden">
                  <video src={video.url} className="w-full h-32 object-cover" muted />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button size="icon" variant="destructive" onClick={() => setLocalUploads(prev => prev.filter((_, i) => i !== index))}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-foreground truncate">{video.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Manage Sections */}
      <Card className="p-6 bg-card border-border">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">Sections</h3>
          </div>
          {sections.length > 0 ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Current sections</p>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <span key={s.id} className="px-2 py-1 rounded-md border border-border text-sm text-foreground">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sections yet. Add your first section below.</p>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
            <div className="grid gap-2">
              <Label htmlFor="new-section">Add new section</Label>
              <div className="flex items-center gap-2">
                  <Input
                    className="w-full"
                    id="new-section"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    placeholder="e.g. Capacity system, Worker app"
                  />
              </div>
            </div>
            <div className="flex gap-2 justify-end sm:justify-start">
              <EmojiPicker onSelect={(e) => setNewSection((prev) => prev + e)} />
              <Button onClick={addSection} disabled={!newSection.trim()}>
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Existing Videos (with editing) */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-foreground">Current Demo Videos</h3>
        </div>
        {dbVideos.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedBySection).map(([section, items]) => (
              <div key={section}>
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-foreground">{section}</h4>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((video) => (
                    <div key={video.id} className="relative border border-border rounded-lg overflow-hidden">
                      <video src={video.file_url} poster={video.thumbnail_url ?? undefined} controls className="w-full h-40 object-cover" />
                      <div className="absolute top-2 right-2 flex gap-2">
                        <Button size="icon" variant="destructive" onClick={() => deleteVideo(video.file_name, video.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                      <div className="p-3 space-y-3">
                        {/* Thumbnail controls */}
                        <div className="grid gap-2">
                          <Label>Thumbnail</Label>
                          <div className="flex items-center gap-3">
                            {video.thumbnail_url ? (
                              <img
                                src={video.thumbnail_url}
                                alt={`${video.title} thumbnail`}
                                className="h-14 w-24 rounded-md object-cover border border-border"
                              />
                            ) : (
                              <div className="h-14 w-24 rounded-md border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                                No thumbnail
                              </div>
                            )}
                            <input
                              id={`thumb-${video.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleThumbnailUpload(video.id, file);
                              }}
                            />
                            <div className="flex gap-2">
                              <label htmlFor={`thumb-${video.id}`}>
                                <Button size="sm" type="button" variant="outline">
                                  <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                              </label>
                              {video.thumbnail_url && (
                                <Button size="sm" type="button" variant="ghost" onClick={() => removeThumbnail(video.id)}>
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {/* Heading */}
                        <div className="grid gap-2">
                          <Label htmlFor={`title-${video.id}`}>Heading</Label>
                          <div className="flex items-center gap-2">
<Input
  id={`title-${video.id}`}
  className="flex-1"
  value={video.title}
  onChange={(e) => setDbVideos(prev => prev.map(v => v.id === video.id ? { ...v, title: e.target.value } : v))}
  placeholder="Enter video heading"
/>
<EmojiPicker onSelect={(e) => setDbVideos(prev => prev.map(v => v.id === video.id ? { ...v, title: (v.title || "") + e } : v))} />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`desc-${video.id}`}>Description</Label>
<Textarea
  id={`desc-${video.id}`}
  value={video.description ?? ""}
  onChange={(e) => setDbVideos(prev => prev.map(v => v.id === video.id ? { ...v, description: e.target.value } : v))}
  placeholder="Add a short description"
/>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2 grid gap-2">
                            <Label htmlFor={`section-${video.id}`}>Section</Label>
                            <Select
                              value={video.section}
                              onValueChange={(val) =>
                                setDbVideos((prev) =>
                                  prev.map((v) => (v.id === video.id ? { ...v, section: val } : v))
                                )
                              }
                            >
                              <SelectTrigger className="flex-1" id={`section-${video.id}`}>
                                <SelectValue placeholder="Select section" />
                              </SelectTrigger>
                              <SelectContent>
                                {sectionOptions.map((name) => (
                                  <SelectItem key={name} value={name}>
                                    {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor={`order-${video.id}`}>Order</Label>
                            <Input
                              id={`order-${video.id}`}
                              type="number"
                              value={video.sort_order ?? 0}
                              onChange={(e) => setDbVideos(prev => prev.map(v => v.id === video.id ? { ...v, sort_order: Number(e.target.value) } : v))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={() => saveVideo(video)} disabled={savingId === video.id}>
                            <Save className="mr-2 h-4 w-4" /> {savingId === video.id ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No videos uploaded yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoManager;
