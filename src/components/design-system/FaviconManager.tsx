import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FaviconSettings {
  id?: string;
  favicon_url: string;
  favicon_type: 'png' | 'ico' | 'svg';
  created_at?: string;
  updated_at?: string;
}

const FaviconManager = () => {
  const { toast } = useToast();
  const [faviconSettings, setFaviconSettings] = useState<FaviconSettings>({
    favicon_url: '/favicon.ico',
    favicon_type: 'ico'
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaviconSettings();
  }, []);

  const fetchFaviconSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'favicon')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settings = JSON.parse(data.setting_value);
        setFaviconSettings(settings);
      }
    } catch (error: any) {
      console.error('Error fetching favicon settings:', error);
      toast({
        title: "Error fetching favicon settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFaviconSettings = async (settings: FaviconSettings) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'favicon',
          setting_value: JSON.stringify(settings),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Favicon settings saved successfully" });
      
      // Update the favicon in the document head
      updateDocumentFavicon(settings.favicon_url, settings.favicon_type);
      
    } catch (error: any) {
      toast({
        title: "Error saving favicon settings",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateDocumentFavicon = (url: string, type: string) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = url;
    link.type = type === 'ico' ? 'image/x-icon' : `image/${type}`;
    document.head.appendChild(link);
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['png', 'ico', 'svg'].includes(fileExt)) {
        throw new Error('Please upload a PNG, ICO, or SVG file');
      }

      const fileName = `favicon-${Date.now()}.${fileExt}`;
      const filePath = `favicons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      const newSettings = {
        ...faviconSettings,
        favicon_url: data.publicUrl,
        favicon_type: fileExt as 'png' | 'ico' | 'svg'
      };

      setFaviconSettings(newSettings);
      await saveFaviconSettings(newSettings);

      toast({ title: "Favicon uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setFaviconSettings(prev => ({ ...prev, favicon_url: url }));
  };

  const handleTypeChange = (type: 'png' | 'ico' | 'svg') => {
    setFaviconSettings(prev => ({ ...prev, favicon_type: type }));
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground">Loading favicon settings...</p>
      </Card>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Favicon Manager</h2>
        <p className="text-muted-foreground">
          Manage your website's favicon that appears in browser tabs and bookmarks.
        </p>
      </header>

      <Card className="p-6 bg-card border-border space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Current Favicon</h3>
          
          <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
            <img 
              src={faviconSettings.favicon_url} 
              alt="Current favicon" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                e.currentTarget.src = '/favicon.ico';
              }}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                Type: {faviconSettings.favicon_type.toUpperCase()}
              </p>
              <p className="text-xs text-muted-foreground">
                URL: {faviconSettings.favicon_url}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload New Favicon</h3>
          <div className="space-y-2">
            <Label>Choose File (PNG, ICO, or SVG)</Label>
            <Input
              type="file"
              accept=".png,.ico,.svg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 32x32px or 16x16px for best browser compatibility
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Or Use External URL</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={faviconSettings.favicon_url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/favicon.png"
              />
            </div>
            <div className="space-y-2">
              <Label>File Type</Label>
              <Select 
                value={faviconSettings.favicon_type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="ico">ICO</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => saveFaviconSettings(faviconSettings)}
            disabled={uploading}
          >
            {uploading ? "Processing..." : "Save Settings"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => updateDocumentFavicon(faviconSettings.favicon_url, faviconSettings.favicon_type)}
          >
            Preview Now
          </Button>
        </div>
      </Card>
    </section>
  );
};

export default FaviconManager;