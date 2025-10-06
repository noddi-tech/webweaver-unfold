import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, TrendingDown, Shield, Sparkles, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { PricingFeatureCards } from "@/components/pricing/PricingFeatureCards";
import { PricingSlider } from "@/components/pricing/PricingSlider";
import { RateReductionChart } from "@/components/pricing/RateReductionChart";
import { NoHiddenCosts } from "@/components/pricing/NoHiddenCosts";
import { PricingCalculatorModal } from "@/components/pricing/PricingCalculatorModal";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_CURRENCY } from "@/config/pricing";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";

interface Page {
  id: string;
  name: string;
  slug: string;
  title: string;
  meta_description?: string;
  default_background_token: string;
  default_text_token: string;
}

const getBackgroundClass = (token?: string) => {
  const mapping: Record<string, string> = {
    background: 'bg-background',
    card: 'bg-card',
    muted: 'bg-muted',
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    accent: 'bg-accent',
    'gradient-primary': 'bg-gradient-primary',
    'gradient-background': 'bg-gradient-background',
    'gradient-hero': 'bg-gradient-hero',
    'gradient-subtle': 'bg-gradient-subtle',
    transparent: 'bg-transparent',
  };
  return mapping[token || 'background'] || 'bg-background';
};

const getTextClass = (token?: string) => {
  const mapping: Record<string, string> = {
    foreground: 'text-foreground',
    'muted-foreground': 'text-muted-foreground',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    'gradient-text': 'gradient-text',
    destructive: 'text-destructive',
  };
  return mapping[token || 'foreground'] || 'text-foreground';
};

const Pricing = () => {
  const [pageData, setPageData] = useState<Page | null>(null);
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
        .select('*')
        .eq('slug', 'pricing')
        .eq('active', true)
        .maybeSingle();

      if (page) {
        setPageData(page);
        document.title = page.title;
        
        if (page.meta_description) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', page.meta_description);
          }
        }

        // Apply page background to body
        const backgroundClass = getBackgroundClass(page.default_background_token);
        const textClass = getTextClass(page.default_text_token);
        
        document.body.className = document.body.className
          .replace(/bg-\S+/g, '')
          .replace(/text-\S+/g, '')
          .trim();
        document.body.classList.add(...backgroundClass.split(' '), ...textClass.split(' '));
      }
    };

    loadPage();
  }, []);

  useEffect(() => {
    return () => {
      document.body.className = '';
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('noddi-pricing-currency', currency);
  }, [currency]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20 space-y-20">
        {/* Hero Section */}
        <div className="text-left md:text-center max-w-4xl md:mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            {getCMSContent('h1', 'Pay as you grow')}
          </h1>
          <p className="text-xl md:text-2xl text-primary">
            {getCMSContent('p', 'Transparent revenue-based pricing that scales with your business')}
          </p>
          <div className="flex flex-wrap justify-start md:justify-center gap-6 text-sm">
            {[
              { icon: Sparkles, text: getCMSContent('usp_1', 'World class UX') },
              { icon: TrendingDown, text: getCMSContent('usp_2', 'Rates decrease as you grow') },
              { icon: Zap, text: getCMSContent('usp_3', 'Optimize your margin, not your headcount') },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-primary">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Clarifier Message */}
          <div className="max-w-2xl md:mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {getCMSContent('clarifier', 'Your cost is a small percentage of your processed revenue — this calculator shows what that means for your business.')}
              </p>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="flex justify-start md:justify-center pt-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm text-muted-foreground">{getCMSContent('label_currency', 'View pricing in:')}</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[180px] bg-background/95 border-border text-foreground">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-md border-border z-50">
                  <SelectItem value="EUR">🇪🇺 EUR (€)</SelectItem>
                  <SelectItem value="USD">🇺🇸 USD ($)</SelectItem>
                  <SelectItem value="GBP">🇬🇧 GBP (£)</SelectItem>
                  <SelectItem value="SEK">🇸🇪 SEK (kr)</SelectItem>
                  <SelectItem value="DKK">🇩🇰 DKK (kr)</SelectItem>
                  <SelectItem value="NOK">🇳🇴 NOK (kr)</SelectItem>
                  <SelectItem value="CHF">🇨🇭 CHF (Fr)</SelectItem>
                  <SelectItem value="PLN">🇵🇱 PLN (zł)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Interactive Revenue Slider */}
        <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <PricingSlider 
            currency={currency}
            contractType={contractType}
            onContractTypeChange={setContractType}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            textContent={textContent}
          />
        </section>

        {/* No Hidden Costs Banner */}
        <section className="animate-fade-in" style={{ animationDelay: '175ms' }}>
          <NoHiddenCosts textContent={textContent} />
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

        {/* Advanced Calculator CTA */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="liquid-glass p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {getCMSContent('h2', 'Need a Precise Estimate?')}
            </h2>
            <p className="text-muted-foreground mb-6">
              {getCMSContent('p', 'Enter your revenue and service mix to see your cost.')}
            </p>
            <Button size="lg" onClick={() => setIsCalculatorOpen(true)} className="accessible-focus">
              <Calculator className="w-5 h-5 mr-2" />
              {getCMSContent('button', 'Open Advanced Calculator')}
            </Button>
          </Card>
        </section>

        {/* Rate Reduction Chart */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <RateReductionChart currency={currency} />
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
        <section className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <PricingFAQ />
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
