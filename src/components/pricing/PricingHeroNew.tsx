import { Rocket, TrendingUp } from 'lucide-react';

interface PricingHeroNewProps {
  textContent?: Array<{ element_type: string; content: string }>;
}

export function PricingHeroNew({ textContent }: PricingHeroNewProps) {
  const getCMSContent = (elementType: string, fallback: string): string => {
    const item = textContent?.find(tc => tc.element_type === elementType);
    return item?.content || fallback;
  };

  return (
    <section className="pt-32 pb-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-container px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
          {getCMSContent('hero_title', 'Simple, Transparent Pricing')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {getCMSContent('hero_subtitle', 'Choose the plan that fits your business. No hidden fees, no surprises.')}
        </p>
        
        {/* Quick tier overview */}
        <div className="flex flex-wrap justify-center gap-4 max-w-lg mx-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Rocket className="w-4 h-4" />
            <span className="font-medium">Launch</span>
            <span className="text-muted-foreground">— Fixed + 3%</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">Scale</span>
            <span className="text-muted-foreground">— Tiered rates</span>
          </div>
        </div>
      </div>
    </section>
  );
}
