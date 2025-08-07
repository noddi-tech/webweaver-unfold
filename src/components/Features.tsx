import { 
  Truck, 
  Calendar, 
  BarChart3, 
  Wrench, 
  Shield, 
  Zap,
  Users,
  Clock,
  DollarSign
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Fleet Management",
      description: "Track and manage your entire fleet with real-time visibility and automated scheduling."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "AI-powered scheduling that optimizes maintenance windows and reduces downtime."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "Comprehensive insights into operations, costs, and performance metrics."
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: "Parts Inventory",
      description: "Automated parts ordering and inventory management with supplier integration."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Compliance Tracking",
      description: "Stay compliant with industry regulations and safety standards automatically."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Workflow Automation",
      description: "Streamline repetitive tasks and approvals with customizable automation."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Connect technicians, managers, and suppliers in one unified platform."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Live status updates and notifications keep everyone informed instantly."
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Cost Optimization",
      description: "Identify cost-saving opportunities and optimize maintenance budgets."
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-background">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Platform Benefits
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform transforms how automotive maintenance providers 
            operate, delivering efficiency, visibility, and growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-6 hover:scale-105 transition-transform duration-300 border border-border shadow-sm"
            >
              <div className="text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;