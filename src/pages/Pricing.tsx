import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Zap, TrendingDown, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { PricingSummaryTable } from "@/components/pricing/PricingSummaryTable";
import { PricingFeatureCards } from "@/components/pricing/PricingFeatureCards";
import { StaticPricingExamples } from "@/components/pricing/StaticPricingExamples";
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
            Transparent revenue-based pricing with no separate licence fees. See exactly what you'll pay.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: Zap, text: 'No upfront costs' },
              { icon: TrendingDown, text: 'Rates decrease as you grow' },
              { icon: Shield, text: 'Cancel anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Label className="text-sm text-muted-foreground">View pricing in:</Label>
            <ToggleGroup
              type="single"
              value={currency}
              onValueChange={(value) => value && setCurrency(value)}
              className="bg-muted/50 rounded-lg p-1"
            >
              <ToggleGroupItem
                value="EUR"
                aria-label="Euro"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                EUR (€)
              </ToggleGroupItem>
              <ToggleGroupItem
                value="NOK"
                aria-label="Norwegian Krone"
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                NOK (kr)
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Summary Table */}
        <section className="animate-fade-in">
          <PricingSummaryTable currency={currency} />
        </section>

        {/* Feature Cards */}
        <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <PricingFeatureCards currency={currency} />
        </section>

        {/* Static Examples */}
        <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <StaticPricingExamples currency={currency} />
        </section>

        {/* Rate Reduction Chart */}
        <section className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <RateReductionChart />
        </section>

        {/* Advanced Calculator CTA */}
        <section className="text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
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

        {/* How It Works */}
        <section className="max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            How Our Pricing Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-6">
              <div className="text-primary text-2xl font-bold mb-2">Small/Basic</div>
              <p className="text-muted-foreground text-sm">
                Lower volume businesses get higher support with competitive rates
              </p>
            </Card>
            <Card className="glass-card p-6">
              <div className="text-primary text-2xl font-bold mb-2">Large</div>
              <p className="text-muted-foreground text-sm">
                Growing businesses benefit from reduced rates as revenue scales
              </p>
            </Card>
            <Card className="glass-card p-6">
              <div className="text-primary text-2xl font-bold mb-2">Enterprise</div>
              <p className="text-muted-foreground text-sm">
                High-volume businesses get the lowest rates with maximum value
              </p>
            </Card>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            Our revenue-based model ensures you always pay a fair rate. The usage fee includes everything—no 
            separate licence charges. As your business grows, your effective rate automatically decreases 
            continuously across 10 tiers—no negotiations needed.
          </p>
        </section>

        {/* Final CTA */}
        <section className="animate-fade-in" style={{ animationDelay: '800ms' }}>
          <Card className="glass-card p-12 text-center bg-gradient-primary/5 border-primary/20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Ready to transform your customer experience?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join leading businesses that have reduced costs while improving customer satisfaction
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Book a Demo
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/contact">Contact Sales</Link>
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
