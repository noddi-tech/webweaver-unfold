import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Type, Code } from 'lucide-react';

interface FontSettings {
  id: string;
  font_family_name: string;
  font_source: string;
  font_google_url: string | null;
  fallback_fonts: string[];
  mono_font_family_name: string;
  mono_font_source: string;
  mono_font_google_url: string | null;
  mono_fallback_fonts: string[];
}

const FontManager = () => {
  const [settings, setSettings] = useState<FontSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('typography_settings')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error loading font settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load font settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      const { error } = await supabase
        .from('typography_settings')
        .update({
          font_family_name: settings.font_family_name,
          font_source: settings.font_source,
          font_google_url: settings.font_google_url,
          fallback_fonts: settings.fallback_fonts,
          mono_font_family_name: settings.mono_font_family_name,
          mono_font_source: settings.mono_font_source,
          mono_font_google_url: settings.mono_font_google_url,
          mono_fallback_fonts: settings.mono_fallback_fonts,
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Font settings saved. Refresh the page to see changes.',
      });

      // Reload page to apply font changes
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Error saving font settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save font settings',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading font settings...</div>;
  }

  if (!settings) {
    return <div className="text-muted-foreground">No font settings found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Font Management</h2>
          <p className="text-muted-foreground">
            Configure primary and monospace fonts for the entire website
          </p>
        </div>
        <Button onClick={saveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Save Font Settings
        </Button>
      </div>

      <Tabs defaultValue="primary" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="primary" className="gap-2">
            <Type className="w-4 h-4" />
            Primary Font
          </TabsTrigger>
          <TabsTrigger value="mono" className="gap-2">
            <Code className="w-4 h-4" />
            Monospace Font
          </TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-6">
          <Card className="p-6 bg-background text-foreground">
            <h3 className="text-xl font-semibold mb-4">Primary Font (Body & Headings)</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="font-source">Font Source</Label>
                <Select
                  value={settings.font_source}
                  onValueChange={(value) => setSettings({ ...settings, font_source: value })}
                >
                  <SelectTrigger id="font-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Fonts</SelectItem>
                    <SelectItem value="system">System Fonts</SelectItem>
                    <SelectItem value="self-hosted">Self-Hosted (Future)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font-name">Font Family Name</Label>
                <Input
                  id="font-name"
                  value={settings.font_family_name}
                  onChange={(e) => setSettings({ ...settings, font_family_name: e.target.value })}
                  placeholder="e.g., Atkinson Hyperlegible Next"
                />
              </div>

              {settings.font_source === 'google' && (
                <div>
                  <Label htmlFor="google-url">Google Fonts URL</Label>
                  <Input
                    id="google-url"
                    value={settings.font_google_url || ''}
                    onChange={(e) => setSettings({ ...settings, font_google_url: e.target.value })}
                    placeholder="https://fonts.googleapis.com/css2?family=..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="fallback">Fallback Fonts (comma-separated)</Label>
                <Input
                  id="fallback"
                  value={settings.fallback_fonts.join(', ')}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    fallback_fonts: e.target.value.split(',').map(f => f.trim()) 
                  })}
                  placeholder="system-ui, -apple-system, sans-serif"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-background text-foreground">
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <div style={{ fontFamily: `${settings.font_family_name}, ${settings.fallback_fonts.join(', ')}` }}>
              <p className="text-4xl font-bold mb-4">The quick brown fox jumps over the lazy dog</p>
              <p className="text-2xl mb-4">ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz</p>
              <p className="text-lg mb-4">0123456789 !@#$%^&*()_+-=[]{}|;':",./&lt;&gt;?</p>
              <p className="text-base text-muted-foreground">
                This is how regular body text will appear on the website. The font is designed for maximum readability.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="mono" className="space-y-6">
          <Card className="p-6 bg-background text-foreground">
            <h3 className="text-xl font-semibold mb-4">Monospace Font (Code)</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="mono-source">Font Source</Label>
                <Select
                  value={settings.mono_font_source}
                  onValueChange={(value) => setSettings({ ...settings, mono_font_source: value })}
                >
                  <SelectTrigger id="mono-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google Fonts</SelectItem>
                    <SelectItem value="system">System Fonts</SelectItem>
                    <SelectItem value="self-hosted">Self-Hosted (Future)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mono-name">Font Family Name</Label>
                <Input
                  id="mono-name"
                  value={settings.mono_font_family_name}
                  onChange={(e) => setSettings({ ...settings, mono_font_family_name: e.target.value })}
                  placeholder="e.g., Atkinson Hyperlegible Mono"
                />
              </div>

              {settings.mono_font_source === 'google' && (
                <div>
                  <Label htmlFor="mono-google-url">Google Fonts URL</Label>
                  <Input
                    id="mono-google-url"
                    value={settings.mono_font_google_url || ''}
                    onChange={(e) => setSettings({ ...settings, mono_font_google_url: e.target.value })}
                    placeholder="https://fonts.googleapis.com/css2?family=..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="mono-fallback">Fallback Fonts (comma-separated)</Label>
                <Input
                  id="mono-fallback"
                  value={settings.mono_fallback_fonts.join(', ')}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mono_fallback_fonts: e.target.value.split(',').map(f => f.trim()) 
                  })}
                  placeholder="ui-monospace, SFMono-Regular, monospace"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-background text-foreground">
            <h3 className="text-xl font-semibold mb-4">Preview</h3>
            <div style={{ fontFamily: `${settings.mono_font_family_name}, ${settings.mono_fallback_fonts.join(', ')}` }}>
              <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
{`function calculateTotal(items) {
  return items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
}

const API_KEY = "abc123xyz789";
const result = calculateTotal([
  { name: "Widget", price: 10.50, quantity: 2 },
  { name: "Gadget", price: 25.00, quantity: 1 }
]);`}
              </pre>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FontManager;
