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
import { Type, Plus, Trash2, Save } from "lucide-react";
import { getTypographyClassWithSpecialStyles } from "@/lib/typography";

interface Heading {
  id: string;
  page_location: string;
  section: string;
  element_type: string;
  content: string;
  active: boolean;
  sort_order: number | null;
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

const elementTypeOptions = [
  { value: 'h1', label: 'Main Heading (H1)' },
  { value: 'h2', label: 'Section Heading (H2)' },
  { value: 'h3', label: 'Subsection Heading (H3)' },
  { value: 'h4', label: 'Minor Heading (H4)' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'description', label: 'Description' },
];

const HeadingManager = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>('all');
  const [newHeading, setNewHeading] = useState({
    page_location: 'index',
    section: 'hero',
    element_type: 'h1',
    content: '',
    active: true,
    sort_order: 0,
  });

  useEffect(() => {
    loadHeadings();
  }, []);

  const loadHeadings = async () => {
    try {
      const { data, error } = await supabase
        .from('headings')
        .select('*')
        .order('page_location', { ascending: true })
        .order('section', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setHeadings(data || []);
    } catch (error) {
      console.error('Error loading headings:', error);
      toast({
        title: "Error loading headings",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHeading = async (heading: Heading) => {
    setSavingId(heading.id);
    try {
      const { error } = await supabase
        .from('headings')
        .update({
          page_location: heading.page_location,
          section: heading.section,
          element_type: heading.element_type,
          content: heading.content,
          active: heading.active,
          sort_order: heading.sort_order,
        })
        .eq('id', heading.id);

      if (error) throw error;
      toast({
        title: "Heading updated",
        description: "Changes have been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving heading:', error);
      toast({
        title: "Error saving heading",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

  const createHeading = async () => {
    setCreatingNew(true);
    try {
      const { data, error } = await supabase
        .from('headings')
        .insert(newHeading)
        .select()
        .single();

      if (error) throw error;
      setHeadings([...headings, data]);
      setNewHeading({
        page_location: 'index',
        section: 'hero',
        element_type: 'h1',
        content: '',
        active: true,
        sort_order: headings.length,
      });
      toast({
        title: "Heading created",
        description: "New heading has been added successfully.",
      });
    } catch (error) {
      console.error('Error creating heading:', error);
      toast({
        title: "Error creating heading",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreatingNew(false);
    }
  };

  const deleteHeading = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setHeadings(headings.filter(h => h.id !== id));
      toast({
        title: "Heading deleted",
        description: "Heading has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting heading:', error);
      toast({
        title: "Error deleting heading",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateHeading = (id: string, field: keyof Heading, value: any) => {
    setHeadings(headings.map(heading => 
      heading.id === id ? { ...heading, [field]: value } : heading
    ));
  };

  const filteredHeadings = selectedPage === 'all' 
    ? headings 
    : headings.filter(h => h.page_location === selectedPage);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading headings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <Type className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-3xl font-bold text-foreground mb-2">Heading CMS</h2>
        <p className="text-muted-foreground">Manage all headings and subheadings across your website</p>
      </div>

      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Headings</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Filter by Page</CardTitle>
              <CardDescription>Select a page to view its headings</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Headings</CardTitle>
              <CardDescription>Edit existing headings and subheadings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
            <TableHead>Page</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Active</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHeadings.map((heading) => (
                    <TableRow key={heading.id}>
                      <TableCell>
                        <Select
                          value={heading.page_location}
                          onValueChange={(value) => updateHeading(heading.id, 'page_location', value)}
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
                          value={heading.section}
                          onValueChange={(value) => updateHeading(heading.id, 'section', value)}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sectionOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={heading.element_type}
                          onValueChange={(value) => updateHeading(heading.id, 'element_type', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {elementTypeOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={heading.content}
                          onChange={(e) => updateHeading(heading.id, 'content', e.target.value)}
                          className="min-w-[200px]"
                          rows={2}
                        />
                      </TableCell>
                       <TableCell>
                         <div className="min-w-[200px] max-w-[250px]">
                           {heading.element_type === 'h1' && (
                             <h1 className={`${getTypographyClassWithSpecialStyles('h1')} truncate`}>
                               {heading.content || 'Preview text'}
                             </h1>
                           )}
                           {heading.element_type === 'h2' && (
                             <h2 className={`${getTypographyClassWithSpecialStyles('h2')} truncate`}>
                               {heading.content || 'Preview text'}
                             </h2>
                           )}
                           {heading.element_type === 'h3' && (
                             <h3 className={`${getTypographyClassWithSpecialStyles('h3')} truncate`}>
                               {heading.content || 'Preview text'}
                             </h3>
                           )}
                           {heading.element_type === 'h4' && (
                             <h4 className={`${getTypographyClassWithSpecialStyles('h4')} truncate`}>
                               {heading.content || 'Preview text'}
                             </h4>
                           )}
                           {heading.element_type === 'subtitle' && (
                             <p className={`${getTypographyClassWithSpecialStyles('subtitle')} truncate`}>
                               {heading.content || 'Preview text'}
                             </p>
                           )}
                           {heading.element_type === 'description' && (
                             <p className={`${getTypographyClassWithSpecialStyles('description')} truncate`}>
                               {heading.content || 'Preview text'}
                             </p>
                           )}
                          </div>
                       </TableCell>
                       <TableCell>
                        <Switch
                          checked={heading.active}
                          onCheckedChange={(checked) => updateHeading(heading.id, 'active', checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={heading.sort_order || 0}
                          onChange={(e) => updateHeading(heading.id, 'sort_order', parseInt(e.target.value))}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => saveHeading(heading)}
                            disabled={savingId === heading.id}
                          >
                            <Save className="h-4 w-4" />
                            {savingId === heading.id ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteHeading(heading.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredHeadings.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        No headings found for the selected page.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Create New Heading</CardTitle>
              <CardDescription>Add a new heading or subheading</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Page Location</label>
                  <Select
                    value={newHeading.page_location}
                    onValueChange={(value) => setNewHeading({ ...newHeading, page_location: value })}
                  >
                    <SelectTrigger className="mt-1">
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
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Section</label>
                  <Select
                    value={newHeading.section}
                    onValueChange={(value) => setNewHeading({ ...newHeading, section: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Element Type</label>
                  <Select
                    value={newHeading.element_type}
                    onValueChange={(value) => setNewHeading({ ...newHeading, element_type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elementTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Content</label>
                <Textarea
                  value={newHeading.content}
                  onChange={(e) => setNewHeading({ ...newHeading, content: e.target.value })}
                  placeholder="Enter the heading text..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Sort Order</label>
                  <Input
                    type="number"
                    value={newHeading.sort_order}
                    onChange={(e) => setNewHeading({ ...newHeading, sort_order: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    checked={newHeading.active}
                    onCheckedChange={(checked) => setNewHeading({ ...newHeading, active: checked })}
                  />
                  <label className="text-sm font-medium text-foreground">Active</label>
                </div>
              </div>
              <Button onClick={createHeading} disabled={creatingNew || !newHeading.content}>
                <Plus className="mr-2 h-4 w-4" />
                {creatingNew ? "Creating..." : "Create Heading"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HeadingManager;