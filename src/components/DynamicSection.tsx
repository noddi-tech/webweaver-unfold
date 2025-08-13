import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Metrics from '@/components/Metrics';

interface Section {
  id: string;
  name: string;
  display_name: string;
  page_location: string;
  active: boolean;
  sort_order: number;
  background_token?: string;
  text_token?: string;
  padding_token?: string;
  margin_token?: string;
  max_width_token?: string;
}

interface DynamicSectionProps {
  section: Section;
}

const DynamicSection = ({ section }: DynamicSectionProps) => {
  // Map section names to components
  const sectionComponents: Record<string, React.ComponentType> = {
    hero: Hero,
    features: Features,
    metrics: Metrics,
    'customer-journey': () => <CustomerJourneySection section={section} />,
  };

  const SectionComponent = sectionComponents[section.name];
  
  if (!SectionComponent) {
    return <GenericSection section={section} />;
  }

  // For known components, render them directly
  if (['hero', 'features', 'metrics'].includes(section.name)) {
    return <SectionComponent />;
  }

  // For custom sections, wrap in styling
  const getBackgroundClass = (token?: string) => {
    const mapping: Record<string, string> = {
      background: 'bg-background',
      card: 'bg-card',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      accent: 'bg-accent',
      'gradient-primary': 'bg-gradient-primary',
      'gradient-background': 'bg-gradient-background',
      'gradient-hero': 'bg-gradient-hero',
    };
    return mapping[token || 'background'] || 'bg-background';
  };

  const getTextClass = (token?: string) => {
    const mapping: Record<string, string> = {
      foreground: 'text-foreground',
      'muted-foreground': 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
    };
    return mapping[token || 'foreground'] || 'text-foreground';
  };

  const getPaddingClass = (token?: string) => {
    const mapping: Record<string, string> = {
      section: 'py-20 px-6',
      large: 'py-32 px-8',
      small: 'py-12 px-4',
      none: '',
    };
    return mapping[token || 'section'] || 'py-20 px-6';
  };

  const getMaxWidthClass = (token?: string) => {
    const mapping: Record<string, string> = {
      container: 'container mx-auto',
      full: 'w-full',
      narrow: 'max-w-4xl mx-auto',
      wide: 'max-w-7xl mx-auto',
    };
    return mapping[token || 'container'] || 'container mx-auto';
  };

  return (
    <section 
      className={`
        ${getBackgroundClass(section.background_token)}
        ${getTextClass(section.text_token)}
        ${getPaddingClass(section.padding_token)}
      `}
    >
      <div className={getMaxWidthClass(section.max_width_token)}>
        <SectionComponent />
      </div>
    </section>
  );
};

const CustomerJourneySection = ({ section }: { section: Section }) => {
  const [headings, setHeadings] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      // Fetch headings for this section
      const { data: headingsData } = await supabase
        .from('headings')
        .select('*')
        .eq('active', true)
        .eq('section', section.name)
        .order('sort_order', { ascending: true });

      // Fetch features for this section
      const { data: featuresData } = await supabase
        .from('features')
        .select('*')
        .eq('section_id', section.id)
        .order('sort_order', { ascending: true });

      // Fetch images for this section
      const { data: imagesData } = await supabase
        .from('images')
        .select('*')
        .eq('active', true)
        .eq('section', section.name)
        .order('sort_order', { ascending: true });

      setHeadings(headingsData || []);
      setFeatures(featuresData || []);
      setImages(imagesData || []);
    };

    fetchContent();
  }, [section.name, section.id]);

  const getHeading = (elementType: string, fallback: string = '') => {
    const heading = headings.find(h => h.element_type === elementType);
    return heading?.content || fallback;
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">
        {getHeading('h2', section.display_name)}
      </h2>
      
      {getHeading('h5') && (
        <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
          {getHeading('h5')}
        </p>
      )}

      {images.length > 0 && (
        <div className="mb-8">
          <img
            src={images[0].file_url}
            alt={images[0].alt || section.display_name}
            className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
          />
        </div>
      )}

      {features.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {features.map((feature) => (
            <div key={feature.id} className="p-6 bg-card rounded-lg border border-border">
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GenericSection = ({ section }: { section: Section }) => {
  return (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold mb-4">{section.display_name}</h2>
      <p className="text-muted-foreground">
        Section "{section.name}" is configured but needs a custom component.
      </p>
    </div>
  );
};

export default DynamicSection;