import { useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { usePricingConfig } from "@/hooks/usePricingConfig";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";
import { HreflangTags } from "@/components/HreflangTags";
import { useBookingLink } from "@/hooks/useSalesContacts";
import { useCurrency } from "@/contexts/CurrencyContext";
import { CurrencySwitcher } from "@/components/pricing/CurrencySwitcher";
import { Check, Rocket, TrendingUp, Calendar, ArrowRight, Sparkles, Building2, Shield } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Pricing = () => {
  const { launch, scale, isLoading } = usePricingConfig();
  const { url: bookingUrl, label: bookingLabel } = useBookingLink();
  const { formatAmount } = useCurrency();
  
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

  const valueProps = [
    {
      icon: Shield,
      title: "No hidden fees",
      description: "What you see is what you pay. No surprise charges."
    },
    {
      icon: TrendingUp,
      title: "Scales with you",
      description: "Your rate decreases as your business grows."
    },
    {
      icon: Building2,
      title: "One platform",
      description: "Every function. No integration headaches."
    },
    {
      icon: Sparkles,
      title: "Launch in days",
      description: "Not months. We handle the complexity."
    }
  ];

  return (
    <div className="min-h-screen">
      <HreflangTags pageSlug="/pricing" />
      <Header />
      <main>
        {/* Hero Section - Navio Brand Gradient */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Gradient background */}
          <div 
            className="absolute inset-0 -z-10" 
            style={{ background: 'var(--gradient-hero)' }}
          />
          {/* Mesh overlay for depth */}
          <div 
            className="absolute inset-0 -z-10 opacity-30" 
            style={{ background: 'var(--gradient-mesh-cosmic)' }}
          />
          
          <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
              Transparent Pricing
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
              Pricing that scales with you
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
              No surprises. No hidden fees. Just simple pricing that grows with your business.
            </p>
            
            {/* Tier pills */}
            <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto mb-12">
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                <Rocket className="w-5 h-5" />
                <span className="font-semibold">Launch</span>
                <span className="text-white/70">Single location</span>
              </div>
              <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">Scale</span>
                <span className="text-white/70">Multi-location</span>
              </div>
            </div>
            
            {/* Primary CTA */}
            <Button 
              size="lg" 
              className="text-lg px-8 bg-white text-primary hover:bg-white/90 gap-2"
              asChild
            >
              <a 
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Calendar className="w-5 h-5" />
                {bookingLabel}
              </a>
            </Button>
            <p className="text-white/60 text-sm mt-4">
              We'll create a custom proposal for you
            </p>
            
            {/* Currency Switcher */}
            <div className="mt-6">
              <CurrencySwitcher darkMode showLabel />
            </div>
          </div>
        </section>

        {/* Value Propositions */}
        <section className="py-20 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                One platform. Every function.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From booking to backend automation. No integrations. No waiting.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {valueProps.map((prop, index) => (
                <Card key={index} className="border-0 shadow-sm bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CardContent className="pt-6">
                    <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                      <prop.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{prop.title}</h3>
                    <p className="text-muted-foreground text-sm">{prop.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Simple Tier Overview */}
        <section className="py-20 bg-muted/30 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Two plans. Simple choice.
              </h2>
              <p className="text-lg text-muted-foreground">
                Pick the one that fits your business. Upgrade anytime.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Launch Card */}
              <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Rocket className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Launch</h3>
                      <p className="text-muted-foreground text-sm">Get started fast</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    Perfect for single-location businesses ready to modernize their operations.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {['Single location setup', 'Full platform access', 'Standard support', 'Basic analytics'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-2xl font-bold">{formatAmount(launch.fixedMonthly)}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      +{(launch.revenuePercentage * 100).toFixed(0)}% of platform revenue
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Scale Card */}
              <Card className="relative overflow-hidden border-2 border-primary shadow-lg">
                <Badge className="absolute -top-[2px] -right-[2px] rounded-none rounded-bl-lg rounded-tr-lg bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
                
                <CardContent className="pt-8 pb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">Scale</h3>
                      <p className="text-muted-foreground text-sm">Grow without limits</p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6">
                    Built for multi-location businesses ready to scale operations across sites.
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {['Unlimited locations', 'Priority support', 'Advanced analytics', 'API access', 'Custom integrations'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
                    <div className="flex items-baseline justify-center gap-1 mb-1">
                      <span className="text-2xl font-bold">{formatAmount(scale.fixedMonthly)}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      +{formatAmount(scale.perDepartment)}/department/month
                    </p>
                    <p className="text-sm font-medium text-primary">
                      Volume-based rates — better value as you grow
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section className="py-16 bg-muted/30 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <PricingFAQ />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 text-center animate-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's find your perfect plan
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Book a 30-minute call. We'll discuss your needs and create a custom proposal.
            </p>
            <Button size="lg" className="text-lg px-8 gap-2" asChild>
              <a 
                href={bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {bookingLabel}
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            <p className="text-muted-foreground text-sm mt-4">
              No commitment. No pressure. Just a conversation.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;