import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import dashboardPreview from "@/assets/dashboard-preview.jpg";
import { useEffect, useState } from "react";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Hero = () => {
  const [usps, setUsps] = useState<Array<{ id: string; title: string; icon_name: string; href: string | null; bg_token: string; text_token: string }>>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("usps")
        .select("id,title,icon_name,href,bg_token,text_token,active,sort_order")
        .eq("active", true)
        .eq("location", "hero")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!mounted) return;
      setUsps(data || []);
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Text */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
            Streamline Your
            <br />
            Automotive Operations
          </h1>

          {/* Hero USPs */}
          {usps.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {usps.map((u) => {
                const IconCmp = (icons as any)[u.icon_name] || Sparkles;
                return (
                  <span key={u.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border ${{
                    background: "bg-background",
                    card: "bg-card",
                    primary: "bg-primary",
                    secondary: "bg-secondary",
                    accent: "bg-accent",
                    "gradient-primary": "bg-gradient-primary",
                    "gradient-background": "bg-gradient-background",
                    "gradient-hero": "bg-gradient-hero",
                  }[u.bg_token] || "bg-secondary"} ${
                    {
                      foreground: "text-foreground",
                      "muted-foreground": "text-muted-foreground",
                      primary: "text-primary",
                      secondary: "text-secondary",
                      accent: "text-accent",
                    }[u.text_token] || "text-foreground"
                  }`}>
                    <IconCmp className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium whitespace-nowrap">{u.title}</span>
                  </span>
                );
              })}
            </div>
          )}


          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/contact">
              <Button size="lg" className="text-lg px-8 py-4 w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 w-full sm:w-auto">
                <Play className="mr-2" size={20} />
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview */}
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <img
              src={dashboardPreview}
              alt="Noddi Tech Dashboard Preview"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;