import { useEffect, useMemo, useState } from "react";
import { useHeadings } from "@/hooks/useHeadings";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";
import { getTypographyClass } from "@/lib/typography";
import { getColorClass } from "@/lib/colorUtils";

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

type DbVideo = {
  id: string;
  title: string;
  description: string | null;
  section: string;
  sort_order: number | null;
  file_url: string;
  thumbnail_url: string | null;
};

const Demo = () => {
  const { getHeading, headings } = useHeadings('demo', 'hero');
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState<Page | null>(null);

  useEffect(() => {
    const loadPage = async () => {
      // Load page data for Demo page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'demo')
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
    fetchVideos();
  }, []);

  // Cleanup body classes when component unmounts
  useEffect(() => {
    return () => {
      document.body.className = '';
    };
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("id,title,description,section,sort_order,file_url,thumbnail_url")
        .order("section", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => {
    const g: Record<string, DbVideo[]> = {};
    videos.forEach(v => {
      const key = v.section || "General";
      g[key] = g[key] || [];
      g[key].push(v);
    });
    return g;
  }, [videos]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 px-6" data-header-color="dark">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            {(() => {
              const h1Heading = headings.find(h => h.element_type === 'h1');
              const h1Class = h1Heading?.color_token ? 
                `text-4xl md:${getTypographyClass('h1')} mb-6 ${getColorClass(h1Heading.color_token)}` : 
                'text-4xl md:text-6xl font-bold mb-6 gradient-text';
              
              const subtitleHeading = headings.find(h => h.element_type === 'subtitle');
              const subtitleClass = subtitleHeading?.color_token ? 
                `${getTypographyClass('subtitle')} max-w-3xl mx-auto ${getColorClass(subtitleHeading.color_token)}` : 
                'text-xl text-muted-foreground max-w-3xl mx-auto';
              
              return (
                <>
                  <h1 className={h1Class}>
                    {getHeading('h1', '')}
                  </h1>
                  <p className={subtitleClass}>
                    {getHeading('subtitle', '')}
                  </p>
                </>
              );
            })()}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading demo videos...</p>
            </div>
          ) : Object.keys(grouped).length > 0 ? (
            <div className="space-y-12">
              {Object.entries(grouped).map(([section, items]) => (
                <section key={section} aria-labelledby={`section-${section}`}>
                  <h2 id={`section-${section}`} className="text-2xl font-semibold text-foreground">{section}</h2>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {items.map((video) => (
                      <Card key={video.id} className="overflow-hidden bg-card border-border">
                        <div className="relative">
                          <video
                            src={video.file_url}
                            controls
                            preload="metadata"
                            className="w-full h-64 object-cover"
                            poster={video.thumbnail_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%23666'%3EDemo Video%3C/text%3E%3C/svg%3E"}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground truncate">{video.title}</h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground mt-1">{video.description}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No demo videos available</h3>
              <p className="text-muted-foreground">Demo videos will appear here once uploaded by administrators</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Demo;