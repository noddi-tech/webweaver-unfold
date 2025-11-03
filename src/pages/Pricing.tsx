import { useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { NoHiddenCosts } from "@/components/pricing/NoHiddenCosts";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import PricingHero from "@/components/pricing/PricingHero";
import { supabase } from "@/integrations/supabase/client";
import { useTextContent } from "@/hooks/useTextContent";
import { HreflangTags } from "@/components/HreflangTags";
import { LockedText } from "@/components/LockedText";

const Pricing = () => {
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

  return (
    <div className="min-h-screen">
      <HreflangTags pageSlug="/pricing" />
      <Header />
      <main>
        {/* Hero Section */}
        <PricingHero textContent={textContent} />

        {/* No Hidden Costs Banner */}
        <section className="pt-0 pb-section animate-fade-in" style={{ animationDelay: '175ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <NoHiddenCosts textContent={textContent} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <PricingFAQ />
          </div>
        </section>

        {/* Book a Demo CTA - After FAQ */}
        <section className="py-section text-center animate-fade-in" style={{ animationDelay: '650ms' }}>
          <div className="container max-w-container px-4 sm:px-6 lg:px-8">
            <Button size="lg" className="text-lg px-8 accessible-focus" asChild>
              <a href="/contact">
                <LockedText reason="CTA button text">
                  {getCMSContent('button_book_demo', 'Contact us')}
                </LockedText>
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
