import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PricingHeroNew } from "@/components/pricing/PricingHeroNew";
import { LaunchTierCard } from "@/components/pricing/LaunchTierCard";
import { ScaleTierCard } from "@/components/pricing/ScaleTierCard";
import { ScaleTierTable } from "@/components/pricing/ScaleTierTable";
import { PricingComparisonCalculator } from "@/components/pricing/PricingComparisonCalculator";
import { NoHiddenCosts } from "@/components/pricing/NoHiddenCosts";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { usePricingConfig } from "@/hooks/usePricingConfig";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";
import { HreflangTags } from "@/components/HreflangTags";
import { ChevronDown, ChevronUp } from 'lucide-react';

const PricingDetailed = () => {
  const [showAllTiers, setShowAllTiers] = useState(false);
  const { launch, scale, scaleTiers, isLoading } = usePricingConfig();
  
  // Fetch CMS content for pricing page
  const { textContent } = useTextContent('pricing');
  
  // Helper to get CMS content with validation
  const getCMSContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  useEffect(() => {
    const loadPage = async () => {
      const { data: page } = await supabase
        .from('pages')
        .select('title, meta_description')
        .eq('slug', 'pricing')
        .eq('active', true)
        .maybeSingle();

      if (page) {
        document.title = page.title;
        
        if (page.meta_description) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', page.meta_description);
          }
        }
      }
    };

    loadPage();
  }, []);

  return (
    <div className="min-h-screen">
      <HreflangTags pageSlug="/pricing" />
      <Header />
      <main>
        {/* Hero Section */}
        <PricingHeroNew textContent={textContent} />

        {/* Tier Cards - Launch vs Scale */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {!isLoading && (
                <>
                  <LaunchTierCard config={launch} />
                  <ScaleTierCard config={scale} tiers={scaleTiers} />
                </>
              )}
              {isLoading && (
                <>
                  <div className="h-96 rounded-lg bg-muted animate-pulse" />
                  <div className="h-96 rounded-lg bg-muted animate-pulse" />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Scale Tier Breakdown Table */}
        <section className="py-16 bg-muted/30 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Scale Tier Breakdown</h2>
              <p className="text-muted-foreground">
                Your rate decreases automatically as your business grows
              </p>
            </div>
            
            {!isLoading && (
              <>
                <ScaleTierTable 
                  tiers={showAllTiers ? scaleTiers : scaleTiers.slice(0, 5)} 
                />
                
                {scaleTiers.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllTiers(!showAllTiers)}
                      className="gap-2"
                    >
                      {showAllTiers ? (
                        <>
                          Show Less <ChevronUp className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Show All {scaleTiers.length} Tiers <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
            {isLoading && (
              <div className="h-64 rounded-lg bg-muted animate-pulse" />
            )}
          </div>
        </section>

        {/* Interactive Calculator */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="container max-w-3xl px-4 sm:px-6 lg:px-8">
            <PricingComparisonCalculator />
          </div>
        </section>

        {/* No Hidden Costs Banner */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <NoHiddenCosts textContent={textContent} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <PricingFAQ />
          </div>
        </section>

        {/* Book a Demo CTA */}
        <section className="py-16 text-center animate-fade-in" style={{ animationDelay: '350ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Book a demo to see how our platform can help your business grow.
            </p>
            <Button size="lg" className="text-lg px-8" asChild>
              <a 
                href="https://calendly.com/joachim-noddi/30min"
                target="_blank"
                rel="noopener noreferrer"
              >
                {getCMSContent('button_book_demo', 'Book a Demo')}
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PricingDetailed;
