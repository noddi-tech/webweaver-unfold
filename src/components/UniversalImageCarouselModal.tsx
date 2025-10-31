import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Link as LinkIcon, Save, Plus, X, Settings } from 'lucide-react';
import { toast } from 'sonner';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface UniversalImageCarouselModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locationId: string;
  onSave: () => void;
}

export function UniversalImageCarouselModal({
  open,
  onOpenChange,
  locationId,
  onSave,
}: UniversalImageCarouselModalProps) {
  const [displayType, setDisplayType] = useState<'image' | 'carousel'>('image');
  const [imageSource, setImageSource] = useState<'library' | 'upload' | 'url'>('library');
  const [carouselSource, setCarouselSource] = useState<'saved' | 'new'>('new');
  
  // Image settings
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  
  // Carousel settings
  const [selectedCarouselId, setSelectedCarouselId] = useState<string>('');
  const [carouselName, setCarouselName] = useState('');
  const [carouselDescription, setCarouselDescription] = useState('');
  const [carouselAutoplay, setCarouselAutoplay] = useState(true);
  const [carouselAutoplayDelay, setCarouselAutoplayDelay] = useState(3500);
  const [carouselShowNavigation, setCarouselShowNavigation] = useState(true);
  const [carouselShowDots, setCarouselShowDots] = useState(true);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  
  // Data
  const [libraryImages, setLibraryImages] = useState<any[]>([]);
  const [savedCarousels, setSavedCarousels] = useState<CarouselConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, locationId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load existing settings
      const { data: settings } = await supabase
        .from('image_carousel_settings')
        .select('*')
        .eq('location_id', locationId)
        .maybeSingle();

      if (settings) {
        setDisplayType(settings.display_type as 'image' | 'carousel');
        
        if (settings.display_type === 'image') {
          setImageUrl(settings.image_url || '');
          setImageAlt(settings.image_alt || '');
        } else if (settings.carousel_config_id) {
          setSelectedCarouselId(settings.carousel_config_id);
          await loadCarouselConfig(settings.carousel_config_id);
        }
      }

      // Load image library
      const { data: images } = await supabase
        .from('images')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });
      setLibraryImages(images || []);

      // Load saved carousels
      const { data: carousels } = await supabase
        .from('carousel_configs')
        .select('*')
        .order('name');
      setSavedCarousels((carousels || []).map(c => ({
        ...c,
        images: Array.isArray(c.images) ? c.images as unknown as CarouselImage[] : []
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadCarouselConfig = async (configId: string) => {
    const { data } = await supabase
      .from('carousel_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (data) {
      setCarouselName(data.name);
      setCarouselDescription(data.description || '');
      setCarouselAutoplay(data.autoplay);
      setCarouselAutoplayDelay(data.autoplay_delay);
      setCarouselShowNavigation(data.show_navigation);
      setCarouselShowDots(data.show_dots);
      setCarouselImages(Array.isArray(data.images) ? data.images as unknown as CarouselImage[] : []);
    }
  };

  const handleImageUpload = async () => {
    if (!uploadFile) return null;

    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(filePath, uploadFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('site-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSaveCarouselConfig = async () => {
    if (!carouselName.trim()) {
      toast.error('Please enter a carousel name');
      return null;
    }

    const configData = {
      name: carouselName,
      description: carouselDescription,
      autoplay: carouselAutoplay,
      autoplay_delay: carouselAutoplayDelay,
      show_navigation: carouselShowNavigation,
      show_dots: carouselShowDots,
      images: JSON.parse(JSON.stringify(carouselImages)),
    };

    if (selectedCarouselId && carouselSource === 'saved') {
      // Update existing
      const { data, error } = await supabase
        .from('carousel_configs')
        .update(configData)
        .eq('id', selectedCarouselId)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('carousel_configs')
        .insert([configData])
        .select()
        .single();

      if (error) throw error;
      return data.id;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = imageUrl;
      let carouselConfigId = null;

      if (displayType === 'image') {
        if (imageSource === 'upload' && uploadFile) {
          finalImageUrl = await handleImageUpload() || '';
        }
      } else {
        carouselConfigId = await handleSaveCarouselConfig();
      }

      // Save or update settings
      const settingsData = {
        location_id: locationId,
        display_type: displayType,
        image_url: displayType === 'image' ? finalImageUrl : null,
        image_alt: displayType === 'image' ? imageAlt : null,
        carousel_config_id: displayType === 'carousel' ? carouselConfigId : null,
        saved_image_url: displayType === 'carousel' ? finalImageUrl : null,
        saved_image_alt: displayType === 'carousel' ? imageAlt : null,
        saved_carousel_config_id: displayType === 'image' ? carouselConfigId : null,
      };

      const { error } = await supabase
        .from('image_carousel_settings')
        .upsert(settingsData, { onConflict: 'location_id' });

      if (error) throw error;

      toast.success('Settings saved successfully');
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addCarouselImage = () => {
    setCarouselImages([...carouselImages, { url: '', alt: '' }]);
  };

  const updateCarouselImage = (index: number, field: keyof CarouselImage, value: string) => {
    const updated = [...carouselImages];
    updated[index] = { ...updated[index], [field]: value };
    setCarouselImages(updated);
  };

  const removeCarouselImage = (index: number) => {
    setCarouselImages(carouselImages.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Edit Image / Carousel
          </DialogTitle>
          <DialogDescription>
            Configure a single image or a carousel for this location
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Display Type Selection */}
            <div className="space-y-2">
              <Label>Display Type</Label>
              <RadioGroup value={displayType} onValueChange={(v) => setDisplayType(v as any)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image">Single Image</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="carousel" id="carousel" />
                  <Label htmlFor="carousel">Carousel</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Image Configuration */}
            {displayType === 'image' && (
              <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="library">Library</TabsTrigger>
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {libraryImages.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => {
                          setImageUrl(img.file_url);
                          setImageAlt(img.alt || '');
                        }}
                        className={`border rounded-lg p-2 hover:border-primary transition ${
                          imageUrl === img.file_url ? 'border-primary' : ''
                        }`}
                      >
                        <img src={img.file_url} alt={img.alt} className="w-full h-24 object-cover rounded" />
                        <p className="text-xs mt-1 truncate">{img.title}</p>
                      </button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Upload Image</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {displayType === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Input
                  id="alt-text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Descriptive alt text"
                />
              </div>
            )}

            {/* Carousel Configuration */}
            {displayType === 'carousel' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Carousel Source</Label>
                  <RadioGroup value={carouselSource} onValueChange={(v) => setCarouselSource(v as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="saved" id="saved" />
                      <Label htmlFor="saved">Use Saved Carousel</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new">Create New Carousel</Label>
                    </div>
                  </RadioGroup>
                </div>

                {carouselSource === 'saved' && (
                  <div className="space-y-2">
                    <Label htmlFor="saved-carousel">Select Carousel</Label>
                    <Select value={selectedCarouselId} onValueChange={(v) => { setSelectedCarouselId(v); loadCarouselConfig(v); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a saved carousel" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedCarousels.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="carousel-name">Carousel Name</Label>
                  <Input
                    id="carousel-name"
                    value={carouselName}
                    onChange={(e) => setCarouselName(e.target.value)}
                    placeholder="My Carousel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carousel-desc">Description (Optional)</Label>
                  <Textarea
                    id="carousel-desc"
                    value={carouselDescription}
                    onChange={(e) => setCarouselDescription(e.target.value)}
                    placeholder="Brief description"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoplay">Autoplay</Label>
                    <Switch id="autoplay" checked={carouselAutoplay} onCheckedChange={setCarouselAutoplay} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="nav">Show Navigation</Label>
                    <Switch id="nav" checked={carouselShowNavigation} onCheckedChange={setCarouselShowNavigation} />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="dots">Show Dots</Label>
                    <Switch id="dots" checked={carouselShowDots} onCheckedChange={setCarouselShowDots} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="delay">Autoplay Delay (ms)</Label>
                    <Input
                      id="delay"
                      type="number"
                      value={carouselAutoplayDelay}
                      onChange={(e) => setCarouselAutoplayDelay(parseInt(e.target.value))}
                      min={1000}
                      step={500}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Carousel Images</Label>
                    <Button type="button" size="sm" onClick={addCarouselImage}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </div>

                  {carouselImages.map((img, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Image {index + 1}</Label>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeCarouselImage(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Image URL"
                        value={img.url}
                        onChange={(e) => updateCarouselImage(index, 'url', e.target.value)}
                      />
                      <Input
                        placeholder="Alt text"
                        value={img.alt}
                        onChange={(e) => updateCarouselImage(index, 'alt', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
