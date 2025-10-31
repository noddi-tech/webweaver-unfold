import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NavigationChild {
  title: string;
  url: string;
  active: boolean;
  description?: string;
}

interface NavigationLink {
  title: string;
  url?: string;
  active: boolean;
  type: 'link' | 'static-dropdown' | 'dynamic-dropdown';
  children?: NavigationChild[];
  collection?: string;
  [key: string]: any;
}

interface HeaderSettings {
  id?: string;
  navigation_links: NavigationLink[];
  show_auth_buttons: boolean;
  sign_in_text: string;
  get_started_text: string;
  show_global_usp_bar: boolean;
}

const HeaderManager = () => {
  const [settings, setSettings] = useState<HeaderSettings>({
    navigation_links: [],
    show_auth_buttons: true,
    sign_in_text: "Sign In",
    get_started_text: "Get Started",
    show_global_usp_bar: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("header_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          navigation_links: (data.navigation_links as NavigationLink[]) || [],
          show_auth_buttons: data.show_auth_buttons,
          sign_in_text: data.sign_in_text,
          get_started_text: data.get_started_text,
          show_global_usp_bar: data.show_global_usp_bar,
        });
      }
    } catch (error) {
      console.error("Error fetching header settings:", error);
      toast.error("Failed to load header settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = settings.id
        ? await supabase
            .from("header_settings")
            .update({
              navigation_links: settings.navigation_links,
              show_auth_buttons: settings.show_auth_buttons,
              sign_in_text: settings.sign_in_text,
              get_started_text: settings.get_started_text,
              show_global_usp_bar: settings.show_global_usp_bar,
            })
            .eq("id", settings.id)
        : await supabase
            .from("header_settings")
            .insert([{
              navigation_links: settings.navigation_links,
              show_auth_buttons: settings.show_auth_buttons,
              sign_in_text: settings.sign_in_text,
              get_started_text: settings.get_started_text,
              show_global_usp_bar: settings.show_global_usp_bar,
            }]);

      if (error) throw error;

      toast.success("Header settings saved successfully!");
      
      if (!settings.id) {
        fetchSettings(); // Refresh to get the ID
      }
    } catch (error) {
      console.error("Error saving header settings:", error);
      toast.error("Failed to save header settings");
    } finally {
      setSaving(false);
    }
  };

  const addNavigationLink = () => {
    setSettings(prev => ({
      ...prev,
      navigation_links: [...prev.navigation_links, { title: "", url: "", active: true, type: 'link' }]
    }));
  };

  const addChildLink = (parentIndex: number) => {
    setSettings(prev => ({
      ...prev,
      navigation_links: prev.navigation_links.map((link, i) => 
        i === parentIndex 
          ? { ...link, children: [...(link.children || []), { title: "", url: "", active: true }] }
          : link
      )
    }));
  };

  const updateChildLink = (parentIndex: number, childIndex: number, field: keyof NavigationChild, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      navigation_links: prev.navigation_links.map((link, i) => 
        i === parentIndex 
          ? {
              ...link,
              children: (link.children || []).map((child, j) => 
                j === childIndex ? { ...child, [field]: value } : child
              )
            }
          : link
      )
    }));
  };

  const removeChildLink = (parentIndex: number, childIndex: number) => {
    setSettings(prev => ({
      ...prev,
      navigation_links: prev.navigation_links.map((link, i) => 
        i === parentIndex 
          ? { ...link, children: (link.children || []).filter((_, j) => j !== childIndex) }
          : link
      )
    }));
  };

  const updateNavigationLink = (index: number, field: keyof NavigationLink, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      navigation_links: prev.navigation_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeNavigationLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      navigation_links: prev.navigation_links.filter((_, i) => i !== index)
    }));
  };

  const moveNavigationLink = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= settings.navigation_links.length) return;

    setSettings(prev => {
      const newLinks = [...prev.navigation_links];
      [newLinks[index], newLinks[newIndex]] = [newLinks[newIndex], newLinks[index]];
      return { ...prev, navigation_links: newLinks };
    });
  };

  if (loading) {
    return <div className="p-4">Loading header settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Configuration</CardTitle>
          <CardDescription>
            Manage navigation links, authentication buttons, and global settings for the header.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Navigation Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Navigation Links</Label>
              <Button onClick={addNavigationLink} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            
            {settings.navigation_links.map((link, index) => (
              <Card key={index}>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2 cursor-grab">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveNavigationLink(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveNavigationLink(index, 'down')}
                        disabled={index === settings.navigation_links.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`title-${index}`}>Title</Label>
                          <Input
                            id={`title-${index}`}
                            value={link.title}
                            onChange={(e) => updateNavigationLink(index, 'title', e.target.value)}
                            placeholder="Features"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`type-${index}`}>Type</Label>
                          <Select
                            value={link.type || 'link'}
                            onValueChange={(value) => updateNavigationLink(index, 'type', value)}
                          >
                            <SelectTrigger id={`type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="link">Link</SelectItem>
                              <SelectItem value="static-dropdown">Static Dropdown</SelectItem>
                              <SelectItem value="dynamic-dropdown">Dynamic Dropdown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {link.type === 'dynamic-dropdown' && (
                          <div>
                            <Label htmlFor={`collection-${index}`}>Collection</Label>
                            <Select
                              value={link.collection || ''}
                              onValueChange={(value) => updateNavigationLink(index, 'collection', value)}
                            >
                              <SelectTrigger id={`collection-${index}`}>
                                <SelectValue placeholder="Select collection" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="solutions">Solutions</SelectItem>
                                <SelectItem value="features">Features</SelectItem>
                                <SelectItem value="pages">Pages</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        {link.type === 'link' && (
                          <div>
                            <Label htmlFor={`url-${index}`}>URL</Label>
                            <Input
                              id={`url-${index}`}
                              value={link.url || ''}
                              onChange={(e) => updateNavigationLink(index, 'url', e.target.value)}
                              placeholder="/features"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={link.active}
                        onCheckedChange={(checked) => updateNavigationLink(index, 'active', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNavigationLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Dropdown Children */}
                  {link.type === 'static-dropdown' && (
                    <div className="ml-16 space-y-2 border-l-2 border-border pl-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Dropdown Items</Label>
                        <Button onClick={() => addChildLink(index)} size="sm" variant="outline">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Item
                        </Button>
                      </div>
                      
                      {(link.children || []).map((child, childIndex) => (
                        <div key={childIndex} className="p-3 bg-muted/50 rounded-md space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`child-title-${index}-${childIndex}`} className="text-xs">Title</Label>
                              <Input
                                id={`child-title-${index}-${childIndex}`}
                                value={child.title}
                                onChange={(e) => updateChildLink(index, childIndex, 'title', e.target.value)}
                                placeholder="Tire Services"
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`child-url-${index}-${childIndex}`} className="text-xs">URL</Label>
                              <Input
                                id={`child-url-${index}-${childIndex}`}
                                value={child.url}
                                onChange={(e) => updateChildLink(index, childIndex, 'url', e.target.value)}
                                placeholder="/solutions/tire-services"
                                className="h-8"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`child-desc-${index}-${childIndex}`} className="text-xs">Description (optional)</Label>
                            <Input
                              id={`child-desc-${index}-${childIndex}`}
                              value={child.description || ''}
                              onChange={(e) => updateChildLink(index, childIndex, 'description', e.target.value)}
                              placeholder="Complete tire management and sales"
                              className="h-8"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={child.active}
                                onCheckedChange={(checked) => updateChildLink(index, childIndex, 'active', checked)}
                              />
                              <Label className="text-xs">Active</Label>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeChildLink(index, childIndex)}
                              className="text-destructive hover:text-destructive h-7"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Authentication Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Authentication</Label>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-auth"
                checked={settings.show_auth_buttons}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_auth_buttons: checked }))}
              />
              <Label htmlFor="show-auth">Show authentication buttons</Label>
            </div>

            {settings.show_auth_buttons && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sign-in-text">Sign In Button Text</Label>
                  <Input
                    id="sign-in-text"
                    value={settings.sign_in_text}
                    onChange={(e) => setSettings(prev => ({ ...prev, sign_in_text: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="get-started-text">Get Started Button Text</Label>
                  <Input
                    id="get-started-text"
                    value={settings.get_started_text}
                    onChange={(e) => setSettings(prev => ({ ...prev, get_started_text: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Global Settings */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Global Features</Label>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-usp-bar"
                checked={settings.show_global_usp_bar}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, show_global_usp_bar: checked }))}
              />
              <Label htmlFor="show-usp-bar">Show Global USP Bar</Label>
            </div>
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Header Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeaderManager;