import { useEffect, useState } from "react";
import { icons } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { EditableSolutionText } from "@/components/EditableSolutionText";

type IconName = keyof typeof icons;

interface Solution {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon_name: string;
  image_url: string | null;
  cta_text: string | null;
  cta_url: string | null;
  benefits: string[];
  sort_order: number;
}

interface SolutionSettings {
  section_title: string;
  section_subtitle: string | null;
  background_token: string;
  card_bg_token: string;
  border_token: string;
  icon_token: string;
  title_token: string;
  subtitle_token: string;
  description_token: string;
}

const bgClass: Record<string, string> = {
  background: "bg-background",
  card: "bg-card",
  "gradient-primary": "bg-gradient-primary",
  "gradient-background": "bg-gradient-background",
  "gradient-hero": "bg-gradient-hero",
};

const textClass: Record<string, string> = {
  foreground: "text-foreground",
  "muted-foreground": "text-muted-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-accent",
};

const Solutions = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [settings, setSettings] = useState<SolutionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [{ data: sols }, { data: setts }] = await Promise.all([
      supabase
        .from("solutions")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("solutions_settings")
        .select("*")
        .limit(1),
    ]);

    setSolutions((sols || []).map(s => ({
      ...s,
      benefits: (Array.isArray(s.benefits) ? s.benefits : []) as string[]
    })));
    setSettings((setts && setts[0]) || null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading solutions...</p>
        </div>
        <Footer />
      </div>
    );
  }

  const bg = settings ? (bgClass[settings.background_token] || "bg-background") : "bg-background";
  const cardBg = settings ? (bgClass[settings.card_bg_token] || "bg-card") : "bg-card";
  const iconClr = settings ? (textClass[settings.icon_token] || "text-primary") : "text-primary";
  const titleClr = settings ? (textClass[settings.title_token] || "text-foreground") : "text-foreground";
  const subtitleClr = settings ? (textClass[settings.subtitle_token] || "text-muted-foreground") : "text-muted-foreground";
  const descClr = settings ? (textClass[settings.description_token] || "text-muted-foreground") : "text-muted-foreground";

  return (
    <div className={`min-h-screen ${bg}`}>
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${titleClr}`}>
            {settings?.section_title || "Solutions"}
          </h1>
          {settings?.section_subtitle && (
            <p className={`text-xl ${subtitleClr} max-w-2xl mx-auto`}>
              {settings.section_subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 px-6 pb-32">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution) => {
              const Icon = icons[(solution.icon_name as IconName)] || icons["Sparkles"];
              
              return (
                <div
                  key={solution.id}
                  className={`${cardBg} rounded-2xl p-8 border border-border hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-fade-in`}
                >
                  {/* Icon */}
                  <div className={`${iconClr} mb-6`}>
                    <Icon className="w-12 h-12" />
                  </div>

                  {/* Title & Subtitle */}
                  <h2 className={`text-3xl font-bold mb-2 ${titleClr}`}>
                    {solution.title}
                  </h2>
                  {solution.subtitle && (
                    <EditableSolutionText
                      solutionId={solution.id}
                      field="subtitle"
                      onSave={() => loadData()}
                    >
                      <p className={`text-lg mb-4 ${subtitleClr} font-medium`}>
                        {solution.subtitle}
                      </p>
                    </EditableSolutionText>
                  )}

                  {/* Description */}
                  {solution.description && (
                    <p className={`${descClr} mb-6 leading-relaxed`}>
                      {solution.description}
                    </p>
                  )}

                  {/* Benefits */}
                  {solution.benefits && solution.benefits.length > 0 && (
                    <ul className="space-y-3 mb-6">
                      {solution.benefits.map((benefit, idx) => (
                        <li key={idx} className={`flex items-start gap-2 ${descClr}`}>
                          <icons.Check className={`w-5 h-5 ${iconClr} shrink-0 mt-0.5`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Image */}
                  {solution.image_url && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                      <img
                        src={solution.image_url}
                        alt={solution.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-6">
                    <Button asChild size="lg" className="w-full">
                      <LanguageLink to={`/solutions/${solution.id}`}>
                        {solution.cta_text || "Learn More"}
                        <icons.ArrowRight className="w-4 h-4 ml-2" />
                      </LanguageLink>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {solutions.length === 0 && (
            <div className="text-center py-20">
              <p className={`text-xl ${descClr}`}>
                No solutions available yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Solutions;
