import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Trash2, Plus, Clock, Phone, Mail, MapPin } from "lucide-react";

interface ContactSettings {
  id?: string;
  form_title: string;
  form_description: string | null;
  get_in_touch_title: string;
  business_hours_title: string;
  show_contact_methods_tab: boolean;
  show_business_hours_tab: boolean;
}

interface ContactItem {
  id: string;
  title: string;
  value: string;
  icon_name: string;
  link_url: string | null;
  sort_order: number | null;
  active: boolean;
}

interface BusinessHour {
  id: string;
  day_name: string;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
  sort_order: number | null;
}

const defaultSettings: Omit<ContactSettings, "id"> = {
  form_title: "Send us a message",
  form_description: "Fill out the form below and we'll get back to you as soon as possible.",
  get_in_touch_title: "Get in touch",
  business_hours_title: "Business Hours",
  show_contact_methods_tab: true,
  show_business_hours_tab: true,
};

const defaultDays = [
  { name: "Monday", order: 1 },
  { name: "Tuesday", order: 2 },
  { name: "Wednesday", order: 3 },
  { name: "Thursday", order: 4 },
  { name: "Friday", order: 5 },
  { name: "Saturday", order: 6 },
  { name: "Sunday", order: 0 },
];

const iconOptions = [
  { name: "Mail", icon: Mail },
  { name: "Phone", icon: Phone },
  { name: "MapPin", icon: MapPin },
];

const ContactManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [contactItems, setContactItems] = useState<ContactItem[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);
  const [savingHourId, setSavingHourId] = useState<string | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    value: "",
    icon_name: "Mail",
    link_url: "",
    sort_order: 0,
    active: true,
  });
  
  // Tab visibility toggles
  const [showContactTab, setShowContactTab] = useState(true);
  const [showBusinessHoursTab, setShowBusinessHoursTab] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsRes, itemsRes, hoursRes] = await Promise.all([
        supabase.from('contact_settings').select('*').maybeSingle(),
        supabase.from('contact_items').select('*').order('sort_order', { ascending: true }),
        supabase.from('business_hours').select('*').order('sort_order', { ascending: true }),
      ]);

      if (settingsRes.data) {
        const settingsData = settingsRes.data as ContactSettings;
        setSettings(settingsData);
        setShowContactTab(settingsData.show_contact_methods_tab);
        setShowBusinessHoursTab(settingsData.show_business_hours_tab);
      }

      if (itemsRes.data) {
        setContactItems(itemsRes.data as ContactItem[]);
      }

      if (hoursRes.data) {
        setBusinessHours(hoursRes.data as BusinessHour[]);
      } else {
        // Initialize default business hours if none exist
        await initializeBusinessHours();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error loading data",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeBusinessHours = async () => {
    try {
      const defaultHours = defaultDays.map(day => ({
        day_name: day.name,
        open_time: day.name === 'Sunday' ? null : '9:00 AM',
        close_time: day.name === 'Sunday' ? null : '6:00 PM',
        closed: day.name === 'Sunday',
        sort_order: day.order,
      }));

      const { data, error } = await supabase
        .from('business_hours')
        .insert(defaultHours)
        .select();

      if (error) throw error;
      if (data) setBusinessHours(data as BusinessHour[]);
    } catch (error) {
      console.error('Error initializing business hours:', error);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data, error } = await supabase
        .from('contact_settings')
        .upsert(settings)
        .select()
        .single();

      if (error) throw error;
      setSettings(data as ContactSettings);
      toast({
        title: "Settings saved",
        description: "Contact settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const saveContactItem = async (item: ContactItem) => {
    setSavingItemId(item.id);
    try {
      const { error } = await supabase
        .from('contact_items')
        .update({
          title: item.title,
          value: item.value,
          icon_name: item.icon_name,
          link_url: item.link_url || null,
          sort_order: item.sort_order,
          active: item.active,
        })
        .eq('id', item.id);

      if (error) throw error;
      toast({
        title: "Contact item updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving contact item:', error);
      toast({
        title: "Error saving contact item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingItemId(null);
    }
  };

  const createContactItem = async () => {
    setCreatingItem(true);
    try {
      const { data, error } = await supabase
        .from('contact_items')
        .insert(newItem)
        .select()
        .single();

      if (error) throw error;
      setContactItems([...contactItems, data as ContactItem]);
      setNewItem({
        title: "",
        value: "",
        icon_name: "Mail",
        link_url: "",
        sort_order: contactItems.length,
        active: true,
      });
      toast({
        title: "Contact item created",
        description: "New contact item has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating contact item:', error);
      toast({
        title: "Error creating contact item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingItem(false);
    }
  };

  const deleteContactItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContactItems(contactItems.filter(item => item.id !== id));
      toast({
        title: "Contact item deleted",
        description: "Contact item has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting contact item:', error);
      toast({
        title: "Error deleting contact item",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveBusinessHour = async (hour: BusinessHour) => {
    setSavingHourId(hour.id);
    try {
      const { error } = await supabase
        .from('business_hours')
        .update({
          open_time: hour.open_time,
          close_time: hour.close_time,
          closed: hour.closed,
        })
        .eq('id', hour.id);

      if (error) throw error;
      toast({
        title: "Business hours updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving business hours:', error);
      toast({
        title: "Error saving business hours",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingHourId(null);
    }
  };

  const updateContactItem = (id: string, field: keyof ContactItem, value: any) => {
    setContactItems(contactItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const updateBusinessHour = (id: string, field: keyof BusinessHour, value: any) => {
    setBusinessHours(businessHours.map(hour => 
      hour.id === id ? { ...hour, [field]: value } : hour
    ));
  };

  const updateTabVisibility = async (field: 'show_contact_methods_tab' | 'show_business_hours_tab', value: boolean) => {
    try {
      const updatedSettings = { ...settings, [field]: value };
      setSettings(updatedSettings);
      
      const { error } = await supabase
        .from('contact_settings')
        .upsert(updatedSettings);

      if (error) throw error;
      
      toast({
        title: "Tab visibility updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating tab visibility:', error);
      toast({
        title: "Error updating tab visibility",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading contact settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <MessageCircle className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Contact CMS</h2>
        <p className="text-muted-foreground">Manage contact form settings, contact methods, and business hours</p>
      </div>

      {/* Tab visibility controls */}
      <Card className="bg-background text-foreground border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Tab Visibility</CardTitle>
          <CardDescription>Toggle which tabs are visible in the Contact CMS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Show Contact Methods Tab</label>
            <Switch
              checked={showContactTab}
              onCheckedChange={(checked) => {
                setShowContactTab(checked);
                updateTabVisibility('show_contact_methods_tab', checked);
              }}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Show Business Hours Tab</label>
            <Switch
              checked={showBusinessHoursTab}
              onCheckedChange={(checked) => {
                setShowBusinessHoursTab(checked);
                updateTabVisibility('show_business_hours_tab', checked);
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className={`grid w-full ${
          showContactTab && showBusinessHoursTab ? 'grid-cols-3' : 
          showContactTab || showBusinessHoursTab ? 'grid-cols-2' : 
          'grid-cols-1'
        }`}>
          <TabsTrigger value="settings">Form Settings</TabsTrigger>
          {showContactTab && <TabsTrigger value="contact">Contact Methods</TabsTrigger>}
          {showBusinessHoursTab && <TabsTrigger value="hours">Business Hours</TabsTrigger>}
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-background text-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Contact Form Settings</CardTitle>
              <CardDescription>Configure the titles and descriptions for your contact page sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Form Title</label>
                <Input
                  value={settings.form_title}
                  onChange={(e) => setSettings({ ...settings, form_title: e.target.value })}
                  placeholder="Send us a message"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Form Description</label>
                <Textarea
                  value={settings.form_description || ""}
                  onChange={(e) => setSettings({ ...settings, form_description: e.target.value })}
                  placeholder="Fill out the form below and we'll get back to you as soon as possible."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Get In Touch Title</label>
                <Input
                  value={settings.get_in_touch_title}
                  onChange={(e) => setSettings({ ...settings, get_in_touch_title: e.target.value })}
                  placeholder="Get in touch"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Business Hours Title</label>
                <Input
                  value={settings.business_hours_title}
                  onChange={(e) => setSettings({ ...settings, business_hours_title: e.target.value })}
                  placeholder="Business Hours"
                  className="mt-1"
                />
              </div>
              <Button onClick={saveSettings} disabled={savingSettings}>
                {savingSettings ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {showContactTab && <TabsContent value="contact" className="space-y-6">
          <Card className="bg-background text-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Add New Contact Method</CardTitle>
              <CardDescription>Create a new contact item for the "Get in touch" section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Email"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Value</label>
                  <Input
                    value={newItem.value}
                    onChange={(e) => setNewItem({ ...newItem, value: e.target.value })}
                    placeholder="hello@company.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Icon</label>
                  <Select
                    value={newItem.icon_name}
                    onValueChange={(value) => setNewItem({ ...newItem, icon_name: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <icon.icon className="h-4 w-4" />
                            {icon.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Link URL (optional)</label>
                  <Input
                    value={newItem.link_url}
                    onChange={(e) => setNewItem({ ...newItem, link_url: e.target.value })}
                    placeholder="mailto:hello@company.com"
                    className="mt-1"
                  />
                </div>
              </div>
              <Button onClick={createContactItem} disabled={creatingItem || !newItem.title || !newItem.value}>
                <Plus className="mr-2 h-4 w-4" />
                {creatingItem ? "Creating..." : "Create Contact Item"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-background text-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Contact Methods</CardTitle>
              <CardDescription>Manage existing contact methods</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead>Link URL</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contactItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.title}
                          onChange={(e) => updateContactItem(item.id, 'title', e.target.value)}
                          className="max-w-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.value}
                          onChange={(e) => updateContactItem(item.id, 'value', e.target.value)}
                          className="max-w-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={item.icon_name}
                          onValueChange={(value) => updateContactItem(item.id, 'icon_name', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map(icon => (
                              <SelectItem key={icon.name} value={icon.name}>
                                <div className="flex items-center gap-2">
                                  <icon.icon className="h-4 w-4" />
                                  {icon.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.link_url || ""}
                          onChange={(e) => updateContactItem(item.id, 'link_url', e.target.value)}
                          className="max-w-xs"
                          placeholder="Optional"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.active}
                          onCheckedChange={(checked) => updateContactItem(item.id, 'active', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveContactItem(item)}
                            disabled={savingItemId === item.id}
                          >
                            {savingItemId === item.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteContactItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>}

        {showBusinessHoursTab && <TabsContent value="hours" className="space-y-6">
          <Card className="bg-background text-foreground border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Business Hours</CardTitle>
              <CardDescription>Configure your business hours for each day of the week</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Open Time</TableHead>
                    <TableHead>Close Time</TableHead>
                    <TableHead>Closed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {businessHours.map((hour) => (
                    <TableRow key={hour.id}>
                      <TableCell className="font-medium">{hour.day_name}</TableCell>
                      <TableCell>
                        <Input
                          value={hour.open_time || ""}
                          onChange={(e) => updateBusinessHour(hour.id, 'open_time', e.target.value)}
                          disabled={hour.closed}
                          placeholder="9:00 AM"
                          className="max-w-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={hour.close_time || ""}
                          onChange={(e) => updateBusinessHour(hour.id, 'close_time', e.target.value)}
                          disabled={hour.closed}
                          placeholder="6:00 PM"
                          className="max-w-xs"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={hour.closed}
                          onCheckedChange={(checked) => {
                            updateBusinessHour(hour.id, 'closed', checked);
                            if (checked) {
                              updateBusinessHour(hour.id, 'open_time', null);
                              updateBusinessHour(hour.id, 'close_time', null);
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => saveBusinessHour(hour)}
                          disabled={savingHourId === hour.id}
                        >
                          {savingHourId === hour.id ? "Saving..." : "Save"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>}
      </Tabs>
    </div>
  );
};

export default ContactManager;