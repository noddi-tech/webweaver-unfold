import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Features from "@/components/Features";
import { useHeadings } from "@/hooks/useHeadings";
import { getTypographyClass } from "@/lib/typography";
import { getColorClass } from "@/lib/colorUtils";
import { supabase } from "@/integrations/supabase/client";
import { HreflangTags } from "@/components/HreflangTags";
import { EditableTranslation } from "@/components/EditableTranslation";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  meta_description?: string;
  default_background_token: string;
  default_text_token: string;
  default_padding_token: string;
  default_margin_token: string;
  default_max_width_token: string;
  layout_type: string;
  container_width: string;
  active: boolean;
  published: boolean;
}

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

const FeaturesPage = () => {
  const { getHeading, headings } = useHeadings('features', 'hero');
  const [pageData, setPageData] = useState<Page | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      // Load page data for Features page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'features')
        .eq('active', true)
        .maybeSingle();

      if (page) {
        setPageData(page);
        
        // Update document head with page data
        document.title = page.title;
        if (page.meta_description) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', page.meta_description);
          } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = page.meta_description;
            document.head.appendChild(meta);
          }
        }

        // Apply page background using proper background class mapping
        const backgroundClass = getBackgroundClass(page.default_background_token);
        const textClass = getTextClass(page.default_text_token);
        
        // Remove existing background classes and apply new ones
        document.body.className = document.body.className
          .replace(/bg-\S+/g, '')
          .replace(/text-\S+/g, '')
          .trim();
        document.body.classList.add(...backgroundClass.split(' '), ...textClass.split(' '));
      }
    };

    loadPage();
  }, []);

  // Cleanup body classes when component unmounts
  useEffect(() => {
    return () => {
      document.body.className = '';
    };
  }, []);
  
  return (
    <div className="min-h-screen text-foreground">
      <HreflangTags pageSlug="/features" />
      <Header />
      
      <main className="container mx-auto px-6 py-12 pt-32" data-header-color="dark">
        <div className="text-center mb-16">
          {(() => {
            const h1Heading = headings.find(h => h.element_type === 'h1');
            const h1Class = h1Heading?.color_token ? 
              `${getTypographyClass('h1')} mb-6 ${getColorClass(h1Heading.color_token)}` : 
              'text-6xl font-bold text-foreground mb-6';
            
            const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
            const subtitleClass = subtitleHeading?.color_token ? 
              `${getTypographyClass('subtitle')} max-w-3xl mx-auto ${getColorClass(subtitleHeading.color_token)}` : 
              'text-xl text-muted-foreground max-w-3xl mx-auto';
            
            return (
              <>
                <h1 className={h1Class}>
                  <EditableTranslation translationKey="features.hero.h1">
                    {getHeading('h1', 'Features')}
                  </EditableTranslation>
                </h1>
                <p className={subtitleClass}>
                  <EditableTranslation translationKey="features.hero.subtitle">
                    {getHeading('subtitle', 'Discover what makes our platform special')}
                  </EditableTranslation>
                </p>
              </>
            );
          })()}
        </div>

        <Features />
      </main>
    </div>
  );
};

export default FeaturesPage;