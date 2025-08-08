import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import Header from "@/components/Header";
import { Separator } from "@/components/ui/separator";

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
  const [videos, setVideos] = useState<DbVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
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
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">Product Demo</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch our product in action. See how Noddi Tech's automotive logistics 
              platform streamlines operations and delivers exceptional results.
            </p>
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
                            poster={video.thumbnail_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23666'%3EDemo Video%3C/text%3E%3C/svg%3E"}
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