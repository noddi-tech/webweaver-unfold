import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface DbImage {
  id: string;
  title: string;
  alt: string | null;
  caption: string | null;
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

interface ImageLibraryViewProps {
  images: DbImage[];
  sections: DbSection[];
  selectedImages: Set<string>;
  onToggleSelect: (imageId: string) => void;
  onEditImage: (image: DbImage) => void;
  onDeleteImage: (image: DbImage) => void;
}

export const ImageLibraryView = ({
  images,
  sections,
  selectedImages,
  onToggleSelect,
  onEditImage,
  onDeleteImage,
}: ImageLibraryViewProps) => {
  const getSectionDisplayName = (sectionName: string | null) => {
    if (!sectionName || sectionName === 'Library') return 'Library';
    const section = sections.find(s => s.name === sectionName);
    return section ? section.display_name : sectionName;
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No images found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead className="w-[100px]">Preview</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>File Name</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.map((image) => (
            <TableRow key={image.id} className={selectedImages.has(image.id) ? "bg-muted/50" : ""}>
              <TableCell>
                <Checkbox
                  checked={selectedImages.has(image.id)}
                  onCheckedChange={() => onToggleSelect(image.id)}
                />
              </TableCell>
              <TableCell>
                <img
                  src={image.file_url}
                  alt={image.alt || image.title}
                  className="w-16 h-16 object-cover rounded border border-border"
                />
              </TableCell>
              <TableCell className="font-medium">
                <div className="space-y-1">
                  <div className="text-foreground">{image.title}</div>
                  {image.alt && (
                    <div className="text-xs text-muted-foreground">Alt: {image.alt}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {getSectionDisplayName(image.section)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={image.active ? "default" : "secondary"}>
                  {image.active ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {image.file_name}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(image.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {image.link_url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(image.link_url!, '_blank')}
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEditImage(image)}
                    title="Edit image"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteImage(image)}
                    title="Delete image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
