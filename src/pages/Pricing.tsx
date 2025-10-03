import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, TrendingDown, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { PricingFeatureCards } from "@/components/pricing/PricingFeatureCards";
import { RateReductionChart } from "@/components/pricing/RateReductionChart";
import { PricingCalculatorModal } from "@/components/pricing/PricingCalculatorModal";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { DEFAULT_CURRENCY } from "@/config/pricing";

const Pricing = () => {
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('noddi-pricing-currency');
    return saved || DEFAULT_CURRENCY;
  });
  const [contractType, setContractType] = useState<'none' | 'monthly' | 'yearly'>('none');

  useEffect(() => {
    document.title = "Transparent Revenue-Based Pricing | Noddi";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Pay as you grow with clear, tier-based pricing. No hidden fees, no separate licence charges. See exactly what you\'ll pay.');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('noddi-pricing-currency', currency);
  }, [currency]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20 space-y-20">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Pay as you grow
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            Transparent revenue-based pricing with no separate licence fees or free tiers. Pay from your first euro, with rates that decrease as you grow.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: Sparkles, text: 'World class UX' },
              { icon: TrendingDown, text: 'Rates decrease as you grow' },
              { icon: Zap, text: 'Save costs with efficient operations' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Currency and Contract Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 w-full max-w-3xl mx-auto">
            <div className="flex flex-col gap-2 w-full">
              <Label className="text-sm text-muted-foreground">View pricing in:</Label>
              <ToggleGroup
                type="single"
                value={currency}
                onValueChange={(value) => value && setCurrency(value)}
                className="bg-muted/50 rounded-lg p-1 w-full"
              >
                <ToggleGroupItem
                  value="EUR"
                  aria-label="Euro"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-3"
                >
                  EUR (€)
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="NOK"
                  aria-label="Norwegian Krone"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-3"
                >
                  NOK (kr)
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Label className="text-sm text-muted-foreground">Contract type:</Label>
              <ToggleGroup
                type="single"
                value={contractType}
                onValueChange={(value) => value && setContractType(value as 'none' | 'monthly' | 'yearly')}
                className="bg-muted/50 rounded-lg p-1 w-full"
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
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2"
                >
                  Monthly <span className="hidden sm:inline text-xs ml-1 opacity-75">(Save 15%)</span>
                  <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-15%</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="yearly"
                  aria-label="Yearly Contract (Save 25%)"
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1 text-xs sm:text-sm px-2"
                >
                  Yearly <span className="hidden sm:inline text-xs ml-1 opacity-75">(Save 25%)</span>
                  <span className="sm:hidden text-[10px] ml-0.5 opacity-75">-25%</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <PricingFeatureCards currency={currency} contractType={contractType} />
        </section>

        {/* Advanced Calculator CTA */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Card className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Need a Precise Estimate?
            </h2>
            <p className="text-muted-foreground mb-6">
              Enter your exact revenue figures to calculate your specific pricing
            </p>
            <Button size="lg" onClick={() => setIsCalculatorOpen(true)}>
              <Calculator className="w-5 h-5 mr-2" />
              Open Advanced Calculator
            </Button>
          </Card>
        </section>

        {/* Rate Reduction Chart */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <RateReductionChart />
        </section>

        {/* Value Proposition */}
        <section className="animate-fade-in" style={{ animationDelay: '500ms' }}>
          <Card className="glass-card p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  World-class UX
                </div>
                <p className="text-sm text-muted-foreground">High NPS scores from satisfied customers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  AI-Powered
                </div>
                <p className="text-sm text-muted-foreground">Intelligent scheduling & customer service</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  Save 30%
                </div>
                <p className="text-sm text-muted-foreground">Reduce customer service costs significantly</p>
              </div>
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="animate-fade-in" style={{ animationDelay: '600ms' }}>
          <PricingFAQ />
        </section>

        {/* Final CTA */}
        <section className="animate-fade-in" style={{ animationDelay: '700ms' }}>
          <Card className="glass-card p-12 text-center bg-gradient-primary/5 border-primary/20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to transform your customer experience?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join leading businesses that have reduced costs while improving customer satisfaction
            </p>
            <div className="flex justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <a 
                  href="https://calendly.com/joachim-noddi/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book a Demo
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
