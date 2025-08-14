import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicSection from "@/components/DynamicSection";
import { supabase } from '@/integrations/supabase/client';

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

  if (loading) {
    return (
      <div className="min-h-screen text-foreground">
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

  // Apply page-level background styling
  const pageStyle = pageData ? {
    backgroundColor: `hsl(var(--${pageData.default_background_token}))`,
    color: `hsl(var(--${pageData.default_text_token}))`
  } : {};

  return (
    <div className="min-h-screen text-foreground" style={pageStyle}>
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
