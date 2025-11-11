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
  locationId?: string;
  onSave: () => void;
  mode?: 'location' | 'standalone';
  carouselId?: string;
}

export function UniversalImageCarouselModal({
  open,
  onOpenChange,
  locationId = '',
  onSave,
  mode = 'location',
  carouselId,
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
  const [aspectRatio, setAspectRatio] = useState<string>('auto');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  
  // Data
  const [libraryImages, setLibraryImages] = useState<any[]>([]);
  const [savedCarousels, setSavedCarousels] = useState<CarouselConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Batch selection for carousel images
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, locationId, carouselId, mode]);

  const loadData = async () => {
    setLoading(true);
    try {
      // In standalone mode, load carousel directly
      if (mode === 'standalone' && carouselId) {
        await loadCarouselConfig(carouselId);
        setSelectedCarouselId(carouselId);
        setDisplayType('carousel');
        setCarouselSource('saved');
      } else if (mode === 'location' && locationId) {
        // Load existing settings for location mode
        const { data: settings } = await supabase
          .from('image_carousel_settings')
          .select('*')
          .eq('location_id', locationId)
          .maybeSingle();

        if (settings) {
          setDisplayType(settings.display_type as 'image' | 'carousel');
          setAspectRatio(settings.aspect_ratio || 'auto');
          setFitMode((settings.fit_mode as 'contain' | 'cover') || 'contain');
          
          if (settings.display_type === 'image') {
            setImageUrl(settings.image_url || '');
            setImageAlt(settings.image_alt || '');
          } else if (settings.carousel_config_id) {
            setSelectedCarouselId(settings.carousel_config_id);
            await loadCarouselConfig(settings.carousel_config_id);
          }
        }
      } else if (mode === 'standalone') {
        // New carousel in standalone mode
        setDisplayType('carousel');
        setCarouselSource('new');
        setCarouselImages([]);
        setCarouselName('');
        setCarouselDescription('');
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

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to upload images');
      throw new Error('Authentication required for image upload');
    }

    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('site-images')
      .upload(filePath, uploadFile);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error(`Upload failed: ${uploadError.message}`);
      throw uploadError;
    }

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
      name: mode === 'standalone' && !carouselId ? carouselName : carouselName,
      description: carouselDescription,
      autoplay: carouselAutoplay,
      autoplay_delay: carouselAutoplayDelay,
      show_navigation: carouselShowNavigation,
      show_dots: carouselShowDots,
      images: JSON.parse(JSON.stringify(carouselImages)),
    };

    if (mode === 'standalone' && carouselId) {
      // Update existing in standalone mode
      const { data, error } = await supabase
        .from('carousel_configs')
        .update(configData)
        .eq('id', carouselId)
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } else if (selectedCarouselId && carouselSource === 'saved' && mode === 'location') {
      // Update existing in location mode
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

      if (mode === 'standalone') {
        // Standalone mode: only save carousel config
        carouselConfigId = await handleSaveCarouselConfig();
        toast.success(carouselId ? 'Carousel updated successfully' : 'Carousel created successfully');
        onSave();
        onOpenChange(false);
      } else {
        // Location mode: save both carousel and location settings
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
          aspect_ratio: aspectRatio,
          fit_mode: fitMode,
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
      }
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

  // Batch image selector component
  const BatchImageSelector = () => {
    const toggleImageSelection = (imageId: string) => {
      const newSelected = new Set(selectedImageIds);
      if (newSelected.has(imageId)) {
        newSelected.delete(imageId);
      } else {
        newSelected.add(imageId);
      }
      setSelectedImageIds(newSelected);
    };
    
    const selectAll = () => {
      setSelectedImageIds(new Set(libraryImages.map(img => img.id)));
    };
    
    const clearSelection = () => {
      setSelectedImageIds(new Set());
    };
    
    const addSelectedToCarousel = () => {
      const selectedImages = libraryImages.filter(img => selectedImageIds.has(img.id));
      const newCarouselImages = selectedImages.map(img => ({
        url: img.file_url,
        alt: img.alt || '',
        title: img.title || ''
      }));
      
      setCarouselImages([...carouselImages, ...newCarouselImages]);
      setSelectedImageIds(new Set());
      setBatchSelectionMode(false);
      toast.success(`Added ${selectedImages.length} images to carousel`);
    };
    
    return (
      <div className="border rounded-lg p-4 bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Select Multiple Images</h3>
            <p className="text-sm text-foreground/70">
              Choose images from your library to add to the carousel
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setBatchSelectionMode(false);
              setSelectedImageIds(new Set());
            }}
          >
            Cancel
          </Button>
        </div>
        
        {/* Selection Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={selectAll}
            disabled={libraryImages.length === 0}
          >
            Select All ({libraryImages.length})
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSelection}
            disabled={selectedImageIds.size === 0}
          >
            Clear
          </Button>
          <div className="ml-auto text-sm font-medium text-foreground">
            {selectedImageIds.size} selected
          </div>
        </div>
        
        {/* Image Grid with Checkboxes */}
        <div className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
          {libraryImages.length === 0 ? (
            <p className="text-sm text-foreground/70 text-center py-8">
              No images in library. Upload images in the Image Manager first.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {libraryImages.map((img) => {
                const isSelected = selectedImageIds.has(img.id);
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => toggleImageSelection(img.id)}
                    className={`relative border-2 rounded-lg p-2 transition ${
                      isSelected 
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Checkbox Overlay */}
                    <div className={`absolute top-1 right-1 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                      isSelected 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-border'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    
                    <img 
                      src={img.file_url} 
                      alt={img.alt} 
                      className="w-full h-20 object-cover rounded mb-1" 
                    />
                    <p className="text-xs truncate text-foreground">{img.title}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={addSelectedToCarousel}
            disabled={selectedImageIds.size === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add {selectedImageIds.size} Image{selectedImageIds.size !== 1 ? 's' : ''} to Carousel
          </Button>
        </div>
      </div>
    );
  };

  // Image picker component for carousel images
  const CarouselImagePicker = ({
    index, 
    currentUrl 
  }: { 
    index: number; 
    currentUrl: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const handleSelectImage = (imageUrl: string, imageAlt: string) => {
      updateCarouselImage(index, 'url', imageUrl);
      updateCarouselImage(index, 'alt', imageAlt);
      setIsOpen(false);
    };
    
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            {currentUrl ? 'Change Image' : 'Select from Library'}
          </Button>
          {currentUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => updateCarouselImage(index, 'url', '')}
              title="Clear image"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {isOpen && (
          <div className="border rounded-lg p-4 bg-muted/30 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-3 gap-3">
              {libraryImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleSelectImage(img.file_url, img.alt || '')}
                  className={`border-2 rounded-lg p-2 hover:border-primary transition ${
                    currentUrl === img.file_url ? 'border-primary bg-primary/10' : 'border-border'
                  }`}
                >
                  <img 
                    src={img.file_url} 
                    alt={img.alt} 
                    className="w-full h-20 object-cover rounded mb-1" 
                  />
                  <p className="text-xs truncate">{img.title}</p>
                </button>
              ))}
            </div>
            
            {libraryImages.length === 0 && (
              <p className="text-sm text-foreground/70 text-center py-4">
                No images in library. Upload images in the Image Manager first.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {mode === 'standalone' 
              ? (carouselId ? 'Edit Carousel' : 'Create Carousel')
              : 'Edit Image / Carousel'
            }
          </DialogTitle>
          <DialogDescription>
            {mode === 'standalone'
              ? 'Configure your carousel settings and images'
              : 'Configure a single image or a carousel for this location'
            }
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Display Type Selection - only show in location mode */}
            {mode === 'location' && (
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
            )}

            {/* Image Configuration - only show in location mode */}
            {mode === 'location' && displayType === 'image' && (
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

            {/* Carousel Configuration - always show in standalone, only when selected in location */}
            {(mode === 'standalone' || displayType === 'carousel') && (
              <div className="space-y-6">
                {mode === 'location' && (
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
                )}

                {mode === 'location' && carouselSource === 'saved' && (
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

                {(mode === 'standalone' || carouselSource === 'new') && (
                  <>
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
                    <div className="flex items-center gap-2">
                      <Button type="button" size="sm" onClick={addCarouselImage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Single Image
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => setBatchSelectionMode(!batchSelectionMode)}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {batchSelectionMode ? 'Hide' : 'Add Multiple from Library'}
                      </Button>
                    </div>
                  </div>

                  {/* Batch Selection Mode */}
                  {batchSelectionMode && <BatchImageSelector />}

                  {/* Divider when both sections visible */}
                  {batchSelectionMode && carouselImages.length > 0 && (
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Current Images</span>
                      </div>
                    </div>
                  )}

                  {carouselImages.map((img, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-card">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">Image {index + 1}</Label>
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => removeCarouselImage(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Image Preview */}
                      {img.url && (
                        <div className="relative rounded-lg overflow-hidden border bg-muted/30">
                          <img 
                            src={img.url} 
                            alt={img.alt || `Preview ${index + 1}`} 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Image Picker */}
                      <CarouselImagePicker index={index} currentUrl={img.url} />
                      
                      {/* Manual URL Input (collapsible) */}
                      <details className="group">
                        <summary className="cursor-pointer text-sm text-foreground hover:text-primary transition list-none">
                          <div className="flex items-center gap-2">
                            <LinkIcon className="h-3 w-3" />
                            <span>Or enter URL manually</span>
                            <span className="ml-auto group-open:rotate-180 transition-transform">▼</span>
                          </div>
                        </summary>
                        <div className="mt-2 space-y-2">
                          <Input
                            placeholder="https://example.com/image.jpg"
                            value={img.url}
                            onChange={(e) => updateCarouselImage(index, 'url', e.target.value)}
                          />
                        </div>
                      </details>
                      
                      {/* Alt Text */}
                      <div className="space-y-2">
                        <Label htmlFor={`alt-${index}`} className="text-sm font-medium text-foreground">Alt Text</Label>
                        <Input
                          id={`alt-${index}`}
                          placeholder="Descriptive text for accessibility"
                          value={img.alt}
                          onChange={(e) => updateCarouselImage(index, 'alt', e.target.value)}
                        />
                      </div>
                      
                      {/* Optional Title */}
                      <div className="space-y-2">
                        <Label htmlFor={`title-${index}`} className="text-sm text-foreground/80">
                          Title (Optional)
                        </Label>
                        <Input
                          id={`title-${index}`}
                          placeholder="Image caption or title"
                          value={img.title || ''}
                          onChange={(e) => updateCarouselImage(index, 'title', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                  </>
                )}
              </div>
            )}

            {/* Aspect Ratio Configuration - only in location mode */}
            {mode === 'location' && (
              <>
                <div className="space-y-3 border-t pt-4">
                  <Label>Container Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">🔍 Auto-detect from image</SelectItem>
                      <SelectItem value="9:16">📱 Phone Portrait (9:16)</SelectItem>
                      <SelectItem value="10:16">📱 Tablet Portrait (10:16)</SelectItem>
                      <SelectItem value="3:4">🖼️ Portrait (3:4)</SelectItem>
                      <SelectItem value="1:1">⬛ Square (1:1)</SelectItem>
                      <SelectItem value="4:3">🖥️ Classic (4:3)</SelectItem>
                      <SelectItem value="16:10">💻 Desktop (16:10)</SelectItem>
                      <SelectItem value="16:9">🖥️ Widescreen (16:9)</SelectItem>
                      <SelectItem value="21:9">🖥️ Ultrawide (21:9)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {aspectRatio === 'auto' 
                      ? 'Container will adapt to the image dimensions (default: 400-500px min-height)'
                      : `Container will use ${aspectRatio} aspect ratio - perfect for ${
                        aspectRatio === '9:16' ? 'phone screenshots (430x932)' :
                        aspectRatio === '10:16' ? 'tablet screenshots' :
                        aspectRatio === '16:10' || aspectRatio === '16:9' ? 'desktop screenshots' :
                        aspectRatio === '1:1' ? 'square images' :
                        'various image formats'
                      }`}
                  </p>
                </div>

                {/* Image Fit Mode */}
                <div className="space-y-3 border-t pt-4">
                  <Label>Image Fit Mode</Label>
                  <Select value={fitMode} onValueChange={(value: 'contain' | 'cover') => setFitMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 border border-border rounded flex items-center justify-center">
                            <div className="w-4 h-5 border border-primary"></div>
                          </div>
                          <span>Contain - Show full image</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cover">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-6 border border-border rounded overflow-hidden bg-primary/20">
                            <div className="w-12 h-8 border-2 border-primary -m-2"></div>
                          </div>
                          <span>Cover - Fill container</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {fitMode === 'contain' 
                      ? '✨ Best for phone screenshots - shows full image without cropping'
                      : '�16️ Best for desktop screenshots - fills the space'}
                  </p>
                </div>
              </>
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
