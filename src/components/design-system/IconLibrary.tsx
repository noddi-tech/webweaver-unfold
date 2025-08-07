import { Card } from "@/components/ui/card";
import { 
  Truck, 
  Wrench, 
  Calendar, 
  BarChart3, 
  Shield, 
  Zap,
  Car,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Settings,
  Bell,
  Mail,
  Phone,
  Home,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Star,
  Heart,
  Share,
  Menu,
  MoreVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle
} from "lucide-react";

export const IconLibrary = () => {
  const iconCategories = [
    {
      name: "Noddi Platform",
      description: "Icons specific to logistics and automotive services",
      icons: [
        { icon: Truck, name: "Truck", component: "Truck" },
        { icon: Wrench, name: "Wrench", component: "Wrench" },
        { icon: Car, name: "Car", component: "Car" },
        { icon: MapPin, name: "MapPin", component: "MapPin" },
        { icon: Calendar, name: "Calendar", component: "Calendar" },
        { icon: BarChart3, name: "BarChart3", component: "BarChart3" },
        { icon: Shield, name: "Shield", component: "Shield" },
        { icon: Zap, name: "Zap", component: "Zap" },
        { icon: Clock, name: "Clock", component: "Clock" },
        { icon: DollarSign, name: "DollarSign", component: "DollarSign" },
      ]
    },
    {
      name: "Navigation",
      description: "Icons for navigation and user interface",
      icons: [
        { icon: Home, name: "Home", component: "Home" },
        { icon: Search, name: "Search", component: "Search" },
        { icon: Filter, name: "Filter", component: "Filter" },
        { icon: Menu, name: "Menu", component: "Menu" },
        { icon: ArrowRight, name: "ArrowRight", component: "ArrowRight" },
        { icon: ArrowLeft, name: "ArrowLeft", component: "ArrowLeft" },
        { icon: ArrowUp, name: "ArrowUp", component: "ArrowUp" },
        { icon: ArrowDown, name: "ArrowDown", component: "ArrowDown" },
        { icon: ChevronRight, name: "ChevronRight", component: "ChevronRight" },
        { icon: ChevronLeft, name: "ChevronLeft", component: "ChevronLeft" },
      ]
    },
    {
      name: "Actions",
      description: "Icons for user actions and interactions",
      icons: [
        { icon: Plus, name: "Plus", component: "Plus" },
        { icon: Minus, name: "Minus", component: "Minus" },
        { icon: Edit, name: "Edit", component: "Edit" },
        { icon: Trash2, name: "Trash2", component: "Trash2" },
        { icon: Download, name: "Download", component: "Download" },
        { icon: Upload, name: "Upload", component: "Upload" },
        { icon: Share, name: "Share", component: "Share" },
        { icon: Star, name: "Star", component: "Star" },
        { icon: Heart, name: "Heart", component: "Heart" },
        { icon: MoreVertical, name: "MoreVertical", component: "MoreVertical" },
      ]
    },
    {
      name: "Communication",
      description: "Icons for messaging and contact",
      icons: [
        { icon: Mail, name: "Mail", component: "Mail" },
        { icon: Phone, name: "Phone", component: "Phone" },
        { icon: Bell, name: "Bell", component: "Bell" },
        { icon: Users, name: "Users", component: "Users" },
        { icon: Settings, name: "Settings", component: "Settings" },
      ]
    },
    {
      name: "Status & Feedback",
      description: "Icons for states, status, and user feedback",
      icons: [
        { icon: Check, name: "Check", component: "Check" },
        { icon: X, name: "X", component: "X" },
        { icon: CheckCircle, name: "CheckCircle", component: "CheckCircle" },
        { icon: XCircle, name: "XCircle", component: "XCircle" },
        { icon: AlertTriangle, name: "AlertTriangle", component: "AlertTriangle" },
        { icon: Info, name: "Info", component: "Info" },
        { icon: HelpCircle, name: "HelpCircle", component: "HelpCircle" },
        { icon: Eye, name: "Eye", component: "Eye" },
        { icon: EyeOff, name: "EyeOff", component: "EyeOff" },
        { icon: Lock, name: "Lock", component: "Lock" },
      ]
    }
  ];

  const iconSizes = [
    { name: "Small", class: "w-4 h-4", pixels: "16px" },
    { name: "Default", class: "w-5 h-5", pixels: "20px" },
    { name: "Medium", class: "w-6 h-6", pixels: "24px" },
    { name: "Large", class: "w-8 h-8", pixels: "32px" },
    { name: "XL", class: "w-12 h-12", pixels: "48px" },
  ];

  return (
    <section>
      <h2 className="text-4xl font-bold gradient-text mb-8">Icon Library</h2>
      <p className="text-muted-foreground mb-12 text-lg">
        Comprehensive icon set from Lucide React with consistent sizing and usage patterns.
      </p>

      <div className="space-y-12">
        {/* Icon Sizes */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Icon Sizes</h3>
          <Card className="glass-card p-6">
            <div className="flex items-center gap-8">
              {iconSizes.map((size) => (
                <div key={size.name} className="text-center">
                  <div className="flex items-center justify-center h-16 mb-2">
                    <Truck className={size.class} />
                  </div>
                  <div className="text-sm font-medium">{size.name}</div>
                  <div className="text-xs text-muted-foreground">{size.pixels}</div>
                  <code className="text-xs bg-muted px-1 py-0.5 rounded mt-1 block">
                    {size.class}
                  </code>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Icon Categories */}
        {iconCategories.map((category) => (
          <div key={category.name}>
            <h3 className="text-2xl font-semibold mb-6">{category.name}</h3>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.icons.map((iconItem) => {
                const IconComponent = iconItem.icon;
                return (
                  <Card key={iconItem.name} className="glass-card p-4 text-center hover:bg-accent/10 transition-colors">
                    <div className="flex items-center justify-center h-12 mb-2">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium mb-1">{iconItem.name}</div>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {iconItem.component}
                    </code>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}

        {/* Usage Examples */}
        <div>
          <h3 className="text-2xl font-semibold mb-6">Usage Examples</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">Import & Basic Usage</h4>
              <div className="space-y-4">
                <div>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    import {"{ Truck }"} from "lucide-react"
                  </code>
                </div>
                <div>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    &lt;Truck className="w-5 h-5" /&gt;
                  </code>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <h4 className="text-lg font-medium mb-4">With Props</h4>
              <div className="space-y-4">
                <div>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    &lt;Truck size={24} color="hsl(var(--primary))" /&gt;
                  </code>
                </div>
                <div>
                  <code className="bg-muted px-3 py-2 rounded text-sm block">
                    &lt;Truck className="w-8 h-8 text-primary" /&gt;
                  </code>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};