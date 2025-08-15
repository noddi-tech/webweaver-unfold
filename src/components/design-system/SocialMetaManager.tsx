import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SocialMetaSettings {
  id?: string;
  og_title: string;
  og_description: string;
  og_image_url: string;
  og_url: string;
  twitter_card: 'summary' | 'summary_large_image';
  twitter_site: string;
  twitter_image_url: string;
  created_at?: string;
  updated_at?: string;
}

const SocialMetaManager = () => {
  const { toast } = useToast();
  const [metaSettings, setMetaSettings] = useState<SocialMetaSettings>({
    og_title: '',
    og_description: '',
    og_image_url: '',
    og_url: '',
    twitter_card: 'summary_large_image',
    twitter_site: '',
    twitter_image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSocialMetaSettings();
  }, []);

  const fetchSocialMetaSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('setting_key', 'social_meta')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const settings = JSON.parse(data.setting_value);
        setMetaSettings(settings);
      } else {
        // Initialize with current page data
        setMetaSettings(prev => ({
          ...prev,
          og_title: document.title || 'Noddi Tech - Automotive Logistics Technology Platform',
          og_description: document.querySelector('meta[name="description"]')?.getAttribute('content') || 'Empower your automotive maintenance operations',
          og_url: window.location.origin
        }));
      }
    } catch (error: any) {
      console.error('Error fetching social meta settings:', error);
      toast({
        title: "Error fetching social media settings",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSocialMetaSettings = async (settings: SocialMetaSettings) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: 'social_meta',
          setting_value: JSON.stringify(settings),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({ title: "Social media settings saved successfully" });
      
      // Update the meta tags in the document head
      updateDocumentMetaTags(settings);
      
    } catch (error: any) {
      toast({
        title: "Error saving social media settings",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateDocumentMetaTags = (settings: SocialMetaSettings) => {
    // Update or create Open Graph meta tags
    updateMetaTag('property', 'og:title', settings.og_title);
    updateMetaTag('property', 'og:description', settings.og_description);
    updateMetaTag('property', 'og:image', settings.og_image_url);
    updateMetaTag('property', 'og:url', settings.og_url);
    updateMetaTag('property', 'og:type', 'website');

    // Update or create Twitter meta tags
    updateMetaTag('name', 'twitter:card', settings.twitter_card);
    updateMetaTag('name', 'twitter:site', settings.twitter_site);
    updateMetaTag('name', 'twitter:image', settings.twitter_image_url || settings.og_image_url);
  };

  const updateMetaTag = (attributeName: string, attributeValue: string, content: string) => {
    if (!content) return;

    let meta = document.querySelector(`meta[${attributeName}="${attributeValue}"]`) as HTMLMetaElement;
    
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attributeName, attributeValue);
      document.head.appendChild(meta);
    }
    
    meta.content = content;
  };

  const handleImageUpload = async (file: File, field: 'og_image_url' | 'twitter_image_url') => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      if (!fileExt || !['png', 'jpg', 'jpeg', 'webp'].includes(fileExt)) {
        throw new Error('Please upload a PNG, JPG, JPEG, or WebP file');
      }

      const fileName = `social-${field}-${Date.now()}.${fileExt}`;
      const filePath = `social-media/${fileName}`;

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

      setMetaSettings(prev => ({
        ...prev,
        [field]: data.publicUrl
      }));

      toast({ title: "Image uploaded successfully" });
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

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border">
        <p className="text-muted-foreground">Loading social media settings...</p>
      </Card>
    );
  }

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold gradient-text">Social Media Manager</h2>
        <p className="text-muted-foreground">
          Manage Open Graph and Twitter meta tags for social media sharing previews.
        </p>
      </header>

      <Card className="p-6 bg-card border-border space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Open Graph Settings</h3>
          <p className="text-sm text-muted-foreground">
            These tags control how your website appears when shared on Facebook, LinkedIn, and other platforms.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input
                value={metaSettings.og_title}
                onChange={(e) => setMetaSettings(prev => ({ ...prev, og_title: e.target.value }))}
                placeholder="Your page title for social media"
              />
            </div>
            <div className="space-y-2">
              <Label>OG URL</Label>
              <Input
                value={metaSettings.og_url}
                onChange={(e) => setMetaSettings(prev => ({ ...prev, og_url: e.target.value }))}
                placeholder="https://yourdomain.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>OG Description</Label>
            <Textarea
              value={metaSettings.og_description}
              onChange={(e) => setMetaSettings(prev => ({ ...prev, og_description: e.target.value }))}
              placeholder="Description that appears in social media previews"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>OG Image</Label>
            <div className="space-y-3">
              {metaSettings.og_image_url && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <img 
                    src={metaSettings.og_image_url} 
                    alt="Open Graph preview" 
                    className="w-full max-w-md h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Input
                  value={metaSettings.og_image_url}
                  onChange={(e) => setMetaSettings(prev => ({ ...prev, og_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg or upload below"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'og_image_url');
                  }}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 1200x630px for optimal display across platforms
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Twitter Settings</h3>
          <p className="text-sm text-muted-foreground">
            These tags control how your website appears when shared on Twitter/X.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Twitter Site (@username)</Label>
              <Input
                value={metaSettings.twitter_site}
                onChange={(e) => setMetaSettings(prev => ({ ...prev, twitter_site: e.target.value }))}
                placeholder="@yourusername"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter Card Type</Label>
              <select 
                value={metaSettings.twitter_card}
                onChange={(e) => setMetaSettings(prev => ({ ...prev, twitter_card: e.target.value as 'summary' | 'summary_large_image' }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="summary">Summary</option>
                <option value="summary_large_image">Summary Large Image</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Twitter Image (optional - uses OG image if empty)</Label>
            <div className="space-y-3">
              {metaSettings.twitter_image_url && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <img 
                    src={metaSettings.twitter_image_url} 
                    alt="Twitter preview" 
                    className="w-full max-w-md h-40 object-cover rounded-md"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Input
                  value={metaSettings.twitter_image_url}
                  onChange={(e) => setMetaSettings(prev => ({ ...prev, twitter_image_url: e.target.value }))}
                  placeholder="https://example.com/twitter-image.jpg or upload below"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'twitter_image_url');
                  }}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => saveSocialMetaSettings(metaSettings)}
            disabled={uploading}
          >
            {uploading ? "Processing..." : "Save Settings"}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => updateDocumentMetaTags(metaSettings)}
          >
            Preview Meta Tags
          </Button>
        </div>

        <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
          <h4 className="font-semibold mb-2">Preview</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Title:</strong> {metaSettings.og_title}</div>
            <div><strong>Description:</strong> {metaSettings.og_description}</div>
            <div><strong>URL:</strong> {metaSettings.og_url}</div>
            {metaSettings.og_image_url && <div><strong>Image:</strong> {metaSettings.og_image_url}</div>}
          </div>
        </div>
      </Card>
    </section>
  );
};

export default SocialMetaManager;