import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PricingHero from "@/components/pricing/PricingHero";
import { PricingSlider } from "@/components/pricing/PricingSlider";
import { RateReductionChart } from "@/components/pricing/RateReductionChart";
import { NoHiddenCosts } from "@/components/pricing/NoHiddenCosts";
import { PricingCalculatorModal } from "@/components/pricing/PricingCalculatorModal";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { DEFAULT_CURRENCY } from "@/config/pricing";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";

const Pricing = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('noddi-pricing-currency');
    return saved || DEFAULT_CURRENCY;
  });
  const [contractType, setContractType] = useState<'none' | 'monthly' | 'yearly'>('none');
  
  // Fetch CMS content for pricing page
  const { textContent, loading: contentLoading } = useTextContent('pricing');
  
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

  useEffect(() => {
    localStorage.setItem('noddi-pricing-currency', currency);
  }, [currency]);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <PricingHero textContent={textContent} />

        {/* Interactive Revenue Slider */}
        <section className="py-section animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <PricingSlider 
              currency={currency}
              onCurrencyChange={setCurrency}
              contractType={contractType}
              onContractTypeChange={setContractType}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
              textContent={textContent}
            />
          </div>
        </section>

        {/* No Hidden Costs Banner */}
        <section className="py-section animate-fade-in" style={{ animationDelay: '175ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <NoHiddenCosts textContent={textContent} onOpenCalculator={() => setIsCalculatorOpen(true)} />
          </div>
        </section>

        {/* Contract Type Selector - Now integrated in PricingSlider */}
        {/* <section className="max-w-md mx-auto">
          <div className="flex flex-col gap-3">
            <Label className="text-sm text-foreground text-center">{getCMSContent('label', 'Contract type:')}</Label>
            <ToggleGroup
              type="single"
              value={contractType}
              onValueChange={(value) => value && setContractType(value as 'none' | 'monthly' | 'yearly')}
              className="liquid-glass-tab rounded-lg p-1 w-full"
            >
              <ToggleGroupItem
                value="none"
                aria-label="No Contract"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2"
              >
                None
              </ToggleGroupItem>
              <ToggleGroupItem
                value="monthly"
                aria-label="Monthly Contract (Save 15%)"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2 flex items-center justify-center whitespace-nowrap"
              >
                Monthly <span className="hidden sm:inline text-xs ml-1 opacity-75 whitespace-nowrap">(Save 15%)</span>
                <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-15%</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                aria-label="Yearly Contract (Save 25%)"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2 flex items-center justify-center whitespace-nowrap"
              >
                Yearly <span className="hidden sm:inline text-xs ml-1 opacity-75 whitespace-nowrap">(Save 25%)</span>
                <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-25%</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </section> */}

        {/* Feature Cards - Hidden for now */}
        {/* <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <PricingFeatureCards 
            currency={currency} 
            contractType={contractType}
            textContent={textContent}
          />
        </section> */}

        {/* Rate Reduction Chart */}
        <section className="py-section animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <RateReductionChart currency={currency} />
          </div>
        </section>

        {/* Value Proposition */}
        <section className="hidden animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Card className="liquid-glass p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {getCMSContent('h3_ux', 'World-class UX')}
                </div>
                <p className="text-sm text-muted-foreground">{getCMSContent('p_ux', 'High retention thanks to seamless support experience.')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {getCMSContent('h3_ai', 'AI-Powered')}
                </div>
                <p className="text-sm text-muted-foreground">{getCMSContent('p_ai', 'Smart prediction, routing, and automation.')}</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {getCMSContent('h3_save', 'Save 30%')}
                </div>
                <p className="text-sm text-muted-foreground">{getCMSContent('p_save', 'Optimize agent costs while scaling.')}</p>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="py-section animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <PricingFAQ />
          </div>
        </section>

        {/* Book a Demo CTA - After FAQ */}
        <section className="py-section text-center animate-fade-in" style={{ animationDelay: '650ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
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

        {/* Final CTA */}
        <section className="hidden animate-fade-in" style={{ animationDelay: '700ms' }}>
          <Card className="liquid-glass p-12 text-center bg-gradient-primary/5 border-primary/20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              {getCMSContent('h2', 'Ready to transform your support experience?')}
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {getCMSContent('p', 'Join leaders using Noddi to boost loyalty and reduce costs.')}
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
                <a 
                  href="https://calendly.com/joachim-noddi/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getCMSContent('button', 'Book a Demo')}
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <Footer />

      {/* Calculator Modal */}
      <PricingCalculatorModal open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen} />
    </div>
  );
};

export default Pricing;
