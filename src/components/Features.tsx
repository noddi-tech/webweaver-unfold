import { useEffect, useState } from "react";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Fallback static features (used when DB has no rows)
import { 
  Truck, Calendar, BarChart3, Wrench, Shield, Zap, Users, Clock, DollarSign
} from "lucide-react";

const defaultFeatures = [
  { icon: <Truck className="w-8 h-8" />, title: "Fleet Management", description: "Track and manage your entire fleet with real-time visibility and automated scheduling." },
  { icon: <Calendar className="w-8 h-8" />, title: "Smart Scheduling", description: "AI-powered scheduling that optimizes maintenance windows and reduces downtime." },
  { icon: <BarChart3 className="w-8 h-8" />, title: "Analytics Dashboard", description: "Comprehensive insights into operations, costs, and performance metrics." },
  { icon: <Wrench className="w-8 h-8" />, title: "Parts Inventory", description: "Automated parts ordering and inventory management with supplier integration." },
  { icon: <Shield className="w-8 h-8" />, title: "Compliance Tracking", description: "Stay compliant with industry regulations and safety standards automatically." },
  { icon: <Zap className="w-8 h-8" />, title: "Workflow Automation", description: "Streamline repetitive tasks and approvals with customizable automation." },
  { icon: <Users className="w-8 h-8" />, title: "Team Collaboration", description: "Connect technicians, managers, and suppliers in one unified platform." },
  { icon: <Clock className="w-8 h-8" />, title: "Real-time Updates", description: "Live status updates and notifications keep everyone informed instantly." },
  { icon: <DollarSign className="w-8 h-8" />, title: "Cost Optimization", description: "Identify cost-saving opportunities and optimize maintenance budgets." },
];

type IconName = keyof typeof icons;
interface DbFeature { id: string; title: string; description: string | null; icon_name: string; sort_order: number | null; }
interface FeatureSettings {
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  description_token: string;
}

const bgClass: Record<string, string> = {
  background: "bg-background",
  card: "bg-card",
};
const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};
const borderClass: Record<string, string> = {
  border: "border-border",
};

const Features = () => {
  const [dbFeatures, setDbFeatures] = useState<DbFeature[] | null>(null);
  const [settings, setSettings] = useState<FeatureSettings | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [{ data: feats }, { data: setts }] = await Promise.all([
        supabase
          .from("features")
          .select("id,title,description,icon_name,sort_order")
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase
          .from("features_settings")
          .select("section_title,section_subtitle,background_token,card_bg_token,border_token,icon_token,title_token,description_token")
          .order("created_at", { ascending: true })
          .limit(1),
      ]);
      if (!mounted) return;
      setDbFeatures(feats || []);
      setSettings((setts && setts[0]) || null);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const usingDb = dbFeatures && dbFeatures.length > 0;
  const bg = settings ? (bgClass[settings.background_token] || "bg-background") : "bg-background";
  const cardBg = settings ? (bgClass[settings.card_bg_token] || "bg-card") : "bg-card";
  const iconClr = settings ? (textClass[settings.icon_token] || "text-primary") : "text-primary";
  const titleClr = settings ? (textClass[settings.title_token] || "text-foreground") : "text-foreground";
  const descClr = settings ? (textClass[settings.description_token] || "text-muted-foreground") : "text-muted-foreground";
  const borderClr = settings ? (borderClass[settings.border_token] || "border-border") : "border-border";

  return (
    <section id="features" className={`py-20 px-6 ${bg}`}>
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 gradient-text`}>
            {settings?.section_title || "Platform Benefits"}
          </h2>
          <p className={`text-xl max-w-3xl mx-auto ${descClr}`}>
            {settings?.section_subtitle || "Our comprehensive platform transforms how automotive maintenance providers operate, delivering efficiency, visibility, and growth."}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {usingDb
            ? dbFeatures!.map((f) => {
                const Icon = icons[(f.icon_name as IconName)] || icons["Sparkles"];
                return (
                  <div key={f.id} className={`${cardBg} rounded-xl p-6 hover:scale-105 transition-transform duration-300 border ${borderClr} shadow-sm`}>
                    <div className={`${iconClr} mb-4`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <h3 className={`text-xl font-semibold mb-3 ${titleClr}`}>{f.title}</h3>
                    <p className={`${descClr}`}>{f.description}</p>
                  </div>
                );
              })
            : defaultFeatures.map((feature, index) => (
                <div key={index} className={`${cardBg} rounded-xl p-6 hover:scale-105 transition-transform duration-300 border ${borderClr} shadow-sm`}>
                  <div className={`${iconClr} mb-4`}>{feature.icon}</div>
                  <h3 className={`text-xl font-semibold mb-3 ${titleClr}`}>{feature.title}</h3>
                  <p className={`${descClr}`}>{feature.description}</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
