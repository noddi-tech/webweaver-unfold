import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Link as LinkIcon, Save, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUrl: string;
  onSave: (newUrl: string) => void;
  altText?: string;
}

interface ImageLibraryItem {
  id: string;
  file_url: string;
  title: string;
  alt: string | null;
}

export function ImageEditModal({
  open,
  onOpenChange,
  currentUrl,
  onSave,
  altText,
}: ImageEditModalProps) {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [libraryImages, setLibraryImages] = useState<ImageLibraryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{
    width: number;
    height: number;
    originalSize: number;
    compressedSize?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrlInput(currentUrl);
      loadLibraryImages();
    }
  }, [open, currentUrl]);

  const loadLibraryImages = async () => {
    setLoadingLibrary(true);
    try {
      const { data, error } = await supabase
        .from('images')
        .select('id, file_url, title, alt')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLibraryImages(data || []);
    } catch (error) {
      console.error('Error loading library images:', error);
      toast.error('Failed to load image library');
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      // Get image dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const originalSize = file.size;
      setImageInfo({
        width: img.width,
        height: img.height,
        originalSize,
      });

      URL.revokeObjectURL(objectUrl);

      // Compress image for optimal quality/size balance
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560, // 2x for Retina displays
        useWebWorker: true,
        quality: img.width > 1920 ? 0.85 : 0.90, // Lower quality for very large images
      };

      toast.info('Optimizing image...');
      const compressedFile = await imageCompression(file, options);
      
      const compressionRatio = ((1 - compressedFile.size / originalSize) * 100).toFixed(0);
      setImageInfo(prev => prev ? { ...prev, compressedSize: compressedFile.size } : null);

      if (compressionRatio !== '0') {
        toast.success(`Image optimized: ${compressionRatio}% smaller`);
      }

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth check error:', authError);
        toast.error('Authentication error. Please log in again.');
        setUploading(false);
        return;
      }
      
      if (!user) {
        toast.error('Please log in to the CMS (/cms-login) to upload images');
        setUploading(false);
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `solutions/${fileName}`;

      // Upload compressed file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: compressedFile.type,
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        toast.error(`Upload failed: ${uploadError.message || 'Unknown error'}`);
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(filePath);

      // Add to images table
      await supabase.from('images').insert({
        file_url: publicUrl,
        file_name: fileName,
        title: file.name,
        alt: altText || file.name,
        section: 'Solutions',
        active: true,
      });

      onSave(publicUrl);
      toast.success('Image uploaded successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSave = () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    onSave(urlInput);
    toast.success('Image URL updated');
    onOpenChange(false);
  };

  const handleLibrarySelect = () => {
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }

    onSave(selectedImage);
    toast.success('Image updated from library');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Edit Image
          </DialogTitle>
          <DialogDescription>
            Upload a new image, select from library, or enter a URL
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library">
              <ImageIcon className="h-4 w-4 mr-2" />
              Library
            </TabsTrigger>
            <TabsTrigger value="url">
              <LinkIcon className="h-4 w-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="lg"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Maximum file size: 5MB
              </p>
            </div>
            
            {currentUrl && (
              <div className="space-y-2">
                <Label>Current Image</Label>
                <img 
                  src={currentUrl} 
                  alt="Current" 
                  className="w-full max-h-48 object-contain rounded-lg border"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="library" className="space-y-4">
            {loadingLibrary ? (
              <div className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No images in library. Upload an image first.
              </div>
            ) : (
              <>
                <ScrollArea className="h-[400px] w-full">
                  <div className="grid grid-cols-3 gap-4 p-1">
                    {libraryImages.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(image.file_url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          selectedImage === image.file_url
                            ? 'border-primary ring-2 ring-primary'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.file_url}
                          alt={image.alt || image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 truncate">
                          {image.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <Button 
                  onClick={handleLibrarySelect} 
                  disabled={!selectedImage}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Use Selected Image
                </Button>
              </>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {urlInput && (
              <div className="space-y-2">
                <Label>Preview</Label>
                <img 
                  src={urlInput} 
                  alt="Preview" 
                  className="w-full max-h-48 object-contain rounded-lg border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            <Button onClick={handleUrlSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Save URL
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
