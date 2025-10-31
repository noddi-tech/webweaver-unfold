import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { LanguageLink } from "@/components/LanguageLink";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface KeyBenefit {
  id: string;
  heading: string;
  description: string;
  imageUrl: string;
}

interface Solution {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_description: string | null;
  hero_image_url: string | null;
  hero_cta_text: string | null;
  hero_cta_url: string | null;
  description_heading: string | null;
  description_text: string | null;
  key_benefits: KeyBenefit[];
  footer_heading: string | null;
  footer_text: string | null;
  footer_cta_text: string | null;
  footer_cta_url: string | null;
}

const SolutionDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [solution, setSolution] = useState<Solution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSolution = async () => {
      if (!slug) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("solutions")
        .select("*")
        .eq("id", slug)
        .eq("active", true)
        .single();

      if (error) {
        console.error("Error loading solution:", error);
        setLoading(false);
        return;
      }

      if (data) {
        setSolution({
          ...data,
          key_benefits: Array.isArray(data.key_benefits) 
            ? data.key_benefits.map((kb: any, idx: number) => ({
                id: String(idx),
                heading: kb.heading || "",
                description: kb.text || kb.description || "",
                imageUrl: kb.imageUrl || kb.image_url || ""
              }))
            : []
        });
      }
      setLoading(false);
    };

    loadSolution();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading solution...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Solution Not Found</h1>
          <p className="text-muted-foreground mb-8">The solution you're looking for doesn't exist.</p>
          <Button asChild>
            <LanguageLink to="/solutions">View All Solutions</LanguageLink>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      {solution.hero_title && (
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                {solution.hero_subtitle && (
                  <p className="text-primary font-semibold mb-4 text-lg">
                    {solution.hero_subtitle}
                  </p>
                )}
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                  {solution.hero_title}
                </h1>
                {solution.hero_description && (
                  <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                    {solution.hero_description}
                  </p>
                )}
                {solution.hero_cta_text && solution.hero_cta_url && (
                  <Button size="lg" className="text-lg px-8" asChild>
                    <LanguageLink to={solution.hero_cta_url}>
                      {solution.hero_cta_text}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </LanguageLink>
                  </Button>
                )}
              </div>
              {solution.hero_image_url && (
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img 
                    src={solution.hero_image_url} 
                    alt={solution.hero_title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Description Section */}
      {solution.description_heading && (
        <section className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {solution.description_heading}
            </h2>
            {solution.description_text && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {solution.description_text}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Key Benefits Section */}
      {solution.key_benefits && solution.key_benefits.length > 0 && (
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-7xl space-y-24">
            {solution.key_benefits.map((benefit, index) => {
              const isEven = index % 2 === 0;
              
              return (
                <div 
                  key={benefit.id}
                  className={`grid lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-dense' : ''}`}
                >
                  <div className={!isEven ? 'lg:col-start-2' : ''}>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                      {benefit.heading}
                    </h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                  {benefit.imageUrl && (
                    <div className={`rounded-2xl overflow-hidden shadow-xl ${!isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                      <img 
                        src={benefit.imageUrl}
                        alt={benefit.heading}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Solution Footer / CTA Section */}
      {solution.footer_heading && (
        <section className="py-20 px-6 bg-gradient-primary">
          <div className="container mx-auto max-w-4xl text-center">
            <h3 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
              {solution.footer_heading}
            </h3>
            {solution.footer_text && (
              <p className="text-xl text-primary-foreground/90 mb-8">
                {solution.footer_text}
              </p>
            )}
            {solution.footer_cta_text && solution.footer_cta_url && (
              <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                <LanguageLink to={solution.footer_cta_url}>
                  {solution.footer_cta_text}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </LanguageLink>
              </Button>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SolutionDetail;
