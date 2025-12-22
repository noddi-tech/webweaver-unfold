import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Link as LinkIcon, Loader2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageLibraryItem {
  id: string;
  file_url: string;
  title: string;
  alt: string | null;
}

interface ImageFieldEditorProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  storagePath?: string;
  previewHeight?: string;
}

export function ImageFieldEditor({
  label,
  value,
  onChange,
  storagePath = 'stories',
  previewHeight = 'h-32',
}: ImageFieldEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [libraryImages, setLibraryImages] = useState<ImageLibraryItem[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [activeTab, setActiveTab] = useState('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || '');
  }, [value]);

  const loadLibraryImages = async () => {
    if (libraryImages.length > 0) return; // Already loaded
    
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    try {
      // Compress image
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
        quality: 0.85,
      };

      toast.info('Optimizing image...');
      const compressedFile = await imageCompression(file, options);

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast.error('Please log in to upload images');
        setUploading(false);
        return;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${storagePath}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('site-images')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: compressedFile.type,
        });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-images')
        .getPublicUrl(fileName);

      // Add to images table
      await supabase.from('images').insert({
        file_url: publicUrl,
        file_name: fileName.split('/').pop() || fileName,
        title: file.name,
        alt: file.name,
        section: 'Stories',
        active: true,
      });

      onChange(publicUrl);
      toast.success('Image uploaded successfully');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    onChange(urlInput.trim());
    toast.success('Image URL updated');
  };

  const handleLibrarySelect = (imageUrl: string) => {
    onChange(imageUrl);
    toast.success('Image selected from library');
  };

  const handleRemove = () => {
    onChange(null);
    setUrlInput('');
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
        {/* Preview */}
        {value ? (
          <div className="relative mb-3">
            <img 
              src={value} 
              alt={`${label} preview`} 
              className={`w-full ${previewHeight} object-cover rounded-md`}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={handleRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className={`flex items-center justify-center ${previewHeight} bg-muted/50 rounded-md border-2 border-dashed border-border mb-3`}>
            <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}

        {/* Tabs for Upload, Library, URL */}
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v);
          if (v === 'library') loadLibraryImages();
        }}>
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="upload" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="library" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Library
            </TabsTrigger>
            <TabsTrigger value="url" className="text-xs">
              <LinkIcon className="h-3 w-3 mr-1" />
              URL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-3 space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
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
            <p className="text-xs text-muted-foreground text-center">
              Auto-optimized for web
            </p>
          </TabsContent>

          <TabsContent value="library" className="mt-3">
            {loadingLibrary ? (
              <div className="py-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="py-4 text-center text-muted-foreground text-xs">
                No images in library
              </div>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="grid grid-cols-4 gap-2">
                  {libraryImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleLibrarySelect(image.file_url)}
                      className={`relative aspect-square rounded overflow-hidden border-2 transition-all hover:scale-105 ${
                        value === image.file_url
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img
                        src={image.file_url}
                        alt={image.alt || image.title}
                        className="w-full h-full object-cover"
                      />
                      {value === image.file_url && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="url" className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="text-xs flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleUrlSave}
                disabled={!urlInput.trim()}
              >
                Apply
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
