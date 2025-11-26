import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Image as ImageIcon, Upload, Link as LinkIcon, Save, Plus, X, Settings, Info, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { detectImageAspectRatio } from '@/utils/imageAspectRatio';
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
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
  const [aspectRatio, setAspectRatio] = useState<string>('auto');
  const [objectPosition, setObjectPosition] = useState<'top' | 'center' | 'bottom'>('center');
  
  // Data
  const [libraryImages, setLibraryImages] = useState<any[]>([]);
  const [savedCarousels, setSavedCarousels] = useState<CarouselConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Batch selection for carousel images
  const [batchSelectionMode, setBatchSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  
  // Draft saving & error recovery
  const [lastSaveAttempt, setLastSaveAttempt] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string>('');

  // Save draft to localStorage whenever images change
  useEffect(() => {
    if (carouselImages.length > 0 && carouselName) {
      const draft = {
        name: carouselName,
        description: carouselDescription,
        images: carouselImages,
        autoplay: carouselAutoplay,
        autoplay_delay: carouselAutoplayDelay,
        show_navigation: carouselShowNavigation,
        show_dots: carouselShowDots,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('carousel_draft', JSON.stringify(draft));
      console.log('💾 Draft saved to localStorage:', { name: carouselName, imageCount: carouselImages.length });
    }
  }, [carouselImages, carouselName, carouselDescription, carouselAutoplay, carouselAutoplayDelay, carouselShowNavigation, carouselShowDots]);

  // Restore draft on mount if available
  useEffect(() => {
    if (open && mode === 'standalone' && !carouselId) {
      const draftStr = localStorage.getItem('carousel_draft');
      if (draftStr) {
        try {
          const draft = JSON.parse(draftStr);
          const draftAge = Date.now() - new Date(draft.timestamp).getTime();
          // Only restore if less than 1 hour old
          if (draftAge < 3600000) {
            setCarouselName(draft.name || '');
            setCarouselDescription(draft.description || '');
            setCarouselImages(draft.images || []);
            setCarouselAutoplay(draft.autoplay ?? true);
            setCarouselAutoplayDelay(draft.autoplay_delay ?? 3500);
            setCarouselShowNavigation(draft.show_navigation ?? true);
            setCarouselShowDots(draft.show_dots ?? true);
            toast.info(`Restored draft with ${draft.images?.length || 0} images`);
            console.log('📂 Draft restored from localStorage');
          }
        } catch (e) {
          console.error('Failed to restore draft:', e);
        }
      }
    }
  }, [open, mode, carouselId]);

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
          setFitMode((settings.fit_mode as 'contain' | 'cover') || 'contain');
          setAspectRatio(settings.aspect_ratio || 'auto');
          setObjectPosition((settings.object_position as 'top' | 'center' | 'bottom') || 'center');
          
          if (settings.display_type === 'image') {
            setImageUrl(settings.image_url || '');
            setImageAlt(settings.image_alt || '');
          } else if (settings.carousel_config_id) {
            setSelectedCarouselId(settings.carousel_config_id);
            setCarouselSource('saved'); // Set source so updates work correctly
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
    console.log('🔍 Pre-save validation:', { 
      name: carouselName, 
      imageCount: carouselImages.length,
      mode,
      carouselId,
      selectedCarouselId,
      carouselSource,
      images: carouselImages.map(img => ({ url: img.url.substring(0, 50), alt: img.alt }))
    });

    if (!carouselName.trim()) {
      const error = 'Please enter a carousel name';
      toast.error(error);
      setSaveError(error);
      return null;
    }

    if (carouselImages.length === 0) {
      const error = 'Please add at least one image to the carousel';
      toast.error(error);
      setSaveError(error);
      console.error('❌ Save failed: No images in carousel');
      return null;
    }

    const configData = {
      name: carouselName.trim(),
      description: carouselDescription,
      autoplay: carouselAutoplay,
      autoplay_delay: carouselAutoplayDelay,
      show_navigation: carouselShowNavigation,
      show_dots: carouselShowDots,
      images: JSON.parse(JSON.stringify(carouselImages)),
    };

    console.log('💾 Saving carousel config with data:', configData);
    setLastSaveAttempt(new Date());

    try {
      if (mode === 'standalone' && carouselId) {
        // Update existing in standalone mode
        console.log('📝 Updating existing carousel in standalone mode:', carouselId);
        const { data, error } = await supabase
          .from('carousel_configs')
          .update(configData)
          .eq('id', carouselId)
          .select()
          .single();

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Carousel updated successfully:', data);
        localStorage.removeItem('carousel_draft');
        return data.id;
      } else if (selectedCarouselId && carouselSource === 'saved' && mode === 'location') {
        // Update existing in location mode
        console.log('📝 Updating existing carousel in location mode:', selectedCarouselId);
        const { data, error } = await supabase
          .from('carousel_configs')
          .update(configData)
          .eq('id', selectedCarouselId)
          .select()
          .single();

        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Carousel updated successfully:', data);
        localStorage.removeItem('carousel_draft');
        return data.id;
      } else {
        // Create new
        console.log('🆕 Creating new carousel');
        const { data, error } = await supabase
          .from('carousel_configs')
          .insert([configData])
          .select()
          .single();

        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        console.log('✅ Carousel created successfully:', data);
        localStorage.removeItem('carousel_draft');
        return data.id;
      }
    } catch (error: any) {
      const errorMessage = `Database error: ${error?.message || 'Unknown error'}`;
      setSaveError(errorMessage);
      console.error('❌ Save failed with error:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    console.log('💾 Save initiated');
    setSaving(true);
    setSaveError('');
    
    try {
      let finalImageUrl = imageUrl;
      let carouselConfigId = null;

      if (mode === 'standalone') {
        // Standalone mode: only save carousel config
        carouselConfigId = await handleSaveCarouselConfig();
        if (!carouselConfigId) {
          console.error('❌ Save aborted: handleSaveCarouselConfig returned null');
          return;
        }
        toast.success(carouselId ? '✅ Carousel updated successfully' : '✅ Carousel created successfully');
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
          if (!carouselConfigId) {
            console.error('❌ Save aborted: handleSaveCarouselConfig returned null');
            return;
          }
        }

        // Save or update settings
        const settingsData = {
          location_id: locationId,
          display_type: displayType,
          fit_mode: fitMode,
          aspect_ratio: aspectRatio,
          object_position: objectPosition,
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

        if (error) {
          console.error('❌ Settings save error:', error);
          throw error;
        }

        toast.success('✅ Settings saved successfully');
        onSave();
        onOpenChange(false);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Unknown error occurred';
      console.error('❌ Save failed:', error);
      setSaveError(`Save failed: ${errorMsg}`);
      toast.error(`Failed to save: ${errorMsg}. Your work is saved as a draft.`);
    } finally {
      setSaving(false);
    }
  };

  // Export carousel configuration
  const handleExportConfig = () => {
    const exportData = {
      name: carouselName,
      description: carouselDescription,
      autoplay: carouselAutoplay,
      autoplay_delay: carouselAutoplayDelay,
      show_navigation: carouselShowNavigation,
      show_dots: carouselShowDots,
      images: carouselImages,
      exported_at: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carousel-${carouselName.replace(/\s+/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Carousel exported successfully');
  };

  // Import carousel configuration
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setCarouselName(imported.name || '');
        setCarouselDescription(imported.description || '');
        setCarouselAutoplay(imported.autoplay ?? true);
        setCarouselAutoplayDelay(imported.autoplay_delay ?? 3500);
        setCarouselShowNavigation(imported.show_navigation ?? true);
        setCarouselShowDots(imported.show_dots ?? true);
        setCarouselImages(imported.images || []);
        toast.success(`Imported "${imported.name}" with ${imported.images?.length || 0} images`);
        console.log('📥 Configuration imported successfully');
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import configuration');
      }
    };
    reader.readAsText(file);
  };

  const addCarouselImage = () => {
    const newImages = [...carouselImages, { url: '', alt: '' }];
    setCarouselImages(newImages);
    console.log('➕ Image slot added, total:', newImages.length);
  };

  const updateCarouselImage = (index: number, field: keyof CarouselImage, value: string) => {
    const updated = [...carouselImages];
    updated[index] = { ...updated[index], [field]: value };
    setCarouselImages(updated);
    console.log(`✏️ Image ${index} updated (${field}):`, value.substring(0, 50));
  };

  const removeCarouselImage = (index: number) => {
    const newImages = carouselImages.filter((_, i) => i !== index);
    setCarouselImages(newImages);
    console.log('🗑️ Image removed, remaining:', newImages.length);
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
      
      const updatedImages = [...carouselImages, ...newCarouselImages];
      setCarouselImages(updatedImages);
      console.log(`📸 Batch add: ${selectedImages.length} images added, total now: ${updatedImages.length}`);
      setSelectedImageIds(new Set());
      setBatchSelectionMode(false);
      toast.success(`Added ${selectedImages.length} images to carousel (Total: ${updatedImages.length})`);
    };
    
    return (
      <div className="border rounded-lg p-4 bg-background space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">Select Multiple Images</h3>
            <p className="text-sm text-muted-foreground">
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
                    <div key={index} className="border rounded-lg p-4 space-y-3 bg-background">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-foreground">Image {index + 1}</Label>
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

            {/* Fit Mode Selection */}
            <div className="space-y-3 border-t pt-4">
              <Label>Image Fit Mode</Label>
              <RadioGroup value={fitMode} onValueChange={(value: 'contain' | 'cover') => setFitMode(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="contain" id="contain" />
                  <Label htmlFor="contain" className="font-normal">Contain (fit entire image)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cover" id="cover" />
                  <Label htmlFor="cover" className="font-normal">Cover (fill container)</Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                Contain: Shows the entire image. Cover: Fills the container (may crop image).
              </p>
            </div>

            {/* Object Position Selection - Only for Cover Mode */}
            {fitMode === 'cover' && (
              <div className="space-y-3 border-t pt-4">
                <Label>Focal Point (Cover Mode)</Label>
                <RadioGroup value={objectPosition} onValueChange={(value: 'top' | 'center' | 'bottom') => setObjectPosition(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="top" id="top" />
                    <Label htmlFor="top" className="font-normal">Top</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="center" />
                    <Label htmlFor="center" className="font-normal">Center</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bottom" id="bottom" />
                    <Label htmlFor="bottom" className="font-normal">Bottom</Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Controls which part of the image stays visible when cropped in cover mode.
                </p>
              </div>
            )}

            {/* Aspect Ratio Selection */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <Label>Image Aspect Ratio</Label>
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const detected = await detectImageAspectRatio(imageUrl);
                        setAspectRatio(detected);
                        toast.success(`Detected: ${detected} aspect ratio`);
                      } catch (error) {
                        toast.error('Failed to detect aspect ratio');
                      }
                    }}
                  >
                    <Wand2 className="w-4 h-4 mr-1" />
                    Auto-detect
                  </Button>
                )}
              </div>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Original)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                  <SelectItem value="16:10">16:10 (Monitor)</SelectItem>
                  <SelectItem value="21:9">21:9 (Ultrawide)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                  <SelectItem value="10:16">10:16 (Tall)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Controls the proportions of the image content. 'Auto' maintains original aspect ratio.
              </p>
            </div>

            {/* Preview Section */}
            {(() => {
              const previewImage = displayType === 'image' 
                ? imageUrl 
                : (carouselImages.length > 0 ? carouselImages[0].url : '');
              
              if (!previewImage) return null;
              
              return (
                <div className="space-y-3 border-t pt-4" key={aspectRatio}>
                  <Label>Preview</Label>
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Preview how your image will appear with current settings
                    </p>
                    
                    {/* Preview Container */}
                    <div className="border border-border rounded-lg p-4 bg-muted/30">
                      <div className="flex gap-4">
                        {/* Contain Preview */}
                        <div className="flex-1">
                          <p className="text-xs font-medium mb-2 text-foreground">Contain Mode</p>
                          <div 
                            className={cn(
                              "relative w-full bg-background border border-border rounded overflow-hidden",
                              aspectRatio === 'auto' ? 'h-64' : ''
                            )}
                            style={{
                              aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio.replace(':', '/'),
                            }}
                          >
                            <img
                              key={`contain-${aspectRatio}`}
                              src={previewImage}
                              alt="Preview"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        
                        {/* Cover Preview */}
                        <div className="flex-1">
                          <p className="text-xs font-medium mb-2 text-foreground">Cover Mode</p>
                          <div 
                            className={cn(
                              "relative w-full bg-background border border-border rounded overflow-hidden",
                              aspectRatio === 'auto' ? 'h-64' : ''
                            )}
                            style={{
                              aspectRatio: aspectRatio === 'auto' ? 'auto' : aspectRatio.replace(':', '/'),
                            }}
                          >
                             <img
                              key={`cover-${aspectRatio}-${objectPosition}`}
                              src={previewImage}
                              alt="Preview"
                              className={cn(
                                "w-full h-full object-cover",
                                objectPosition === 'top' && 'object-top',
                                objectPosition === 'center' && 'object-center',
                                objectPosition === 'bottom' && 'object-bottom'
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        <p className="font-medium mb-1">Current: {fitMode === 'contain' ? 'Contain' : 'Cover'} mode, {aspectRatio === 'auto' ? 'Auto' : aspectRatio} ratio</p>
                        <p>
                          {fitMode === 'contain' 
                            ? 'Full image visible with possible padding' 
                            : 'Image fills container, may crop edges'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Status & Recovery Tools */}
            {displayType === 'carousel' && (mode === 'standalone' || carouselSource === 'new') && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Backup & Recovery</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleExportConfig}
                      disabled={carouselImages.length === 0}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Export
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('import-config')?.click()}
                    >
                      <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                      Import
                    </Button>
                    <input
                      id="import-config"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImportConfig}
                    />
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-2 text-xs">
                  {carouselImages.length > 0 && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400" />
                      <span className="font-medium">{carouselImages.length} images ready</span>
                      <span className="text-muted-foreground">· Draft auto-saved</span>
                    </div>
                  )}
                  
                  {lastSaveAttempt && (
                    <div className="text-muted-foreground">
                      Last save attempt: {lastSaveAttempt.toLocaleTimeString()}
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                      <X className="h-4 w-4 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="font-medium">Save failed</p>
                        <p className="text-xs">{saveError}</p>
                        <p className="text-xs text-muted-foreground">
                          Your work is saved locally. Try exporting as backup.
                        </p>
                      </div>
                    </div>
                  )}
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
