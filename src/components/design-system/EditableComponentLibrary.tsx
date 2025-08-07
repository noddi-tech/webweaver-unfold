import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Copy, 
  Download, 
  Settings, 
  Palette, 
  Type, 
  Layout,
  AlertCircle,
  CheckCircle2,
  Star,
  Heart,
  Zap,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  code: string;
}

interface EditableComponent {
  name: string;
  description: string;
  category: 'form' | 'navigation' | 'feedback' | 'layout' | 'data';
  variants: ComponentVariant[];
  customizable: string[];
}

const componentLibrary: EditableComponent[] = [
  {
    name: "Button",
    description: "Clickable button component with multiple variants",
    category: "form",
    variants: [
      { name: "Default", props: { children: "Button" }, code: '<Button>Button</Button>' },
      { name: "Secondary", props: { variant: "secondary", children: "Secondary" }, code: '<Button variant="secondary">Secondary</Button>' },
      { name: "Outline", props: { variant: "outline", children: "Outline" }, code: '<Button variant="outline">Outline</Button>' },
      { name: "Ghost", props: { variant: "ghost", children: "Ghost" }, code: '<Button variant="ghost">Ghost</Button>' },
      { name: "Link", props: { variant: "link", children: "Link" }, code: '<Button variant="link">Link</Button>' },
      { name: "Destructive", props: { variant: "destructive", children: "Destructive" }, code: '<Button variant="destructive">Destructive</Button>' },
      { name: "Small", props: { size: "sm", children: "Small" }, code: '<Button size="sm">Small</Button>' },
      { name: "Large", props: { size: "lg", children: "Large" }, code: '<Button size="lg">Large</Button>' },
      { name: "Icon", props: { size: "icon", children: <Settings className="w-4 h-4" /> }, code: '<Button size="icon"><Settings className="w-4 h-4" /></Button>' },
    ],
    customizable: ["variant", "size", "disabled", "className"]
  },
  {
    name: "Badge",
    description: "Small status indicator component",
    category: "feedback",
    variants: [
      { name: "Default", props: { children: "Badge" }, code: '<Badge>Badge</Badge>' },
      { name: "Secondary", props: { variant: "secondary", children: "Secondary" }, code: '<Badge variant="secondary">Secondary</Badge>' },
      { name: "Outline", props: { variant: "outline", children: "Outline" }, code: '<Badge variant="outline">Outline</Badge>' },
      { name: "Destructive", props: { variant: "destructive", children: "Destructive" }, code: '<Badge variant="destructive">Destructive</Badge>' },
    ],
    customizable: ["variant", "className"]
  },
  {
    name: "Input",
    description: "Text input field component",
    category: "form",
    variants: [
      { name: "Default", props: { placeholder: "Enter text..." }, code: '<Input placeholder="Enter text..." />' },
      { name: "Disabled", props: { placeholder: "Disabled", disabled: true }, code: '<Input placeholder="Disabled" disabled />' },
      { name: "With Label", props: { placeholder: "Email" }, code: '<div><Label>Email</Label><Input placeholder="Email" /></div>' },
    ],
    customizable: ["placeholder", "disabled", "type", "className"]
  },
  {
    name: "Select",
    description: "Dropdown selection component",
    category: "form",
    variants: [
      { name: "Default", props: {}, code: '<Select><SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="option1">Option 1</SelectItem><SelectItem value="option2">Option 2</SelectItem></SelectContent></Select>' },
    ],
    customizable: ["placeholder", "disabled", "className"]
  },
  {
    name: "Checkbox",
    description: "Checkbox input component",
    category: "form",
    variants: [
      { name: "Default", props: {}, code: '<Checkbox />' },
      { name: "Checked", props: { checked: true }, code: '<Checkbox checked />' },
      { name: "With Label", props: {}, code: '<div className="flex items-center space-x-2"><Checkbox id="terms" /><Label htmlFor="terms">Accept terms</Label></div>' },
    ],
    customizable: ["checked", "disabled", "className"]
  },
  {
    name: "Switch",
    description: "Toggle switch component",
    category: "form",
    variants: [
      { name: "Default", props: {}, code: '<Switch />' },
      { name: "Checked", props: { checked: true }, code: '<Switch checked />' },
      { name: "With Label", props: {}, code: '<div className="flex items-center space-x-2"><Switch id="notifications" /><Label htmlFor="notifications">Notifications</Label></div>' },
    ],
    customizable: ["checked", "disabled", "className"]
  },
  {
    name: "Alert",
    description: "Alert message component",
    category: "feedback",
    variants: [
      { name: "Default", props: { children: <AlertDescription>This is an alert message.</AlertDescription> }, code: '<Alert><AlertDescription>This is an alert message.</AlertDescription></Alert>' },
      { name: "Destructive", props: { variant: "destructive", children: <AlertDescription>This is a destructive alert.</AlertDescription> }, code: '<Alert variant="destructive"><AlertDescription>This is a destructive alert.</AlertDescription></Alert>' },
    ],
    customizable: ["variant", "className"]
  },
  {
    name: "Table",
    description: "Data table component for displaying structured data",
    category: "data",
    variants: [
      { name: "Basic", props: {}, code: '<Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Email</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>John Doe</TableCell><TableCell><Badge>Active</Badge></TableCell><TableCell>john@example.com</TableCell></TableRow></TableBody></Table>' },
      { name: "With Caption", props: {}, code: '<Table><TableCaption>A list of recent users</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>John Doe</TableCell><TableCell>Active</TableCell></TableRow></TableBody></Table>' },
    ],
    customizable: ["className"]
  },
  {
    name: "Avatar",
    description: "User avatar component with fallback support",
    category: "data",
    variants: [
      { name: "Default", props: {}, code: '<Avatar><AvatarImage src="/placeholder.svg" /><AvatarFallback>JD</AvatarFallback></Avatar>' },
      { name: "Large", props: { className: "h-16 w-16" }, code: '<Avatar className="h-16 w-16"><AvatarImage src="/placeholder.svg" /><AvatarFallback>JD</AvatarFallback></Avatar>' },
    ],
    customizable: ["className", "size"]
  },
  {
    name: "DropdownMenu",
    description: "Contextual menu component",
    category: "navigation",
    variants: [
      { name: "Basic", props: {}, code: '<DropdownMenu><DropdownMenuTrigger asChild><Button variant="outline">Open Menu</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Profile</DropdownMenuItem><DropdownMenuItem>Settings</DropdownMenuItem></DropdownMenuContent></DropdownMenu>' },
    ],
    customizable: ["align", "sideOffset"]
  },
  {
    name: "NavigationMenu",
    description: "Main navigation component",
    category: "navigation",
    variants: [
      { name: "Basic", props: {}, code: '<NavigationMenu><NavigationMenuList><NavigationMenuItem><NavigationMenuTrigger>Getting started</NavigationMenuTrigger><NavigationMenuContent><p className="p-4">Navigation content</p></NavigationMenuContent></NavigationMenuItem></NavigationMenuList></NavigationMenu>' },
    ],
    customizable: ["orientation"]
  },
  {
    name: "Accordion",
    description: "Collapsible content sections",
    category: "layout",
    variants: [
      { name: "Single", props: {}, code: '<Accordion type="single" collapsible><AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem></Accordion>' },
    ],
    customizable: ["type", "collapsible"]
  },
];

export const EditableComponentLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Components" },
    { value: "form", label: "Form" },
    { value: "navigation", label: "Navigation" },
    { value: "feedback", label: "Feedback" },
    { value: "layout", label: "Layout" },
    { value: "data", label: "Data" },
  ];

  const filteredComponents = componentLibrary.filter(component => {
    const matchesCategory = selectedCategory === "all" || component.category === selectedCategory;
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyCode = (code: string, componentName: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: `${componentName} code copied to clipboard`,
    });
  };

  const exportAllComponents = () => {
    const allCodes = componentLibrary.flatMap(comp => 
      comp.variants.map(variant => `// ${comp.name} - ${variant.name}\n${variant.code}`)
    ).join('\n\n');
    
    navigator.clipboard.writeText(allCodes);
    toast({
      title: "All components exported",
      description: "Complete component library copied to clipboard",
    });
  };

  const renderComponent = (component: EditableComponent, variant: ComponentVariant) => {
    const { name } = component;
    const { props } = variant;

    switch (name) {
      case "Button":
        return <Button {...props} />;
      case "Badge":
        return <Badge {...props} />;
      case "Input":
        return <Input {...props} />;
      case "Select":
        return (
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
              <SelectItem value="option3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        );
      case "Checkbox":
        return props.checked !== undefined ? (
          <div className="flex items-center space-x-2">
            <Checkbox {...props} id={`checkbox-${variant.name}`} />
            {variant.name === "With Label" && <Label htmlFor={`checkbox-${variant.name}`}>Accept terms</Label>}
          </div>
        ) : <Checkbox {...props} />;
      case "Switch":
        return props.checked !== undefined ? (
          <div className="flex items-center space-x-2">
            <Switch {...props} id={`switch-${variant.name}`} />
            {variant.name === "With Label" && <Label htmlFor={`switch-${variant.name}`}>Notifications</Label>}
          </div>
        ) : <Switch {...props} />;
      case "Alert":
        return <Alert {...props} className="w-full max-w-md" />;
      case "Table":
        return (
          <div className="w-full max-w-md">
            <Table>
              <TableCaption>A list of recent users</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell><Badge variant="outline">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        );
      case "Avatar":
        return (
          <Avatar {...props}>
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        );
      case "DropdownMenu":
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Open Menu
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      case "NavigationMenu":
        return (
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="p-4 w-48">
                    <p className="text-sm">Navigation content here</p>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        );
      case "Accordion":
        return (
          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>
                Yes. It comes with default styles.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      default:
        return <div className="p-4 border border-dashed border-muted-foreground rounded text-muted-foreground">Component Preview</div>;
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold gradient-text mb-2">Component Library</h2>
          <p className="text-muted-foreground text-lg">
            Interactive showcase of all available Shadcn components with live editing.
          </p>
        </div>
        <Button onClick={exportAllComponents}>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1">
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Component Grid */}
      <div className="space-y-12">
        {filteredComponents.map((component) => (
          <Card key={component.name} className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {component.name}
                    <Badge variant="outline" className="capitalize">
                      {component.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{component.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                </TabsList>
                
                <TabsContent value="preview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {component.variants.map((variant) => (
                      <Card key={variant.name} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">{variant.name}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => copyCode(variant.code, `${component.name} ${variant.name}`)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-center min-h-16 p-4 bg-muted/20 rounded-md">
                          {renderComponent(component, variant)}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="code" className="space-y-4">
                  {component.variants.map((variant) => (
                    <Card key={variant.name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium">{variant.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(variant.code, `${component.name} ${variant.name}`)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        <code>{variant.code}</code>
                      </pre>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredComponents.length === 0 && (
        <Card className="glass-card p-12 text-center">
          <div className="text-muted-foreground">
            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No components found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        </Card>
      )}
    </section>
  );
};