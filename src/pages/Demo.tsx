import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Play, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/Header";

const Demo = () => {
  const [videos, setVideos] = useState<Array<{ name: string; url: string; file?: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please select video files only.",
        variant: "destructive",
      });
      return;
    }

    const newVideos = videoFiles.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }));

    setVideos(prev => [...prev, ...newVideos].slice(0, 4)); // Limit to 4 videos
  };

  const uploadVideos = async () => {
    if (videos.length === 0 || !videos.some(v => v.file)) return;

    setUploading(true);
    try {
      const uploadPromises = videos
        .filter(video => video.file)
        .map(async (video) => {
          const fileExt = video.file!.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('demo-videos')
            .upload(fileName, video.file!);

          if (error) throw error;

          const { data } = supabase.storage
            .from('demo-videos')
            .getPublicUrl(fileName);

          return {
            ...video,
            url: data.publicUrl,
            file: undefined
          };
        });

      const uploadedVideos = await Promise.all(uploadPromises);
      setVideos(prev => prev.map(video => 
        uploadedVideos.find(uploaded => uploaded.name === video.name) || video
      ));

      toast({
        title: "Videos uploaded successfully",
        description: "All videos have been uploaded to the demo gallery.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload videos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              Product Demo
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch our product in action. Upload up to 4 demo videos to showcase 
              the capabilities of Noddi Tech's automotive logistics platform.
            </p>
          </div>

          {/* Upload Section */}
          <Card className="p-8 mb-12 bg-card border-border">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Upload Demo Videos</h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <label htmlFor="video-upload" className="cursor-pointer">
                  <Button asChild>
                    <span>
                      <Upload className="mr-2" size={20} />
                      Select Videos
                    </span>
                  </Button>
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {videos.some(v => v.file) && (
                  <Button 
                    onClick={uploadVideos} 
                    disabled={uploading}
                    variant="outline"
                  >
                    {uploading ? "Uploading..." : "Upload to Gallery"}
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Select up to 4 video files. Supported formats: MP4, WebM, MOV
              </p>
            </div>
          </Card>

          {/* Video Gallery */}
          {videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {videos.map((video, index) => (
                <Card key={index} className="overflow-hidden bg-card border-border">
                  <div className="relative">
                    <video
                      src={video.url}
                      controls
                      className="w-full h-64 object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3C/svg%3E"
                    >
                      Your browser does not support the video tag.
                    </video>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => removeVideo(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-foreground truncate">
                      {video.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {video.file ? "Ready to upload" : "Uploaded"}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {videos.length === 0 && (
            <div className="text-center py-20">
              <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No videos uploaded yet
              </h3>
              <p className="text-muted-foreground">
                Upload your first demo video to get started
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Demo;