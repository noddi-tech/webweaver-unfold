import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowUp, ArrowDown, Eye, Plus, Trash2, ChevronDown, ChevronRight, Image, Video, Users, Sparkles, Star } from "lucide-react";

interface Section {
  id: string;
  name: string;
  display_name: string;
  page_location: string;
  position_after: string | null;
  position_before: string | null;
  background_token: string;
  text_token: string;
  padding_token: string;
  margin_token: string;
  max_width_token: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface SectionContent {
  features: any[];
  images: any[];
  videos: any[];
  usps: any[];
  employees: any[];
}

const DESIGN_TOKENS = {
  background: ['background', 'card', 'muted', 'primary', 'secondary', 'accent'],
  text: ['foreground', 'muted-foreground', 'primary', 'secondary', 'accent-foreground'],
  padding: ['none', 'sm', 'md', 'lg', 'xl', 'section'],
  margin: ['none', 'sm', 'md', 'lg', 'xl'],
  maxWidth: ['container', 'sm', 'md', 'lg', 'xl', 'full']
};

const PAGE_LOCATIONS = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'features', label: 'Features Page' },
  { value: 'team', label: 'Team Page' },
  { value: 'contact', label: 'Contact Page' },
  { value: 'demo', label: 'Demo Page' }
];

const SectionsManager = () => {
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionContent, setSectionContent] = useState<Record<string, SectionContent>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [newSection, setNewSection] = useState({
    name: '',
    display_name: '',
    page_location: 'homepage',
    position_after: '',
    background_token: 'background',
    text_token: 'foreground',
    padding_token: 'section',
    margin_token: 'none',
    max_width_token: 'container'
  });

  useEffect(() => {
    fetchSections();
    fetchSectionContent();
  }, []);

  const fetchSectionContent = async () => {
    try {
      const [employeeSections, videoSections, imageSections, features, usps] = await Promise.all([
        supabase.from('employees_sections').select('*').order('sort_order'),
        supabase.from('video_sections').select('*').order('sort_order'),
        supabase.from('image_sections').select('*').order('sort_order'),
        supabase.from('features').select('*').order('sort_order'),
        supabase.from('usps').select('*').order('sort_order')
      ]);

      const content: Record<string, SectionContent> = {};
      
      // Group by page location
      ['homepage', 'features', 'team', 'contact', 'demo'].forEach(page => {
        content[page] = {
          features: features.data?.filter(f => !f.section_id) || [],
          images: imageSections.data || [],
          videos: videoSections.data || [],
          usps: usps.data?.filter(u => u.location === page || (page === 'homepage' && u.location === 'hero')) || [],
          employees: employeeSections.data || []
        };
      });

      setSectionContent(content);
    } catch (error) {
      console.error('Error fetching section content:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('page_location', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSection = async () => {
    if (!newSection.name || !newSection.display_name) {
      toast({
        title: "Error",
        description: "Name and display name are required",
        variant: "destructive",
      });
      return;
    }

    try {
      // Calculate sort order based on position
      const sectionsInPage = sections.filter(s => s.page_location === newSection.page_location);
      let sort_order = 0;
      
      if (newSection.position_after) {
        const afterSection = sectionsInPage.find(s => s.name === newSection.position_after);
        if (afterSection) {
          sort_order = afterSection.sort_order + 1;
          // Update sort orders of sections that come after
          const sectionsToUpdate = sectionsInPage.filter(s => s.sort_order >= sort_order);
          for (const section of sectionsToUpdate) {
            await supabase
              .from('sections')
              .update({ sort_order: section.sort_order + 1 })
              .eq('id', section.id);
          }
        }
      } else {
        sort_order = sectionsInPage.length;
      }

      const { error } = await supabase
        .from('sections')
        .insert([{
          ...newSection,
          sort_order
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Section created successfully",
      });

      setNewSection({
        name: '',
        display_name: '',
        page_location: 'homepage',
        position_after: '',
        background_token: 'background',
        text_token: 'foreground',
        padding_token: 'section',
        margin_token: 'none',
        max_width_token: 'container'
      });

      fetchSections();
    } catch (error) {
      console.error('Error creating section:', error);
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    }
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    try {
      const { error } = await supabase
        .from('sections')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
      
      toast({
        title: "Success",
        description: "Section updated successfully",
      });
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSections(sections.filter(s => s.id !== id));
      
      toast({
        title: "Success",
        description: "Section deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const moveSectionOrder = async (id: string, direction: 'up' | 'down') => {
    const section = sections.find(s => s.id === id);
    if (!section) return;

    const samePage = sections.filter(s => s.page_location === section.page_location);
    const currentIndex = samePage.findIndex(s => s.id === id);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === samePage.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapSection = samePage[swapIndex];

    try {
      await Promise.all([
        supabase
          .from('sections')
          .update({ sort_order: swapSection.sort_order })
          .eq('id', section.id),
        supabase
          .from('sections')
          .update({ sort_order: section.sort_order })
          .eq('id', swapSection.id)
      ]);

      fetchSections();
      
      toast({
        title: "Success",
        description: "Section order updated",
      });
    } catch (error) {
      console.error('Error updating section order:', error);
      toast({
        title: "Error",
        description: "Failed to update section order",
        variant: "destructive",
      });
    }
  };

  const getSectionPreview = (section: Section) => {
    // Map design tokens to actual Tailwind classes
    const getBackgroundClass = (token: string) => {
      const bgMap: Record<string, string> = {
        'background': 'bg-background',
        'card': 'bg-card',
        'muted': 'bg-muted',
        'primary': 'bg-primary',
        'secondary': 'bg-secondary',
        'accent': 'bg-accent'
      };
      return bgMap[token] || 'bg-background';
    };

    const getTextClass = (token: string) => {
      const textMap: Record<string, string> = {
        'foreground': 'text-foreground',
        'muted-foreground': 'text-muted-foreground',
        'primary': 'text-primary',
        'secondary': 'text-secondary',
        'accent-foreground': 'text-accent-foreground'
      };
      return textMap[token] || 'text-foreground';
    };

    const getPaddingClass = (token: string) => {
      const paddingMap: Record<string, string> = {
        'none': '',
        'sm': 'p-2',
        'md': 'p-4',
        'lg': 'p-6',
        'xl': 'p-8',
        'section': 'p-6'
      };
      return paddingMap[token] || '';
    };

    const bgClass = getBackgroundClass(section.background_token);
    const textClass = getTextClass(section.text_token);
    const paddingClass = getPaddingClass(section.padding_token);

    return (
      <div className={`${bgClass} ${textClass} ${paddingClass} rounded border min-h-[40px] flex items-center justify-center text-sm`}>
        {section.display_name}
      </div>
    );
  };

  const sectionsByPage = sections.reduce((acc, section) => {
    if (!acc[section.page_location]) {
      acc[section.page_location] = [];
    }
    acc[section.page_location].push(section);
    return acc;
  }, {} as Record<string, Section[]>);

  if (loading) {
    return <div>Loading sections...</div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Section
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Section Name (slug)</Label>
              <Input
                id="name"
                value={newSection.name}
                onChange={(e) => setNewSection({ ...newSection, name: e.target.value })}
                placeholder="e.g. about-us"
              />
            </div>
            <div>
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                value={newSection.display_name}
                onChange={(e) => setNewSection({ ...newSection, display_name: e.target.value })}
                placeholder="e.g. About Us"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="page">Page Location</Label>
              <Select value={newSection.page_location} onValueChange={(value) => setNewSection({ ...newSection, page_location: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_LOCATIONS.map(page => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="position">Position After</Label>
              <Select value={newSection.position_after || "first"} onValueChange={(value) => setNewSection({ ...newSection, position_after: value === "first" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">First section</SelectItem>
                  {sectionsByPage[newSection.page_location]?.map(section => (
                    <SelectItem key={section.id} value={section.name}>
                      After {section.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Background Token</Label>
              <Select value={newSection.background_token} onValueChange={(value) => setNewSection({ ...newSection, background_token: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGN_TOKENS.background.map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Text Token</Label>
              <Select value={newSection.text_token} onValueChange={(value) => setNewSection({ ...newSection, text_token: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGN_TOKENS.text.map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Padding Token</Label>
              <Select value={newSection.padding_token} onValueChange={(value) => setNewSection({ ...newSection, padding_token: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DESIGN_TOKENS.padding.map(token => (
                    <SelectItem key={token} value={token}>{token}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            {getSectionPreview({
              ...newSection,
              id: '',
              position_before: null,
              active: true,
              sort_order: 0,
              created_at: '',
              updated_at: ''
            } as Section)}
          </div>

          <Button onClick={createSection} className="w-full">
            Create Section
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {Object.entries(sectionsByPage).map(([pageLocation, pageSections]) => (
          <Card key={pageLocation}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {PAGE_LOCATIONS.find(p => p.value === pageLocation)?.label || pageLocation}
                <Badge variant="secondary">{pageSections.length} sections</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Design Tokens</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                   {pageSections.map((section, index) => (
                     <>
                       <TableRow key={section.id}>
                         <TableCell>
                           <div className="flex items-center gap-1">
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => moveSectionOrder(section.id, 'up')}
                               disabled={index === 0}
                             >
                               <ArrowUp className="h-4 w-4" />
                             </Button>
                             <span>{index + 1}</span>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => moveSectionOrder(section.id, 'down')}
                               disabled={index === pageSections.length - 1}
                             >
                               <ArrowDown className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2">
                             <code className="text-sm bg-muted px-1 rounded">{section.name}</code>
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => setExpandedSections(prev => ({ 
                                 ...prev, 
                                 [section.id]: !prev[section.id] 
                               }))}
                             >
                               {expandedSections[section.id] ? 
                                 <ChevronDown className="h-4 w-4" /> : 
                                 <ChevronRight className="h-4 w-4" />
                               }
                             </Button>
                           </div>
                         </TableCell>
                         <TableCell>
                           <Input
                             value={section.display_name}
                             onChange={(e) => updateSection(section.id, { display_name: e.target.value })}
                             className="min-w-[150px]"
                           />
                         </TableCell>
                         <TableCell>
                           <div className="space-y-1 text-xs">
                             <div>BG: <code>{section.background_token}</code></div>
                             <div>Text: <code>{section.text_token}</code></div>
                             <div>Padding: <code>{section.padding_token}</code></div>
                           </div>
                         </TableCell>
                         <TableCell className="min-w-[200px]">
                           {getSectionPreview(section)}
                         </TableCell>
                         <TableCell>
                           <Switch
                             checked={section.active}
                             onCheckedChange={(checked) => updateSection(section.id, { active: checked })}
                           />
                         </TableCell>
                         <TableCell>
                           <Button
                             variant="ghost"
                             size="sm"
                             onClick={() => deleteSection(section.id)}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                         </TableCell>
                       </TableRow>
                       
                       {expandedSections[section.id] && (
                         <TableRow>
                           <TableCell colSpan={7} className="p-0">
                             <div className="p-4 bg-muted/30 border-l-4 border-primary">
                               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                 {/* Employee Sections */}
                                 {pageLocation === 'team' && sectionContent[pageLocation]?.employees?.length > 0 && (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm font-medium">
                                       <Users className="h-4 w-4" />
                                       Employee Sections ({sectionContent[pageLocation].employees.length})
                                     </div>
                                     <div className="space-y-1">
                                       {sectionContent[pageLocation].employees.map((emp: any) => (
                                         <Badge key={emp.id} variant="outline" className="text-xs">
                                           {emp.name}
                                         </Badge>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* Video Sections */}
                                 {sectionContent[pageLocation]?.videos?.length > 0 && (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm font-medium">
                                       <Video className="h-4 w-4" />
                                       Video Sections ({sectionContent[pageLocation].videos.length})
                                     </div>
                                     <div className="space-y-1">
                                       {sectionContent[pageLocation].videos.map((vid: any) => (
                                         <Badge key={vid.id} variant="outline" className="text-xs">
                                           {vid.name}
                                         </Badge>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* Image Sections */}
                                 {sectionContent[pageLocation]?.images?.length > 0 && (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm font-medium">
                                       <Image className="h-4 w-4" />
                                       Image Sections ({sectionContent[pageLocation].images.length})
                                     </div>
                                     <div className="space-y-1">
                                       {sectionContent[pageLocation].images.map((img: any) => (
                                         <Badge key={img.id} variant="outline" className="text-xs">
                                           {img.name}
                                         </Badge>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* USPs */}
                                 {sectionContent[pageLocation]?.usps?.length > 0 && (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm font-medium">
                                       <Star className="h-4 w-4" />
                                       USPs ({sectionContent[pageLocation].usps.length})
                                     </div>
                                     <div className="space-y-1">
                                       {sectionContent[pageLocation].usps.map((usp: any) => (
                                         <Badge key={usp.id} variant="outline" className="text-xs">
                                           {usp.title}
                                         </Badge>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                                 
                                 {/* Features */}
                                 {sectionContent[pageLocation]?.features?.length > 0 && (
                                   <div className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm font-medium">
                                       <Sparkles className="h-4 w-4" />
                                       Features ({sectionContent[pageLocation].features.length})
                                     </div>
                                     <div className="space-y-1">
                                       {sectionContent[pageLocation].features.map((feat: any) => (
                                         <Badge key={feat.id} variant="outline" className="text-xs">
                                           {feat.title}
                                         </Badge>
                                       ))}
                                     </div>
                                   </div>
                                 )}
                               </div>
                             </div>
                           </TableCell>
                         </TableRow>
                       )}
                     </>
                   ))}
                 </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SectionsManager;