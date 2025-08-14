import { useEffect, useState } from 'react';
import Hero from './Hero';
import Features from './Features';
import Metrics from './Metrics';
import { supabase } from '@/integrations/supabase/client';
import { getTypographyClass } from '@/lib/typography';
import { getColorClass } from '@/lib/colorUtils';

interface Section {
  id: string;
  name: string;
  display_name: string;
  page_location: string;
  active: boolean;
  sort_order: number;
  page_id?: string;
  inherit_page_defaults: boolean;
  background_token?: string;
  text_token?: string;
  padding_token?: string;
  margin_token?: string;
  max_width_token?: string;
  background_token_override?: string;
  text_token_override?: string;
  padding_token_override?: string;
  margin_token_override?: string;
  max_width_token_override?: string;
}

interface DynamicSectionProps { 
  section: Section;
  pageDefaults?: {
    default_background_token: string;
    default_text_token: string;
    default_padding_token: string;
    default_margin_token: string;
    default_max_width_token: string;
  };
}

const DynamicSection = ({ section, pageDefaults }: DynamicSectionProps) => {
  // Helper functions to apply Tailwind CSS classes based on tokens
  const getBackgroundClass = (token?: string) => {
    const mapping: Record<string, string> = {
      background: 'bg-background',
      card: 'bg-card',
      muted: 'bg-muted',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      accent: 'bg-accent',
      'gradient-primary': 'bg-gradient-primary',
      'gradient-background': 'bg-gradient-background',
      'gradient-hero': 'bg-gradient-hero',
      'gradient-subtle': 'bg-gradient-subtle',
      transparent: 'bg-transparent',
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
      'gradient-text': 'gradient-text',
      destructive: 'text-destructive',
    };
    return mapping[token || 'foreground'] || 'text-foreground';
  };

  const getPaddingClass = (token?: string) => {
    const mapping: Record<string, string> = {
      none: 'py-0',
      xs: 'py-2',
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-12',
      xl: 'py-16',
      section: 'py-section',
    };
    return mapping[token || 'section'] || 'py-section';
  };

  const getMarginClass = (token?: string) => {
    const mapping: Record<string, string> = {
      none: 'my-0',
      xs: 'my-2',
      sm: 'my-4',
      md: 'my-8',
      lg: 'my-12',
      xl: 'my-16',
      section: 'my-section',
    };
    return mapping[token || 'none'] || 'my-0';
  };

  const getMaxWidthClass = (token?: string) => {
    const mapping: Record<string, string> = {
      none: 'max-w-none',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      container: 'max-w-container',
      full: 'max-w-full',
    };
    return mapping[token || 'container'] || 'max-w-container';
  };

  // Use inheritance logic: section overrides take precedence over page defaults
  const getEffectiveToken = (
    sectionOverride: string | undefined, 
    sectionDefault: string, 
    pageDefault: string | undefined
  ) => {
    // If section has override, use it
    if (sectionOverride) {
      return sectionOverride;
    }
    
    // If section inherits from page and page has default, use page default
    if (section.inherit_page_defaults && pageDefault) {
      return pageDefault;
    }
    
    // Otherwise use section default
    return sectionDefault;
  };

  // Map section names to components
  const sectionComponents: Record<string, React.ComponentType> = {
    hero: Hero,
    features: Features,
    metrics: Metrics,
    'customer-journey': () => <CustomerJourneySection section={section} />,
  };

  const SectionComponent = sectionComponents[section.name];
  
  if (!SectionComponent) {
    return <GenericSection section={section} pageDefaults={pageDefaults} />;
  }

  // For known components, render them with conditional background override
  if (['hero', 'features', 'metrics'].includes(section.name)) {
    // Only apply background if section explicitly overrides or doesn't inherit from page
    const shouldApplyBackground = !section.inherit_page_defaults || section.background_token_override;
    
    const backgroundToken = shouldApplyBackground ? getEffectiveToken(
      section.background_token_override,
      section.background_token || 'transparent',
      undefined // Don't use page default since it's on body
    ) : 'transparent';
    
    const textToken = getEffectiveToken(
      section.text_token_override,
      section.text_token || 'inherit',
      pageDefaults?.default_text_token
    );

    const paddingToken = getEffectiveToken(
      section.padding_token_override,
      section.padding_token || 'section',
      pageDefaults?.default_padding_token
    );

    const marginToken = getEffectiveToken(
      section.margin_token_override,
      section.margin_token || 'none',
      pageDefaults?.default_margin_token
    );

    const backgroundClass = backgroundToken === 'transparent' ? '' : getBackgroundClass(backgroundToken);
    const textClass = textToken === 'inherit' ? '' : getTextClass(textToken);
    const paddingClass = getPaddingClass(paddingToken);
    const marginClass = getMarginClass(marginToken);

    return (
      <div className={`${backgroundClass} ${textClass} ${paddingClass} ${marginClass}`.trim()}>
        <SectionComponent />
      </div>
    );
  }

  return <SectionComponent />;
};

// Customer Journey Section Component
const CustomerJourneySection = ({ section }: { section: Section }) => {
  const [headings, setHeadings] = useState<any[]>([]);
  const [features, setFeatures] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    const fetchSectionContent = async () => {
      // Fetch headings for this section - try both index and page_location
      const { data: headingsData } = await supabase
        .from('text_content')
        .select('*')
        .eq('active', true)
        .eq('section', section.name)
        .in('page_location', ['index', section.page_location])
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

    fetchSectionContent();
  }, [section.id, section.name]);

  return (
    <section className="py-section px-6">
      <div className="container mx-auto">
        {/* Render headings */}
        {headings.map((heading) => {
          const HeadingTag = heading.element_type as keyof JSX.IntrinsicElements;
          const colorClass = getColorClass(heading.color_token, 'foreground');
          const typographyClass = getTypographyClass(heading.element_type);
          return (
            <HeadingTag
              key={heading.id}
              className={`${typographyClass} ${colorClass} mb-4 text-center`}
            >
              {heading.content}
            </HeadingTag>
          );
        })}

        {/* Render images */}
        {images.map((image) => (
          <div key={image.id} className="mb-8">
            {image.title && (
              <h3 className={`text-xl font-semibold mb-3 ${getColorClass(image.title_color_token, 'foreground')}`}>
                {image.title}
              </h3>
            )}
            {image.caption && image.caption_position === 'above' && (
              <p className={`text-base mb-4 leading-relaxed ${getColorClass(image.caption_color_token, 'muted-foreground')}`}>
                {image.caption}
              </p>
            )}
            <img
              src={image.file_url}
              alt={image.alt || image.title}
              className="w-full h-auto rounded-lg"
            />
            {image.caption && (!image.caption_position || image.caption_position === 'below') && (
              <p className={`text-base mt-3 leading-relaxed ${getColorClass(image.caption_color_token, 'muted-foreground')}`}>
                {image.caption}
              </p>
            )}
          </div>
        ))}

        {/* Render features */}
        {features.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.id} className="p-6 bg-card rounded-lg border">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                {feature.description && (
                  <p className="text-muted-foreground">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Generic Section Component for unmatched sections
const GenericSection = ({ section, pageDefaults }: { 
  section: Section; 
  pageDefaults?: DynamicSectionProps['pageDefaults'];
}) => {
  return (
    <section className="py-section px-6 bg-muted/10">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">
          Section: {section.display_name}
        </h2>
        <p className="text-muted-foreground">
          This section ({section.name}) needs a custom component to be implemented.
        </p>
        {pageDefaults && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Page defaults: {pageDefaults.default_background_token} background</p>
            <p>Inherits from page: {section.inherit_page_defaults ? 'Yes' : 'No'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DynamicSection;
