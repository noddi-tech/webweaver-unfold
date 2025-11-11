import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface DbImage {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
  caption_position?: string;
  title_color_token?: string;
  caption_color_token?: string;
  section: string | null;
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
}

interface ImageEditModalFullProps {
  image: DbImage | null;
  open: boolean;
  onClose: () => void;
  onSave: (image: DbImage) => void;
  onReplace: (imageId: string, file: File | null) => void;
  sections: DbSection[];
}

export const ImageEditModalFull = ({
  image,
  open,
  onClose,
  onSave,
  onReplace,
  sections,
}: ImageEditModalFullProps) => {
  const [editedImage, setEditedImage] = useState<DbImage | null>(image);

  // Update editedImage when image prop changes
  useState(() => {
    setEditedImage(image);
  });

  if (!editedImage) return null;

  const handleSave = () => {
    if (editedImage) {
      onSave(editedImage);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Update image details, metadata, and settings
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="space-y-3 p-4 bg-card/50 rounded-lg border border-border/20">
            <div className="text-xs font-medium text-foreground/70 mb-2">Preview:</div>
            <img 
              src={editedImage.file_url} 
              alt={editedImage.alt ?? editedImage.title} 
              className="w-full h-64 object-cover rounded-md" 
              loading="lazy" 
            />
          </div>

          {/* Replace Image */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Label className="text-xs font-medium text-foreground">Replace Image</Label>
            <Input 
              type="file" 
              accept="image/*" 
              onChange={(e) => onReplace(editedImage.id, e.target.files?.[0] || null)}
              className="text-xs"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Title */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Title</Label>
              <Input 
                value={editedImage.title} 
                onChange={(e) => setEditedImage({ ...editedImage, title: e.target.value })} 
              />
            </div>

            {/* Alt Text */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Alt text</Label>
              <Input 
                value={editedImage.alt ?? ""} 
                onChange={(e) => setEditedImage({ ...editedImage, alt: e.target.value })} 
              />
            </div>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <Label className="text-foreground font-medium">Caption</Label>
            <Textarea 
              value={editedImage.caption ?? ""} 
              onChange={(e) => setEditedImage({ ...editedImage, caption: e.target.value })} 
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Caption Position */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Caption Position</Label>
              <Select 
                value={editedImage.caption_position || 'below'} 
                onValueChange={(v) => setEditedImage({ ...editedImage, caption_position: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Above image</SelectItem>
                  <SelectItem value="below">Below image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title Color */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Title Color</Label>
              <Select 
                value={editedImage.title_color_token || 'foreground'} 
                onValueChange={(v) => setEditedImage({ ...editedImage, title_color_token: v })}
              >
                <SelectTrigger>
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Caption Color */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Caption Color</Label>
              <Select 
                value={editedImage.caption_color_token || 'muted-foreground'} 
                onValueChange={(v) => setEditedImage({ ...editedImage, caption_color_token: v })}
              >
                <SelectTrigger>
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

            {/* Section */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Section</Label>
              <Select 
                value={editedImage.section || 'Library'} 
                onValueChange={(v) => setEditedImage({ ...editedImage, section: v === 'Library' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Library">Library (Unassigned)</SelectItem>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.name}>
                      {s.display_name} ({s.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Link URL */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Link URL</Label>
              <Input
                type="url"
                placeholder="https://example.com"
                value={editedImage.link_url ?? ""}
                onChange={(e) => setEditedImage({ ...editedImage, link_url: e.target.value })}
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Sort order</Label>
              <Input 
                type="number" 
                value={editedImage.sort_order ?? 0} 
                onChange={(e) => setEditedImage({ ...editedImage, sort_order: Number(e.target.value) })} 
              />
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <Label className="text-foreground font-medium">Active Status</Label>
              <p className="text-xs text-muted-foreground">
                Inactive images won't be displayed on the site
              </p>
            </div>
            <Switch 
              checked={editedImage.active} 
              onCheckedChange={(v) => setEditedImage({ ...editedImage, active: v })} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
