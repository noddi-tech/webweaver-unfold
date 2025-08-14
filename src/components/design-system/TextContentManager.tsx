import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import EmojiPicker from "@/components/ui/emoji-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, Plus, Trash2, Save } from "lucide-react";
import { TYPOGRAPHY_SCALE } from "@/lib/typography";
import { getColorTokenOptions, getColorClass } from "@/lib/colorUtils";

interface TextContent {
  id: string;
  page_location: string;
  section: string;
  element_type: string;
  content: string;
  active: boolean;
  sort_order: number | null;
  color_token?: string;
  content_type: string;
}

const pageOptions = [
  { value: 'index', label: 'Home/Landing Page' },
  { value: 'features', label: 'Features Page' },
  { value: 'demo', label: 'Demo Page' },
  { value: 'team', label: 'Team Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'auth', label: 'Auth Page' },
];

const sectionOptions = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'main', label: 'Main Content' },
  { value: 'footer', label: 'Footer' },
  { value: 'nav', label: 'Navigation' },
];

// Content type configurations
const contentTypeConfigs = {
  heading: {
    label: 'Headings',
    description: 'Main headings and subheadings (H1-H6)',
    elementTypes: TYPOGRAPHY_SCALE.headings.map(heading => ({
      value: heading.tag,
      label: `${heading.sample} (${heading.tag.toUpperCase()})`,
      class: heading.class,
      description: heading.description
    }))
  },
  button: {
    label: 'Buttons & CTAs',
    description: 'Button text and call-to-action labels',
    elementTypes: [
      { value: 'cta', label: 'Call to Action Button', class: 'text-sm font-medium', description: 'Primary action button text' },
      { value: 'button', label: 'Secondary Button', class: 'text-sm font-medium', description: 'Secondary button text' },
      { value: 'link', label: 'Text Link', class: 'text-sm font-medium underline', description: 'Clickable text link' },
    ]
  },
  paragraph: {
    label: 'Paragraphs',
    description: 'Body text and descriptions',
    elementTypes: TYPOGRAPHY_SCALE.bodyText.map(body => ({
      value: body.name.toLowerCase().replace(' ', '_'),
      label: body.name,
      class: body.class,
      description: `Body text: ${body.sample.substring(0, 30)}...`
    }))
  },
  label: {
    label: 'Labels & Captions',
    description: 'Form labels, captions, and small text',
    elementTypes: [
      { value: 'label', label: 'Form Label', class: 'text-sm font-medium', description: 'Input field labels' },
      { value: 'caption', label: 'Caption Text', class: 'text-xs text-muted-foreground', description: 'Image captions, help text' },
      { value: 'badge', label: 'Badge Text', class: 'text-xs font-semibold', description: 'Status badges, tags' },
    ]
  },
  text: {
    label: 'Other Text',
    description: 'Miscellaneous text content',
    elementTypes: TYPOGRAPHY_SCALE.specialStyles.map(special => ({
      value: special.name.toLowerCase().replace(' ', '_'),
      label: special.name,
      class: special.class,
      description: `Special: ${special.sample}`
    }))
  }
};

const colorTokenOptions = getColorTokenOptions();

const TextContentManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [textContent, setTextContent] = useState<TextContent[]>([]);
  const [sections, setSections] = useState<{name: string, display_name: string}[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [selectedContentType, setSelectedContentType] = useState<string>('heading');
  const [newTextContent, setNewTextContent] = useState({
    page_location: 'index',
    section: '',
    element_type: 'h1',
    content: '',
    active: true,
    sort_order: 0,
    color_token: 'foreground',
    content_type: 'heading',
  });

  useEffect(() => {
    loadTextContent();
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('name, display_name')
        .eq('active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  };

  const loadTextContent = async () => {
    try {
      const { data, error } = await supabase
        .from('text_content')
        .select('*')
        .order('page_location', { ascending: true })
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTextContent(data || []);
    } catch (error) {
      console.error('Error loading text content:', error);
      toast({
        title: "Error loading text content",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTextContent = async (item: TextContent) => {
    setSavingId(item.id);
    try {
      const { error } = await supabase
        .from('text_content')
        .update({
          page_location: item.page_location,
          section: item.section,
          element_type: item.element_type,
          content: item.content,
          active: item.active,
          sort_order: item.sort_order,
          color_token: item.color_token,
          content_type: item.content_type,
        })
        .eq('id', item.id);

      if (error) throw error;
      toast({
        title: "Text content updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving text content:', error);
      toast({
        title: "Error saving text content",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const createTextContent = async () => {
    setCreatingNew(true);
    try {
      const { data, error } = await supabase
        .from('text_content')
        .insert(newTextContent)
        .select()
        .single();

      if (error) throw error;
      setTextContent([...textContent, data]);
      setNewTextContent({
        page_location: 'index',
        section: '',
        element_type: contentTypeConfigs[selectedContentType].elementTypes[0].value,
        content: '',
        active: true,
        sort_order: textContent.length,
        color_token: 'foreground',
        content_type: selectedContentType,
      });
      toast({
        title: "Text content created",
        description: "New text content has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating text content:', error);
      toast({
        title: "Error creating text content",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingNew(false);
    }
  };

  const deleteTextContent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('text_content')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTextContent(textContent.filter(item => item.id !== id));
      toast({
        title: "Text content deleted",
        description: "Text content has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting text content:', error);
      toast({
        title: "Error deleting text content",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateTextContent = (id: string, field: keyof TextContent, value: any) => {
    setTextContent(textContent.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const filteredTextContent = textContent.filter(item => {
    const pageMatch = selectedPage === 'all' || item.page_location === selectedPage;
    const typeMatch = selectedContentType === 'all' || item.content_type === selectedContentType;
    return pageMatch && typeMatch;
  });

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading text content...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Type className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Text Content CMS</h2>
        <p className="text-muted-foreground">Manage all text content across your website - headings, buttons, paragraphs, and labels</p>
      </div>

      <Tabs defaultValue="headings" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="headings" onClick={() => setSelectedContentType('heading')}>
            Headings
          </TabsTrigger>
          <TabsTrigger value="buttons" onClick={() => setSelectedContentType('button')}>
            Buttons
          </TabsTrigger>
          <TabsTrigger value="paragraphs" onClick={() => setSelectedContentType('paragraph')}>
            Paragraphs
          </TabsTrigger>
          <TabsTrigger value="labels" onClick={() => setSelectedContentType('label')}>
            Labels
          </TabsTrigger>
          <TabsTrigger value="other" onClick={() => setSelectedContentType('text')}>
            Other
          </TabsTrigger>
        </TabsList>

        {Object.entries(contentTypeConfigs).map(([contentType, config]) => (
          <TabsContent key={contentType} value={contentType === 'heading' ? 'headings' : contentType === 'button' ? 'buttons' : contentType === 'paragraph' ? 'paragraphs' : contentType === 'label' ? 'labels' : 'other'} className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{config.label}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Filter by Page</label>
                    <Select value={selectedPage} onValueChange={setSelectedPage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pages</SelectItem>
                        {pageOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Add New {config.label.slice(0, -1)}</label>
                    <Button
                      onClick={() => {
                        setNewTextContent({
                          ...newTextContent,
                          content_type: contentType,
                          element_type: config.elementTypes[0].value
                        });
                        createTextContent();
                      }}
                      disabled={creatingNew}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {creatingNew ? "Creating..." : `Add ${config.label.slice(0, -1)}`}
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTextContent.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select
                            value={item.page_location}
                            onValueChange={(value) => updateTextContent(item.id, 'page_location', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {pageOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.section}
                            onValueChange={(value) => updateTextContent(item.id, 'section', value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {sections.map(section => (
                                <SelectItem key={section.name} value={section.name}>
                                  {section.display_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.element_type}
                            onValueChange={(value) => updateTextContent(item.id, 'element_type', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config.elementTypes.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 min-w-[200px]">
                            <Textarea
                              value={item.content}
                              onChange={(e) => updateTextContent(item.id, 'content', e.target.value)}
                              className="flex-1"
                              rows={2}
                            />
                            <EmojiPicker onSelect={(emoji) => updateTextContent(item.id, 'content', item.content + emoji)} />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={item.color_token || 'foreground'}
                            onValueChange={(value) => updateTextContent(item.id, 'color_token', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colorTokenOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[200px] max-w-[250px]">
                            {(() => {
                              const elementOption = config.elementTypes.find(opt => opt.value === item.element_type);
                              const className = elementOption?.class || 'text-base';
                              const colorClass = getColorClass(item.color_token, 'foreground');
                              const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(item.element_type);
                              
                              if (isHeading) {
                                const HeadingTag = item.element_type as keyof JSX.IntrinsicElements;
                                return (
                                  <HeadingTag className={`${className} ${colorClass} truncate`}>
                                    {item.content || 'Preview text'}
                                  </HeadingTag>
                                );
                              } else {
                                return (
                                  <p className={`${className} ${colorClass} truncate`}>
                                    {item.content || 'Preview text'}
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={item.active}
                            onCheckedChange={(checked) => updateTextContent(item.id, 'active', checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.sort_order || 0}
                            onChange={(e) => updateTextContent(item.id, 'sort_order', parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => saveTextContent(item)}
                              disabled={savingId === item.id}
                            >
                              <Save className="h-4 w-4" />
                              {savingId === item.id ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteTextContent(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTextContent.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          No {config.label.toLowerCase()} found for the selected page.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TextContentManager;