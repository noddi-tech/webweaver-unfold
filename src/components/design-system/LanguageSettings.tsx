import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LanguageSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const { data } = await supabase
      .from('language_settings')
      .select('*')
      .single();
    if (data) setSettings(data);
    setLoading(false);
  }

  async function handleSave() {
    const { error } = await supabase
      .from('language_settings')
      .update(settings)
      .eq('id', settings.id);

    if (error) {
      toast({ title: 'Error saving settings', variant: 'destructive' });
    } else {
      toast({ title: 'Settings saved successfully' });
    }
  }

  if (loading || !settings) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Detection & Display Settings</CardTitle>
        <CardDescription>Configure how language selection and detection works on your site</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="browser-detection">Enable Browser Language Detection</Label>
            <p className="text-sm text-muted-foreground">
              Automatically detect user's browser language on first visit
            </p>
          </div>
          <Switch
            id="browser-detection"
            checked={settings.enable_browser_detection}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, enable_browser_detection: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="header-switcher">Show Language Switcher in Header</Label>
            <p className="text-sm text-muted-foreground">
              Display language dropdown in navigation header
            </p>
          </div>
          <Switch
            id="header-switcher"
            checked={settings.show_language_switcher_header}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, show_language_switcher_header: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="footer-switcher">Show Language Switcher in Footer</Label>
            <p className="text-sm text-muted-foreground">
              Display language selection in page footer
            </p>
          </div>
          <Switch
            id="footer-switcher"
            checked={settings.show_language_switcher_footer}
            onCheckedChange={(checked) => 
              setSettings({ ...settings, show_language_switcher_footer: checked })
            }
          />
        </div>

        <Button onClick={handleSave}>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
