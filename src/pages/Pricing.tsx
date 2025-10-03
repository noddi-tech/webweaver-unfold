import { useEffect, useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Calculator, Zap, TrendingUp, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingCalculator } from "@/components/pricing/PricingCalculator";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta_text: string;
  cta_url?: string;
}

const Pricing = () => {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Pricing | Your Plans";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Choose the perfect plan for your needs');
    }

    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("pricing_plans")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setPlans((data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features.filter((f): f is string => typeof f === 'string')
          : []
      })));
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading pricing plans...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-6 pt-32 pb-20">
        {/* Hero Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
            Pay as you grow
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Revenue-based pricing that scales with your success. Only pay for what you use.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            {[
              { icon: Zap, text: 'No upfront costs' },
              { icon: TrendingUp, text: 'Scale automatically' },
              { icon: Shield, text: 'Cancel anytime' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground">
                <item.icon className="w-5 h-5 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition */}
        <div className="mb-16">
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
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="calculator" className="w-full max-w-7xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Calculate Your Price
            </TabsTrigger>
            <TabsTrigger value="simple">Simple Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-12">
            {/* Pricing Calculator */}
            <PricingCalculator />

            {/* How It Works */}
            <div className="max-w-4xl mx-auto">
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
                Our revenue-based model ensures you always pay a fair rate. As your business grows, 
                your effective rate automatically decreases—no negotiations needed.
              </p>
            </div>

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto">
              <Card className="glass-card p-12 text-center bg-gradient-primary/5 border-primary/20">
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
            </div>
          </TabsContent>

          <TabsContent value="simple">
            {/* Original Simple Pricing Plans */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Prefer Simple Fixed Plans?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose from our straightforward pricing tiers. All plans include a 14-day free trial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <Card 
                  key={plan.name} 
                  className={`p-8 relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground ml-1">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.cta_url ? (
                    <Link to={plan.cta_url} className="block">
                      <Button 
                        className="w-full" 
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta_text}
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta_text}
                    </Button>
                  )}
                </Card>
              ))}
            </div>

            <div className="text-center mt-16">
              <p className="text-muted-foreground">
                Need a custom plan? <a href="/contact" className="text-primary hover:underline">Contact us</a>
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
