import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import IconPicker from "./IconPicker";

interface ContactInfo {
  icon: string;
  title: string;
  value: string;
  link?: string | null;
  [key: string]: any;
}

interface FooterLink {
  title: string;
  url: string;
  active: boolean;
  [key: string]: any;
}

interface FooterSettings {
  id?: string;
  company_name: string;
  company_description?: string | null;
  contact_info: ContactInfo[];
  quick_links: FooterLink[];
  legal_links: FooterLink[];
  copyright_text?: string | null;
}

const FooterManager = () => {
  const [settings, setSettings] = useState<FooterSettings>({
    company_name: "Navio",
    company_description: "",
    contact_info: [],
    quick_links: [],
    legal_links: [],
    copyright_text: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("footer_settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          id: data.id,
          company_name: data.company_name,
          company_description: data.company_description,
          contact_info: (data.contact_info as ContactInfo[]) || [],
          quick_links: (data.quick_links as FooterLink[]) || [],
          legal_links: (data.legal_links as FooterLink[]) || [],
          copyright_text: data.copyright_text,
        });
      }
    } catch (error) {
      console.error("Error fetching footer settings:", error);
      toast.error("Failed to load footer settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = settings.id
        ? await supabase
            .from("footer_settings")
            .update({
              company_name: settings.company_name,
              company_description: settings.company_description,
              contact_info: settings.contact_info as any,
              quick_links: settings.quick_links as any,
              legal_links: settings.legal_links as any,
              copyright_text: settings.copyright_text,
            })
            .eq("id", settings.id)
        : await supabase
            .from("footer_settings")
            .insert([{
              company_name: settings.company_name,
              company_description: settings.company_description,
              contact_info: settings.contact_info as any,
              quick_links: settings.quick_links as any,
              legal_links: settings.legal_links as any,
              copyright_text: settings.copyright_text,
            }]);

      if (error) throw error;

      toast.success("Footer settings saved successfully!");
      
      if (!settings.id) {
        fetchSettings(); // Refresh to get the ID
      }
    } catch (error) {
      console.error("Error saving footer settings:", error);
      toast.error("Failed to save footer settings");
    } finally {
      setSaving(false);
    }
  };

  const addContactInfo = () => {
    setSettings(prev => ({
      ...prev,
      contact_info: [...prev.contact_info, { icon: "Mail", title: "", value: "", link: "" }]
    }));
  };

  const updateContactInfo = (index: number, field: keyof ContactInfo, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact_info: prev.contact_info.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContactInfo = (index: number) => {
    setSettings(prev => ({
      ...prev,
      contact_info: prev.contact_info.filter((_, i) => i !== index)
    }));
  };

  const addQuickLink = () => {
    setSettings(prev => ({
      ...prev,
      quick_links: [...prev.quick_links, { title: "", url: "", active: true }]
    }));
  };

  const updateQuickLink = (index: number, field: keyof FooterLink, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      quick_links: prev.quick_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeQuickLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      quick_links: prev.quick_links.filter((_, i) => i !== index)
    }));
  };

  const addLegalLink = () => {
    setSettings(prev => ({
      ...prev,
      legal_links: [...prev.legal_links, { title: "", url: "", active: true }]
    }));
  };

  const updateLegalLink = (index: number, field: keyof FooterLink, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      legal_links: prev.legal_links.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeLegalLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      legal_links: prev.legal_links.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <div className="p-4">Loading footer settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-background text-foreground">
        <CardHeader>
          <CardTitle>Footer Configuration</CardTitle>
          <CardDescription>
            Manage company information, contact details, and footer links.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Company Information</Label>
            <p className="text-sm text-muted-foreground">
              💡 Tip: These fields support direct text or translation keys (e.g., footer.company_name). 
              Translation keys will be automatically translated based on the user's language.
            </p>
            
            <div>
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={settings.company_name}
                onChange={(e) => setSettings(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Navio or footer.company_name"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Current translations managed in Translation Manager
              </p>
            </div>

            <div>
              <Label htmlFor="company-description">Company Description</Label>
              <Textarea
                id="company-description"
                value={settings.company_description || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, company_description: e.target.value }))}
                placeholder="Direct text or footer.company_description"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use footer.company_description for multilingual support
              </p>
            </div>

            <div>
              <Label htmlFor="copyright-text">Copyright Text</Label>
              <Input
                id="copyright-text"
                value={settings.copyright_text || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, copyright_text: e.target.value }))}
                placeholder="Direct text or footer.copyright"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use footer.copyright for multilingual support
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Contact Information</Label>
              <Button onClick={addContactInfo} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 Use translation keys like footer.contact.email_label for multilingual labels. 
              Empty strings will show icon only.
            </p>
            
            {settings.contact_info.map((contact, index) => (
              <Card key={index} className="bg-background text-foreground">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor={`contact-icon-${index}`}>Icon</Label>
                      <IconPicker
                        value={contact.icon}
                        onChange={(icon) => updateContactInfo(index, 'icon', icon)}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`contact-title-${index}`}>Title / Translation Key</Label>
                      <Input
                        id={`contact-title-${index}`}
                        value={contact.title}
                        onChange={(e) => updateContactInfo(index, 'title', e.target.value)}
                        placeholder="footer.contact.email_label (or direct text)"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to show icon only
                      </p>
                    </div>
                    <div>
                      <Label htmlFor={`contact-value-${index}`}>Value</Label>
                      <Input
                        id={`contact-value-${index}`}
                        value={contact.value}
                        onChange={(e) => updateContactInfo(index, 'value', e.target.value)}
                        placeholder="contact@company.com"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor={`contact-link-${index}`}>Link (optional)</Label>
                        <Input
                          id={`contact-link-${index}`}
                          value={contact.link || ""}
                          onChange={(e) => updateContactInfo(index, 'link', e.target.value)}
                          placeholder="mailto:contact@company.com"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContactInfo(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Quick Links</Label>
              <Button onClick={addQuickLink} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 Use translation keys like footer.links.pricing for multilingual link titles
            </p>
            
            {settings.quick_links.map((link, index) => (
              <Card key={index} className="bg-background text-foreground">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`quick-title-${index}`}>Title / Translation Key</Label>
                        <Input
                          id={`quick-title-${index}`}
                          value={link.title}
                          onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                          placeholder="footer.links.home (or direct text)"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`quick-url-${index}`}>URL</Label>
                        <Input
                          id={`quick-url-${index}`}
                          value={link.url}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                          placeholder="#home"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={link.active}
                        onCheckedChange={(checked) => updateQuickLink(index, 'active', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuickLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Legal Links */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Legal Links</Label>
              <Button onClick={addLegalLink} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              💡 Use translation keys like footer.legal.privacy_policy for multilingual link titles
            </p>
            
            {settings.legal_links.map((link, index) => (
              <Card key={index} className="bg-background text-foreground">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`legal-title-${index}`}>Title / Translation Key</Label>
                        <Input
                          id={`legal-title-${index}`}
                          value={link.title}
                          onChange={(e) => updateLegalLink(index, 'title', e.target.value)}
                          placeholder="footer.legal.privacy_policy (or direct text)"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`legal-url-${index}`}>URL</Label>
                        <Input
                          id={`legal-url-${index}`}
                          value={link.url}
                          onChange={(e) => updateLegalLink(index, 'url', e.target.value)}
                          placeholder="#privacy"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={link.active}
                        onCheckedChange={(checked) => updateLegalLink(index, 'active', checked)}
                      />
                      <Label>Active</Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLegalLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Footer Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default FooterManager;