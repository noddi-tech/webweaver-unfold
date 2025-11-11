import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Images as ImagesIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CarouselCard } from './CarouselCard';
import { UniversalImageCarouselModal } from '@/components/UniversalImageCarouselModal';

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
  created_at: string;
  updated_at: string;
}

export default function CarouselManager() {
  const [carousels, setCarousels] = useState<CarouselConfig[]>([]);
  const [filteredCarousels, setFilteredCarousels] = useState<CarouselConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'images'>('updated');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<CarouselConfig | null>(null);

  useEffect(() => {
    loadCarousels();
  }, []);

  useEffect(() => {
    filterAndSortCarousels();
  }, [carousels, searchQuery, sortBy]);

  const loadCarousels = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('carousel_configs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(c => ({
        ...c,
        images: Array.isArray(c.images) ? c.images as unknown as CarouselImage[] : []
      }));

      setCarousels(typedData);
    } catch (error) {
      console.error('Error loading carousels:', error);
      toast.error('Failed to load carousels');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCarousels = () => {
    let filtered = [...carousels];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'images':
          return (b.images?.length || 0) - (a.images?.length || 0);
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    setFilteredCarousels(filtered);
  };

  const handleCreateNew = () => {
    setEditingCarousel(null);
    setModalOpen(true);
  };

  const handleEdit = (carousel: CarouselConfig) => {
    setEditingCarousel(carousel);
    setModalOpen(true);
  };

  const handleDuplicate = async (carousel: CarouselConfig) => {
    try {
      const { error } = await supabase
        .from('carousel_configs')
        .insert([
          {
            name: `${carousel.name} (Copy)`,
            description: carousel.description,
            autoplay: carousel.autoplay,
            autoplay_delay: carousel.autoplay_delay,
            show_navigation: carousel.show_navigation,
            show_dots: carousel.show_dots,
            images: JSON.parse(JSON.stringify(carousel.images)),
          },
        ]);

      if (error) throw error;

      toast.success('Carousel duplicated successfully');
      loadCarousels();
    } catch (error) {
      console.error('Error duplicating carousel:', error);
      toast.error('Failed to duplicate carousel');
    }
  };

  const handleDelete = async (carouselId: string) => {
    try {
      const { error } = await supabase
        .from('carousel_configs')
        .delete()
        .eq('id', carouselId);

      if (error) throw error;

      toast.success('Carousel deleted successfully');
      loadCarousels();
    } catch (error) {
      console.error('Error deleting carousel:', error);
      toast.error('Failed to delete carousel');
    }
  };

  const handleModalSave = () => {
    loadCarousels();
    setModalOpen(false);
    setEditingCarousel(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading carousels...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Carousel Library</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage reusable image carousels
          </p>
        </div>
        <Button onClick={handleCreateNew} className="shrink-0">
          <Plus className="h-4 w-4 mr-2" />
          Create Carousel
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search carousels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-foreground"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48 text-foreground">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="images">Most images</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Badge */}
      <div>
        <Badge variant="secondary">
          {filteredCarousels.length} {filteredCarousels.length === 1 ? 'carousel' : 'carousels'}
        </Badge>
      </div>

      {/* Carousel Grid */}
      {filteredCarousels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCarousels.map((carousel) => (
            <CarouselCard
              key={carousel.id}
              carousel={carousel}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-card border-border">
          <ImagesIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery ? 'No carousels found' : 'No carousels yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first reusable carousel to use across your site'}
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Create Carousel
            </Button>
          )}
        </Card>
      )}

      {/* Carousel Editor Modal */}
      <UniversalImageCarouselModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        locationId="" // Not needed in standalone mode
        onSave={handleModalSave}
        mode="standalone"
        carouselId={editingCarousel?.id}
      />
    </div>
  );
}
