import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Trash2, Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const VideoManager = () => {
  const [videos, setVideos] = useState<Array<{ name: string; url: string; file?: File }>>([]);
  const [uploading, setUploading] = useState(false);
  const [existingVideos, setExistingVideos] = useState<Array<{ name: string; url: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchExistingVideos();
  }, []);

  const fetchExistingVideos = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('demo-videos')
        .list('', { limit: 10, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;

      const videoUrls = data?.map(file => ({
        name: file.name,
        url: supabase.storage.from('demo-videos').getPublicUrl(file.name).data.publicUrl
      })) || [];

      setExistingVideos(videoUrls);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

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

    setVideos(prev => [...prev, ...newVideos]);
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

          return fileName;
        });

      await Promise.all(uploadPromises);
      
      setVideos([]);
      await fetchExistingVideos();

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

  const deleteVideo = async (fileName: string) => {
    try {
      const { error } = await supabase.storage
        .from('demo-videos')
        .remove([fileName]);

      if (error) throw error;

      await fetchExistingVideos();
      toast({
        title: "Video deleted",
        description: "Video has been removed from the demo gallery.",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete video. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeLocalVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Video className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Demo Video Manager</h2>
        <p className="text-muted-foreground">
          Upload and manage demo videos that appear on the public demo page
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6 bg-card border-border">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4 text-foreground">Upload New Videos</h3>
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
            {videos.length > 0 && (
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
            Supported formats: MP4, WebM, MOV
          </p>
        </div>

        {/* Preview New Videos */}
        {videos.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-4 text-foreground">Ready to Upload:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videos.map((video, index) => (
                <div key={index} className="relative border border-border rounded-lg overflow-hidden">
                  <video
                    src={video.url}
                    className="w-full h-32 object-cover"
                    muted
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeLocalVideo(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-foreground truncate">{video.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Existing Videos */}
      <Card className="p-6 bg-card border-border">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Current Demo Videos</h3>
        {existingVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingVideos.map((video, index) => (
              <div key={index} className="relative border border-border rounded-lg overflow-hidden">
                <video
                  src={video.url}
                  controls
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteVideo(video.name)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-foreground truncate">Demo Video {index + 1}</p>
                  <p className="text-xs text-muted-foreground">Live on demo page</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No videos uploaded yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default VideoManager;
