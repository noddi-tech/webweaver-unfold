import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Play } from "lucide-react";
import Header from "@/components/Header";

const Demo = () => {
  const [videos, setVideos] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('demo-videos')
        .list('', { limit: 4, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const videoUrls = data?.map(file => ({
        name: file.name,
        url: supabase.storage.from('demo-videos').getPublicUrl(file.name).data.publicUrl
      })) || [];

      setVideos(videoUrls);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Product Demo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch our product in action. See how Noddi Tech's automotive logistics 
              platform streamlines operations and delivers exceptional results.
            </p>
          </div>

          {/* Video Gallery */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading demo videos...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((video, index) => (
                <Card key={index} className="overflow-hidden bg-card border-border">
                  <div className="relative">
                    <video
                      src={video.url}
                      controls
                      preload="metadata"
                      className="w-full h-64 object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='16' fill='%23666'%3EDemo Video%3C/text%3E%3C/svg%3E"
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      Demo Video {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Product demonstration
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No demo videos available
              </h3>
              <p className="text-muted-foreground">
                Demo videos will appear here once uploaded by administrators
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Demo;