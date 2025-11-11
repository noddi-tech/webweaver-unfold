import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Copy, Trash2, Play, Navigation, Circle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CarouselImage {
  url: string;
  alt: string;
  title?: string;
}

interface CarouselConfig {
  id: string;
  name: string;
  description?: string;
  autoplay: boolean;
  autoplay_delay: number;
  show_navigation: boolean;
  show_dots: boolean;
  images: CarouselImage[];
}

interface CarouselCardProps {
  carousel: CarouselConfig;
  onEdit: (carousel: CarouselConfig) => void;
  onDuplicate: (carousel: CarouselConfig) => void;
  onDelete: (carouselId: string) => void;
}

export function CarouselCard({
  carousel,
  onEdit,
  onDuplicate,
  onDelete,
}: CarouselCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const imageCount = carousel.images?.length || 0;
  const firstImage = carousel.images?.[0];

  return (
    <>
      <Card className="overflow-hidden bg-card border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-0">
          {/* Image Preview */}
          <div className="relative w-full h-48 bg-muted/30">
            {firstImage ? (
              <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-1">
                {carousel.images.slice(0, 4).map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover rounded"
                  />
                ))}
                {imageCount > 4 && (
                  <div className="absolute bottom-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-foreground">
                    +{imageCount - 4} more
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No images</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground text-lg mb-1 truncate">
                {carousel.name}
              </h3>
              {carousel.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {carousel.description}
                </p>
              )}
            </div>

            {/* Settings Indicators */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {imageCount} {imageCount === 1 ? 'image' : 'images'}
              </Badge>
              {carousel.autoplay && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 text-foreground border-foreground/20">
                  <Play className="h-3 w-3" />
                  Auto
                </Badge>
              )}
              {carousel.show_navigation && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 text-foreground border-foreground/20">
                  <Navigation className="h-3 w-3" />
                  Nav
                </Badge>
              )}
              {carousel.show_dots && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 text-foreground border-foreground/20">
                  <Circle className="h-3 w-3" />
                  Dots
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(carousel)}
                className="flex-1 text-foreground"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDuplicate(carousel)}
                className="text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Carousel?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{carousel.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(carousel.id);
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
