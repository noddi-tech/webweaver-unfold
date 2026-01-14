import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PricingHeroNew } from "@/components/pricing/PricingHeroNew";
import { LaunchTierCard } from "@/components/pricing/LaunchTierCard";
import { ScaleTierCard } from "@/components/pricing/ScaleTierCard";
import { ScaleTierTable } from "@/components/pricing/ScaleTierTable";
import { PricingComparisonCalculator, CalculatorValues } from "@/components/pricing/PricingComparisonCalculator";

import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { OfferGeneratorPanel } from "@/components/pricing/OfferGeneratorPanel";
import { OffersHistory } from "@/components/pricing/OffersHistory";
import { usePricingConfig } from "@/hooks/usePricingConfig";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";
import { HreflangTags } from "@/components/HreflangTags";
import { useBookingLink } from "@/hooks/useSalesContacts";
import { ChevronDown, ChevronUp, Lock, Calculator, FileText, Users, Copy, Check } from 'lucide-react';
import { CurrencySwitcher } from "@/components/pricing/CurrencySwitcher";
import { useUserRole } from "@/hooks/useUserRole";
import { Skeleton } from "@/components/ui/skeleton";

const PricingDetailed = () => {
  const [showAllTiers, setShowAllTiers] = useState(false);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const { launch, scale, scaleTiers, isLoading } = usePricingConfig();
  const { isAdmin, isEditor, loading: roleLoading } = useUserRole();
  const { url: bookingUrl, label: bookingLabel } = useBookingLink();
  
  // Shared state for calculator values
  const [calculatorValues, setCalculatorValues] = useState<CalculatorValues>({
    annualRevenue: 1_000_000,
    locations: 1,
    recommendation: 'launch',
  });
  
  const handleCalculatorChange = useCallback((values: CalculatorValues) => {
    setCalculatorValues(values);
  }, []);

  const handleCopyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy booking link:', err);
    }
  };
  
  // Fetch CMS content for pricing page
  const { textContent } = useTextContent('pricing');
  
  // Helper to get CMS content with validation
  const getCMSContent = (elementType: string, fallback: string = ''): string => {
    const item = textContent.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  useEffect(() => {
    // Check auth state
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });
    supabase.auth.getSession().then(({ data }) => setAuthenticated(!!data.session?.user));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const loadPage = async () => {
      const { data: page } = await supabase
        .from('pages')
        .select('title, meta_description')
        .eq('slug', 'pricing')
        .eq('active', true)
        .maybeSingle();

      if (page) {
        document.title = page.title + ' (Internal)';
        
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

  // Show loading state while checking auth
  if (authenticated === null || roleLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-32 pb-16">
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-4">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-6 w-96" />
              <div className="grid md:grid-cols-2 gap-8 mt-8 w-full max-w-4xl">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Not logged in at all - redirect to auth
  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but no admin/editor role - redirect to public pricing
  if (!isAdmin && !isEditor) {
    return <Navigate to="/pricing" replace />;
  }

  return (
    <div className="min-h-screen">
        <HreflangTags pageSlug="/pricing_detailed" />
        <Header />
        <main>
          {/* Internal Access Banner */}
          <div className="bg-primary text-primary-foreground py-2 text-sm">
            <div className="container flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Internal Sales Tool — Not visible to public</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyBookingLink}
                className="h-7 gap-2 text-primary-foreground hover:bg-primary-foreground/10"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Booking Link</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Hero Section */}
          <PricingHeroNew textContent={textContent} />

          {/* Tier Cards - Launch vs Scale */}
          <section className="py-16 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
              {/* Currency Switcher above cards */}
              <div className="flex justify-end mb-6">
                <CurrencySwitcher />
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {!isLoading && (
                  <>
                    <LaunchTierCard config={launch} />
                    <ScaleTierCard config={scale} tiers={scaleTiers} showDetailedRates />
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

          {/* Sales Tools Section */}
          <section className="py-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="container max-w-5xl px-4 sm:px-6 lg:px-8">
              <Tabs defaultValue="calculator" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="calculator" className="gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculator
                  </TabsTrigger>
                  <TabsTrigger value="offer" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Create Offer
                  </TabsTrigger>
                  <TabsTrigger value="history" className="gap-2">
                    <Users className="h-4 w-4" />
                    Offers History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="calculator">
                  <PricingComparisonCalculator onValuesChange={handleCalculatorChange} />
                </TabsContent>
                
                <TabsContent value="offer">
                  <OfferGeneratorPanel 
                    calculatorValues={calculatorValues}
                  />
                </TabsContent>
                
                <TabsContent value="history">
                  <OffersHistory />
                </TabsContent>
              </Tabs>
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
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getCMSContent('button_book_demo', bookingLabel)}
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