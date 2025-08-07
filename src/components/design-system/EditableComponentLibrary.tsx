import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
  ChevronDown,
  Edit,
  ShoppingCart,
  Camera,
  Globe,
  Home,
  MessageCircle,
  TrendingUp,
  Image as ImageIcon,
  Grid
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  editableProps?: EditableProps;
}

interface EditableProps {
  size?: { width?: string; height?: string };
  spacing?: { padding?: string; margin?: string };
  colors?: { background?: string; text?: string; border?: string };
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderRadius?: string;
  opacity?: number;
}

interface EditableComponent {
  name: string;
  description: string;
  category: 'form' | 'navigation' | 'feedback' | 'layout' | 'data' | 'content';
  variants: ComponentVariant[];
  customizable: string[];
  defaultEditableProps?: EditableProps;
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
  // Complete Forms
  {
    name: "ContactForm",
    description: "Complete contact form with validation",
    category: "form",
    variants: [
      { name: "Default", props: {}, code: '<form className="space-y-4"><div><Label>Name</Label><Input placeholder="Your name" /></div><div><Label>Email</Label><Input type="email" placeholder="your@email.com" /></div><div><Label>Message</Label><Textarea placeholder="Your message..." /></div><Button className="w-full">Send Message</Button></form>' },
    ],
    customizable: ["layout", "styling"]
  },
  {
    name: "LoginForm",
    description: "User authentication login form",
    category: "form",
    variants: [
      { name: "Default", props: {}, code: '<form className="space-y-4 max-w-sm"><div><Label>Email</Label><Input type="email" placeholder="Enter email" /></div><div><Label>Password</Label><Input type="password" placeholder="Enter password" /></div><div className="flex items-center space-x-2"><Checkbox id="remember" /><Label htmlFor="remember">Remember me</Label></div><Button className="w-full">Sign In</Button></form>' },
    ],
    customizable: ["layout", "styling"]
  },
  // Layout Components
  {
    name: "Container",
    description: "Responsive container with max width",
    category: "layout",
    variants: [
      { name: "Default", props: {}, code: '<div className="container mx-auto px-4"><h2>Container Content</h2><p>This content is centered with responsive padding.</p></div>' },
      { name: "Full Width", props: {}, code: '<div className="w-full px-6"><h2>Full Width Content</h2><p>This content spans the full width with padding.</p></div>' },
    ],
    customizable: ["width", "padding", "alignment"]
  },
  {
    name: "FlexLayout",
    description: "Flexible layout container",
    category: "layout",
    variants: [
      { name: "Row", props: {}, code: '<div className="flex space-x-4"><div className="flex-1 p-4 bg-muted rounded">Item 1</div><div className="flex-1 p-4 bg-muted rounded">Item 2</div></div>' },
      { name: "Column", props: {}, code: '<div className="flex flex-col space-y-4"><div className="p-4 bg-muted rounded">Item 1</div><div className="p-4 bg-muted rounded">Item 2</div></div>' },
    ],
    customizable: ["direction", "spacing", "alignment"]
  },
  {
    name: "GridLayout",
    description: "CSS Grid layout container",
    category: "layout",
    variants: [
      { name: "Two Column", props: {}, code: '<div className="grid grid-cols-2 gap-4"><div className="p-4 bg-muted rounded">Grid Item 1</div><div className="p-4 bg-muted rounded">Grid Item 2</div></div>' },
      { name: "Three Column", props: {}, code: '<div className="grid grid-cols-3 gap-4"><div className="p-4 bg-muted rounded">Item 1</div><div className="p-4 bg-muted rounded">Item 2</div><div className="p-4 bg-muted rounded">Item 3</div></div>' },
    ],
    customizable: ["columns", "gap", "alignment"]
  },
  {
    name: "HeroSection",
    description: "Hero section with background and content",
    category: "layout",
    variants: [
      { name: "Default", props: {}, code: '<div className="relative h-96 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center text-white"><div className="text-center"><h1 className="text-4xl font-bold mb-4">Hero Title</h1><p className="text-xl mb-6">Hero description text</p><Button variant="secondary">Get Started</Button></div></div>' },
    ],
    customizable: ["height", "background", "content"]
  },
  // Enhanced Cards
  {
    name: "ProductCard",
    description: "Product showcase card with image and details",
    category: "content",
    variants: [
      { name: "Default", props: {}, code: '<Card className="max-w-sm glass-card overflow-hidden"><div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"><ShoppingCart className="w-12 h-12 text-muted-foreground" /></div><CardHeader><CardTitle>Product Name</CardTitle><CardDescription>$99.99</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">Product description goes here.</p></CardContent><CardFooter><Button className="w-full">Add to Cart</Button></CardFooter></Card>' },
    ],
    customizable: ["image", "price", "description"]
  },
  {
    name: "ProfileCard",
    description: "User profile card with avatar and info",
    category: "content",
    variants: [
      { name: "Default", props: {}, code: '<Card className="max-w-sm glass-card"><CardHeader className="text-center"><Avatar className="w-20 h-20 mx-auto mb-4"><AvatarImage src="/placeholder.svg" /><AvatarFallback>JD</AvatarFallback></Avatar><CardTitle>John Doe</CardTitle><CardDescription>Software Developer</CardDescription></CardHeader><CardContent className="text-center"><p className="text-sm text-muted-foreground mb-4">Building amazing web experiences</p><div className="flex justify-center space-x-2"><Badge variant="secondary">React</Badge><Badge variant="secondary">TypeScript</Badge></div></CardContent><CardFooter><Button className="w-full" variant="outline">Connect</Button></CardFooter></Card>' },
    ],
    customizable: ["avatar", "bio", "skills"]
  },
  {
    name: "StatCard",
    description: "Statistics display card",
    category: "content",
    variants: [
      { name: "Default", props: {}, code: '<Card className="glass-card"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">$45,231.89</div><p className="text-xs text-muted-foreground">+20.1% from last month</p></CardContent></Card>' },
    ],
    customizable: ["metric", "value", "trend"]
  },
  {
    name: "ImageCard",
    description: "Card with prominent image and overlay text",
    category: "content",
    variants: [
      { name: "Default", props: {}, code: '<Card className="max-w-sm glass-card overflow-hidden"><div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"><ImageIcon className="w-12 h-12 text-white/70" /><div className="absolute inset-0 bg-black/20"></div><div className="absolute bottom-4 left-4 text-white"><h3 className="font-semibold">Image Title</h3><p className="text-sm text-white/80">Image description</p></div></div><CardContent className="p-4"><Button variant="ghost" className="w-full text-foreground hover:bg-secondary/20">Learn More</Button></CardContent></Card>' },
    ],
    customizable: ["image", "overlay", "content"]
  },
  {
    name: "HeroSection",
    description: "Hero sections with various layouts inspired by Webflow",
    category: "layout",
    variants: [
      { 
        name: "Image Left Text Right", 
        props: {}, 
        code: `<section className="min-h-screen flex items-center p-8">
  <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
    <div className="relative aspect-square bg-gradient-to-br from-primary/30 to-secondary/30 rounded-2xl flex items-center justify-center glass-card">
      <ImageIcon className="w-24 h-24 text-white/70" />
    </div>
    <div className="space-y-6">
      <h1 className="text-4xl lg:text-6xl font-bold text-foreground gradient-text">
        Transform Your Digital Experience
      </h1>
      <p className="text-xl text-muted-foreground leading-relaxed">
        Create stunning websites and applications with our cutting-edge design system and components.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
          Get Started
        </Button>
        <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary/20">
          Learn More
        </Button>
      </div>
    </div>
  </div>
</section>` 
      },
      { 
        name: "Centered Hero", 
        props: {}, 
        code: `<section className="min-h-screen flex items-center justify-center p-8">
  <div className="text-center max-w-4xl mx-auto space-y-8">
    <h1 className="text-5xl lg:text-7xl font-bold text-foreground gradient-text">
      Build The Future
    </h1>
    <p className="text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
      Revolutionary design system that empowers creators to build exceptional digital experiences.
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
        Start Building
      </Button>
      <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary/20">
        View Demo
      </Button>
    </div>
    <div className="mt-12 relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center glass-card">
      <ImageIcon className="w-32 h-32 text-white/50" />
    </div>
  </div>
</section>` 
      },
      { 
        name: "Split Hero", 
        props: {}, 
        code: `<section className="min-h-screen grid lg:grid-cols-2">
  <div className="flex items-center justify-center p-8 lg:p-12">
    <div className="space-y-6 max-w-lg">
      <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
        Design Without Limits
      </h1>
      <p className="text-lg text-muted-foreground">
        Professional components and layouts that adapt to your vision. Create beautiful interfaces in minutes.
      </p>
      <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
        Get Started Free
      </Button>
    </div>
  </div>
  <div className="relative bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
    <div className="absolute inset-0 bg-black/10"></div>
    <ImageIcon className="w-40 h-40 text-white/60 relative z-10" />
  </div>
</section>` 
      },
    ],
    customizable: ["layout", "text", "buttons", "background"]
  },
];

export const EditableComponentLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedComponent, setSelectedComponent] = useState<{ component: EditableComponent; variant: ComponentVariant } | null>(null);
  const [editableProps, setEditableProps] = useState<EditableProps>({});
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const categories = [
    { value: "all", label: "All Components" },
    { value: "form", label: "Form" },
    { value: "navigation", label: "Navigation" },
    { value: "feedback", label: "Feedback" },
    { value: "layout", label: "Layout" },
    { value: "data", label: "Data" },
    { value: "content", label: "Content" },
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
      // Complete Forms
      case "ContactForm":
        return (
          <form className="space-y-4 max-w-sm glass p-4 rounded-lg">
            <div>
              <Label className="text-white/90">Name</Label>
              <Input placeholder="Your name" className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
            <div>
              <Label className="text-white/90">Email</Label>
              <Input type="email" placeholder="your@email.com" className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
            <div>
              <Label className="text-white/90">Message</Label>
              <Textarea placeholder="Your message..." className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
            <Button className="w-full">Send Message</Button>
          </form>
        );
      case "LoginForm":
        return (
          <form className="space-y-4 max-w-sm glass p-6 rounded-lg">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-white">Welcome Back</h3>
              <p className="text-white/70 text-sm">Sign in to your account</p>
            </div>
            <div>
              <Label className="text-white/90">Email</Label>
              <Input type="email" placeholder="Enter email" className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
            <div>
              <Label className="text-white/90">Password</Label>
              <Input type="password" placeholder="Enter password" className="bg-white/10 border-white/20 text-white placeholder:text-white/60" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="border-white/30" />
              <Label htmlFor="remember" className="text-white/80 text-sm">Remember me</Label>
            </div>
            <Button className="w-full">Sign In</Button>
          </form>
        );
      // Layout Components
      case "Container":
        return (
          <div className="glass-card p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Container Content</h3>
            <p className="text-muted-foreground">This content is centered with responsive padding and glass morphism effect.</p>
          </div>
        );
      case "FlexLayout":
        return (
          <div className="max-w-md">
            {variant.name === "Row" ? (
              <div className="flex space-x-4">
                <div className="flex-1 p-4 glass-card rounded">Item 1</div>
                <div className="flex-1 p-4 glass-card rounded">Item 2</div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="p-4 glass-card rounded">Item 1</div>
                <div className="p-4 glass-card rounded">Item 2</div>
              </div>
            )}
          </div>
        );
      case "GridLayout":
        return (
          <div className="max-w-md">
            {variant.name === "Two Column" ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 glass-card rounded text-center">Grid Item 1</div>
                <div className="p-4 glass-card rounded text-center">Grid Item 2</div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 glass-card rounded text-center text-sm">Item 1</div>
                <div className="p-3 glass-card rounded text-center text-sm">Item 2</div>
                <div className="p-3 glass-card rounded text-center text-sm">Item 3</div>
              </div>
            )}
          </div>
        );
      case "HeroSection":
        return (
          <div className="relative h-48 w-full max-w-md bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="text-center z-10">
              <h1 className="text-2xl font-bold mb-2">Hero Title</h1>
              <p className="text-sm mb-4 opacity-90">Hero description text</p>
              <Button variant="secondary" size="sm">Get Started</Button>
            </div>
          </div>
        );
      // Enhanced Cards
      case "ProductCard":
        return (
          <Card className="max-w-48 glass-card overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Product Name</CardTitle>
              <CardDescription className="text-xs">$99.99</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-xs text-muted-foreground">Great product description.</p>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button size="sm" className="w-full">Add to Cart</Button>
            </CardFooter>
          </Card>
        );
      case "ProfileCard":
        return (
          <Card className="max-w-48 glass-card">
            <CardHeader className="text-center p-4">
              <Avatar className="w-12 h-12 mx-auto mb-2">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <CardTitle className="text-sm">John Doe</CardTitle>
              <CardDescription className="text-xs">Developer</CardDescription>
            </CardHeader>
            <CardContent className="text-center p-4 pt-0">
              <p className="text-xs text-muted-foreground mb-2">Building amazing experiences</p>
              <div className="flex justify-center space-x-1">
                <Badge variant="secondary" className="text-xs">React</Badge>
                <Badge variant="secondary" className="text-xs">TS</Badge>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full" variant="outline" size="sm">Connect</Button>
            </CardFooter>
          </Card>
        );
      case "StatCard":
        return (
          <Card className="glass-card max-w-48">
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
              <CardTitle className="text-xs font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-lg font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
        );
      case "ImageCard":
        return (
          <Card className="max-w-48 glass-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-white/70" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute bottom-2 left-2 text-white">
                <h3 className="text-xs font-semibold">Image Title</h3>
                <p className="text-xs text-white/80">Description</p>
              </div>
            </div>
            <CardContent className="p-3">
              <Button variant="ghost" size="sm" className="w-full text-xs">Learn More</Button>
            </CardContent>
          </Card>
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