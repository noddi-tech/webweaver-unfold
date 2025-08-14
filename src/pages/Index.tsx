import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicSection from "@/components/DynamicSection";
import { supabase } from '@/integrations/supabase/client';
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

const Index = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [pageData, setPageData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPageAndSections = async () => {
      try {
        // Fetch page data for homepage
        const { data: page, error: pageError } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', 'homepage')
          .eq('active', true)
          .maybeSingle();

        if (pageError) throw pageError;
        
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

          // Fetch sections for this page
          const { data: sectionsData, error: sectionsError } = await supabase
            .from('sections')
            .select('*')
            .eq('active', true)
            .eq('page_id', page.id)
            .order('sort_order', { ascending: true });

          if (sectionsError) throw sectionsError;
          setSections(sectionsData || []);
        }
      } catch (error) {
        console.error('Error fetching page data:', error);
        // Fallback to old method if page doesn't exist
        const { data } = await supabase
          .from('sections')
          .select('*')
          .eq('active', true)
          .in('page_location', ['index', 'homepage'])
          .order('sort_order', { ascending: true });
        
        setSections(data || []);
      } finally {
        setLoading(false);
      }
    };

    fetchPageAndSections();
  }, []);

  // Cleanup body classes when component unmounts
  useEffect(() => {
    return () => {
      document.body.className = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {sections.map((section) => (
          <DynamicSection 
            key={section.id} 
            section={section} 
            pageDefaults={pageData ? {
              default_background_token: pageData.default_background_token,
              default_text_token: pageData.default_text_token,
              default_padding_token: pageData.default_padding_token,
              default_margin_token: pageData.default_margin_token,
              default_max_width_token: pageData.default_max_width_token
            } : undefined}
          />
        ))}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
